import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@salescareerhub/db';
import { verifyIdToken } from '@salescareerhub/auth/server';

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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';

    const reviews = await prisma.companyReview.findMany({
      where: { status },
      include: {
        company: { select: { name: true, slug: true } },
        user: { select: { email: true, displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: reviews });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });

    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ success: false, error: 'ID und Status erforderlich' }, { status: 400 });

    const review = await prisma.companyReview.update({ where: { id }, data: { status } });

    // Notify reviewer
    await prisma.notification.create({
      data: {
        userId: review.userId,
        type: status === 'approved' ? 'review_approved' : 'review_rejected',
        title: status === 'approved' ? 'Bewertung freigeschaltet' : 'Bewertung abgelehnt',
        message: `Deine Unternehmensbewertung wurde ${status === 'approved' ? 'freigeschaltet' : 'abgelehnt'}.`,
        link: '/dashboard/candidate',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.id, action: `review_${status}`, entity: 'CompanyReview', entityId: id,
        details: `Review ${status}`,
      },
    });

    return NextResponse.json({ success: true, data: review });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}
