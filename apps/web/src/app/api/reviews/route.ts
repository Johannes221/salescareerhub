import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@salescareerhub/db';
import { verifyIdToken } from '@salescareerhub/auth/server';

async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    return prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });

    const body = await req.json();
    const {
      companyId, compensation, quotaRealism, leadQuality, careerOpportunities,
      productMarketFit, management, culture, workLifeBalance,
      reviewText, pros, cons, roleAtCompany, gdprConsent,
    } = body;

    if (!companyId) return NextResponse.json({ success: false, error: 'Unternehmen erforderlich' }, { status: 400 });
    if (!gdprConsent) return NextResponse.json({ success: false, error: 'DSGVO-Einwilligung erforderlich' }, { status: 400 });

    // Calculate overall rating
    const dimensions = [compensation, quotaRealism, leadQuality, careerOpportunities, productMarketFit, management, culture, workLifeBalance];
    const validDimensions = dimensions.filter((d) => d && d > 0);
    const overallRating = validDimensions.length > 0
      ? validDimensions.reduce((sum, d) => sum + d, 0) / validDimensions.length
      : 0;

    // Check if user already reviewed this company
    const existing = await prisma.companyReview.findFirst({
      where: { companyId, userId: user.id },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Du hast dieses Unternehmen bereits bewertet' }, { status: 409 });
    }

    const review = await prisma.companyReview.create({
      data: {
        companyId, userId: user.id,
        compensation: compensation || 0, quotaRealism: quotaRealism || 0,
        leadQuality: leadQuality || 0, careerOpportunities: careerOpportunities || 0,
        productMarketFit: productMarketFit || 0, management: management || 0,
        culture: culture || 0, workLifeBalance: workLifeBalance || 0,
        overallRating, reviewText, pros, cons, roleAtCompany,
        status: 'pending',
      },
    });

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: 'admin' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id, type: 'new_review_pending',
          title: 'Neue Bewertung zur Prüfung',
          message: `Neue Unternehmensbewertung eingereicht.`,
          link: '/dashboard/admin/reviews',
        },
      });
    }

    // DSGVO Audit
    await prisma.auditLog.create({
      data: {
        userId: user.id, action: 'review_submitted', entity: 'CompanyReview', entityId: review.id,
        details: `Bewertung eingereicht. DSGVO-Einwilligung erteilt (Art. 6 Abs. 1 lit. a DSGVO). Review wird moderiert.`,
      },
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    console.error('Review error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Speichern' }, { status: 500 });
  }
}
