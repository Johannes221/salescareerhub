import { NextRequest, NextResponse } from 'next/server';
import { isUser, requireAdmin } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { buildDailySeries, getAnalyticsWindowStart } from '@/lib/analytics';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAdmin(req);
    if (!isUser(user)) return user;

    const analyticsStart = getAnalyticsWindowStart(7);

    const [
      totalUsers,
      totalJobs,
      pendingJobs,
      totalCompanies,
      totalCandidates,
      totalApplications,
      pendingReviews,
      totalLeads,
      recentJobViews,
      recentCompanyViews,
      recentSavedJobs,
      recentApplications,
      recentActivityEvents,
      recentApplicationEvents,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.job.count({ where: { approvalStatus: 'pending' } }),
      prisma.company.count(),
      prisma.candidateProfile.count(),
      prisma.application.count(),
      prisma.companyReview.count({ where: { status: 'pending' } }),
      prisma.lead.count({ where: { status: 'new' } }),
      prisma.analyticsEvent.count({ where: { eventType: 'job_viewed', createdAt: { gte: analyticsStart } } }),
      prisma.analyticsEvent.count({ where: { eventType: 'company_profile_viewed', createdAt: { gte: analyticsStart } } }),
      prisma.analyticsEvent.count({ where: { eventType: 'job_saved', createdAt: { gte: analyticsStart } } }),
      prisma.application.count({ where: { createdAt: { gte: analyticsStart } } }),
      prisma.analyticsEvent.findMany({
        where: {
          eventType: { in: ['job_viewed', 'company_profile_viewed', 'job_saved'] },
          createdAt: { gte: analyticsStart },
        },
        select: { createdAt: true },
        take: 500, // Limit to prevent OOM
        orderBy: { createdAt: 'desc' },
      }),
      prisma.application.findMany({
        where: { createdAt: { gte: analyticsStart } },
        select: { createdAt: true },
        take: 500, // Limit to prevent OOM
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const dailyActivity = buildDailySeries([...recentActivityEvents, ...recentApplicationEvents], 7);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalJobs,
        pendingJobs,
        totalCompanies,
        totalCandidates,
        totalApplications,
        pendingReviews,
        totalLeads,
        analytics: {
          recentJobViews,
          recentCompanyViews,
          recentSavedJobs,
          recentApplications,
          dailyActivity,
        },
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}
