import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@salescareerhub/db';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const company = await prisma.company.findUnique({ where: { slug: params.slug } });
    if (!company) return NextResponse.json({ success: false, error: 'Nicht gefunden' }, { status: 404 });

    const jobs = await prisma.job.findMany({
      where: { companyId: company.id, status: 'live', approvalStatus: 'approved' },
      orderBy: { createdAt: 'desc' },
    });

    const reviews = await prisma.companyReview.findMany({
      where: { companyId: company.id, status: 'approved' },
      orderBy: { createdAt: 'desc' },
    });

    await prisma.analyticsEvent.create({ data: { eventType: 'company_profile_viewed', entityId: company.id } });

    return NextResponse.json({ success: true, data: company, jobs, reviews });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}
