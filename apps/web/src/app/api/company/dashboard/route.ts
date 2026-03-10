import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyIdToken } from '@/lib/auth/server';
import { buildDailySeries, getAnalyticsWindowStart } from '@/lib/analytics';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
    }
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      include: { company: true },
    });
    if (!user || !user.company) {
      return NextResponse.json({
        success: true,
        stats: { totalJobs: 0, liveJobs: 0, totalApplications: 0, profileViews: 0, jobViews: 0 },
        analytics: {
          recentJobViews: 0,
          recentProfileViews: 0,
          recentApplications: 0,
          dailyJobViews: [],
          dailyApplications: [],
        },
        jobs: [],
      });
    }

    const analyticsStart = getAnalyticsWindowStart(7);

    const [allJobs, liveJobs, jobs] = await Promise.all([
      prisma.job.findMany({
        where: { companyId: user.company.id },
        select: { id: true, viewCount: true },
      }),
      prisma.job.count({ where: { companyId: user.company.id, status: 'live' } }),
      prisma.job.findMany({
        where: { companyId: user.company.id },
        include: { _count: { select: { applications: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const jobIds = allJobs.map((job) => job.id);

    const [
      totalApplications,
      totalProfileViews,
      recentJobViews,
      recentProfileViews,
      recentApplications,
      recentJobViewEvents,
      recentApplicationEvents,
    ] = await Promise.all([
      prisma.application.count({ where: { job: { companyId: user.company.id } } }),
      prisma.analyticsEvent.count({ where: { eventType: 'company_profile_viewed', entityId: user.company.id } }),
      jobIds.length > 0
        ? prisma.analyticsEvent.count({
            where: { eventType: 'job_viewed', entityId: { in: jobIds }, createdAt: { gte: analyticsStart } },
          })
        : Promise.resolve(0),
      prisma.analyticsEvent.count({
        where: { eventType: 'company_profile_viewed', entityId: user.company.id, createdAt: { gte: analyticsStart } },
      }),
      prisma.application.count({ where: { job: { companyId: user.company.id }, createdAt: { gte: analyticsStart } } }),
      jobIds.length > 0
        ? prisma.analyticsEvent.findMany({
            where: { eventType: 'job_viewed', entityId: { in: jobIds }, createdAt: { gte: analyticsStart } },
            select: { createdAt: true },
          })
        : Promise.resolve([]),
      prisma.application.findMany({
        where: { job: { companyId: user.company.id }, createdAt: { gte: analyticsStart } },
        select: { createdAt: true },
      }),
    ]);

    const totalJobs = allJobs.length;
    const totalJobViews = allJobs.reduce((sum, job) => sum + job.viewCount, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalJobs,
        liveJobs,
        totalApplications,
        profileViews: totalProfileViews,
        jobViews: totalJobViews,
      },
      analytics: {
        recentJobViews,
        recentProfileViews,
        recentApplications,
        dailyJobViews: buildDailySeries(recentJobViewEvents, 7),
        dailyApplications: buildDailySeries(recentApplicationEvents, 7),
      },
      jobs,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}
