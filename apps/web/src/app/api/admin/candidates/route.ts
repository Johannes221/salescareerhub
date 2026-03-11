import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyIdToken } from '@/lib/auth/server';

async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    const user = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });
    return user?.role === 'admin' ? user : null;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });
    const candidates = await prisma.candidateProfile.findMany({ 
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to prevent OOM
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        currentRole: true,
        seniority: true,
        skills: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ success: true, data: candidates });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}
