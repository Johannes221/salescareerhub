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
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });

    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            isVerified: true,
            contactPerson: true,
            email: true,
            website: true,
            industry: true,
            fundingStage: true,
          },
        },
        applications: {
          include: {
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                currentRole: true,
                seniority: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { applications: true, savedBy: true } },
      },
    });

    if (!job) {
      return NextResponse.json({ success: false, error: 'Job nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    console.error('Admin job detail error:', error);
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}
