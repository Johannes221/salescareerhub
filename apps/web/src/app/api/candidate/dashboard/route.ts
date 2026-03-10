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
      include: { candidateProfile: true },
    });
    if (!user || !user.candidateProfile) {
      return NextResponse.json({
        success: true,
        stats: { applications: 0, savedJobs: 0, profileViews: 0, notifications: 0 },
        analytics: { recentApplications: 0, recentSavedJobs: 0, dailyApplications: [], dailySavedJobs: [] },
        applications: [],
      });
    }

    const analyticsStart = getAnalyticsWindowStart(7);

    const [
      applicationCount,
      savedJobCount,
      notificationCount,
      applications,
      recentApplications,
      recentSavedJobs,
      applicationEvents,
      savedJobEvents,
    ] = await Promise.all([
      prisma.application.count({ where: { candidateId: user.candidateProfile.id } }),
      prisma.savedJob.count({ where: { userId: user.id } }),
      prisma.notification.count({ where: { userId: user.id, isRead: false } }),
      prisma.application.findMany({
        where: { candidateId: user.candidateProfile.id },
        include: { job: { include: { company: { select: { name: true, slug: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.application.count({ where: { candidateId: user.candidateProfile.id, createdAt: { gte: analyticsStart } } }),
      prisma.savedJob.count({ where: { userId: user.id, createdAt: { gte: analyticsStart } } }),
      prisma.application.findMany({
        where: { candidateId: user.candidateProfile.id, createdAt: { gte: analyticsStart } },
        select: { createdAt: true },
      }),
      prisma.savedJob.findMany({
        where: { userId: user.id, createdAt: { gte: analyticsStart } },
        select: { createdAt: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: { applications: applicationCount, savedJobs: savedJobCount, profileViews: 0, notifications: notificationCount },
      analytics: {
        recentApplications,
        recentSavedJobs,
        dailyApplications: buildDailySeries(applicationEvents, 7),
        dailySavedJobs: buildDailySeries(savedJobEvents, 7),
      },
      applications,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}
