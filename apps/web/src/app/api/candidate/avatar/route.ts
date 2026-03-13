import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyIdToken } from '@/lib/auth/server';
import { uploadCandidateDocument } from '@/lib/storage/candidate-documents';

async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  try {
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    return prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      include: { candidateProfile: true },
    });
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'candidate' || !user.candidateProfile) {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'Bitte wähle ein Bild aus.' }, { status: 400 });
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Nur JPG, PNG und WebP sind erlaubt.' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Das Profilbild darf maximal 5 MB groß sein.' }, { status: 400 });
    }

    const upload = await uploadCandidateDocument({
      candidateId: user.candidateProfile.id,
      category: 'avatar',
      file,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: upload.fileUrl },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'candidate_avatar_updated',
        entity: 'User',
        entityId: user.id,
        details: 'Kandidaten-Profilbild aktualisiert',
      },
    });

    return NextResponse.json({ success: true, data: { avatarUrl: upload.fileUrl } });
  } catch (error) {
    console.error('Candidate avatar upload error:', error);
    return NextResponse.json({ success: false, error: 'Profilbild konnte nicht gespeichert werden.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'candidate') {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: null },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'candidate_avatar_removed',
        entity: 'User',
        entityId: user.id,
        details: 'Kandidaten-Profilbild entfernt',
      },
    });

    return NextResponse.json({ success: true, data: { avatarUrl: null } });
  } catch (error) {
    console.error('Candidate avatar delete error:', error);
    return NextResponse.json({ success: false, error: 'Profilbild konnte nicht entfernt werden.' }, { status: 500 });
  }
}
