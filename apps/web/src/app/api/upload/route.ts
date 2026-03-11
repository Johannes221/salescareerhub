import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyIdToken } from '@/lib/auth/server';

// File type validation - moved outside function to avoid recreation
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
const MAX_FILE_SIZE_KB = 10 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
    }
    
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    
    // Optimized user query - only select needed fields
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      select: { id: true, candidateProfile: { select: { id: true } } },
    });

    if (!user) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });

    const body = await req.json();
    const { fileName, fileUrl, fileType, fileSizeKb, category } = body;

    if (!fileName || !fileUrl || !fileType) {
      return NextResponse.json({ success: false, error: 'Dateiinformationen fehlen' }, { status: 400 });
    }

    // File size validation
    if (fileSizeKb && fileSizeKb > MAX_FILE_SIZE_KB) {
      return NextResponse.json({ success: false, error: 'Datei ist zu groß (max. 10 MB)' }, { status: 400 });
    }

    // File type validation
    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json({ success: false, error: 'Dateityp nicht erlaubt' }, { status: 400 });
    }

    if (!user.candidateProfile) {
      return NextResponse.json({ success: false, error: 'Kandidatenprofil erforderlich' }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        candidateId: user.candidateProfile.id,
        fileName,
        fileUrl,
        fileType,
        fileSizeKb: fileSizeKb || 0,
        category: category || 'cv',
      },
    });

    // If category is 'cv', also update the candidateProfile.cvUrl
    if (category === 'cv') {
      await prisma.candidateProfile.update({
        where: { id: user.candidateProfile.id },
        data: { cvUrl: fileUrl },
      });
    }

    // DSGVO Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'document_uploaded',
        entity: 'Document',
        entityId: document.id,
        details: `Datei "${fileName}" (${category}) hochgeladen. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung). Speicherdauer: Bis zur Löschung durch den Nutzer oder Kontolöschung.`,
      },
    });

    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Upload' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
    }
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      include: { candidateProfile: true },
    });

    if (!user?.candidateProfile) {
      return NextResponse.json({ success: true, data: [] });
    }

    const documents = await prisma.document.findMany({
      where: { candidateId: user.candidateProfile.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
    }
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      include: { candidateProfile: true },
    });

    if (!user?.candidateProfile) {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });
    }

    const { documentId } = await req.json();
    if (!documentId) return NextResponse.json({ success: false, error: 'Dokument-ID erforderlich' }, { status: 400 });

    const doc = await prisma.document.findFirst({
      where: { id: documentId, candidateId: user.candidateProfile.id },
    });
    if (!doc) return NextResponse.json({ success: false, error: 'Dokument nicht gefunden' }, { status: 404 });

    await prisma.document.delete({ where: { id: documentId } });

    // TODO: Delete file from Firebase Storage

    // DSGVO Audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'document_deleted',
        entity: 'Document',
        entityId: documentId,
        details: `Datei "${doc.fileName}" gelöscht (Art. 17 DSGVO - Recht auf Löschung).`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}
