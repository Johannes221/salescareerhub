import { NextRequest, NextResponse } from 'next/server';
import { isUser, requireAdmin } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!isUser(admin)) return admin;

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
    if (!isUser(admin)) return admin;

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
