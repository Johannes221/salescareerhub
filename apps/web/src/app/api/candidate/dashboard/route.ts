import { NextRequest, NextResponse } from 'next/server';
import { buildApplicationJourney } from '@/lib/candidate-journey';
import { prisma } from '@/lib/db';
import { verifyIdToken } from '@/lib/auth/server';
import { buildDailySeries, getAnalyticsWindowStart } from '@/lib/analytics';
import { mapJobToPublic, publicJobSelect } from '@/lib/public-jobs';
import { RECRUITING_CALL_TYPE_LABELS } from '@/lib/config';
import { buildCalendarUrl, getCandidateApplicationStage } from '@/lib/utils';

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
        stats: {
          applications: 0,
          savedJobs: 0,
          profileViews: 0,
          notifications: 0,
          scheduledCalls: 0,
          documents: 0,
        },
        analytics: {
          recentApplications: 0,
          recentSavedJobs: 0,
          dailyApplications: [],
          dailySavedJobs: [],
        },
        applications: [],
        recruitingCalls: [],
        notifications: [],
        profile: null,
        stageCounts: { Applied: 0, Screening: 0, 'Intro Sent': 0, Rejected: 0, Hired: 0 },
      });
    }

    const analyticsStart = getAnalyticsWindowStart(7);

    const [
      applicationCount,
      savedJobCount,
      notificationCount,
      documentCount,
      applications,
      applicationStatuses,
      recentApplications,
      recentSavedJobs,
      applicationEvents,
      savedJobEvents,
      recruitingCalls,
      notifications,
    ] = await Promise.all([
      prisma.application.count({ where: { candidateId: user.candidateProfile.id } }),
      prisma.savedJob.count({ where: { userId: user.id } }),
      prisma.notification.count({ where: { userId: user.id, isRead: false } }),
      prisma.document.count({ where: { candidateId: user.candidateProfile.id } }),
      prisma.application.findMany({
        where: { candidateId: user.candidateProfile.id },
        include: { job: { select: publicJobSelect } },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.application.findMany({
        where: { candidateId: user.candidateProfile.id },
        select: { status: true },
      }),
      prisma.application.count({
        where: { candidateId: user.candidateProfile.id, createdAt: { gte: analyticsStart } },
      }),
      prisma.savedJob.count({ where: { userId: user.id, createdAt: { gte: analyticsStart } } }),
      prisma.application.findMany({
        where: { candidateId: user.candidateProfile.id, createdAt: { gte: analyticsStart } },
        select: { createdAt: true },
      }),
      prisma.savedJob.findMany({
        where: { userId: user.id, createdAt: { gte: analyticsStart } },
        select: { createdAt: true },
      }),
      prisma.recruitingCall.findMany({
        where: { candidateId: user.candidateProfile.id },
        orderBy: [{ scheduledTime: 'asc' }, { createdAt: 'desc' }],
        take: 10,
      }),
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const stageCounts = applicationStatuses.reduce<Record<string, number>>((acc, application) => {
      const stage = getCandidateApplicationStage(application.status);
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, { Applied: 0, Screening: 0, 'Intro Sent': 0, Rejected: 0, Hired: 0 });

    return NextResponse.json({
      success: true,
      stats: {
        applications: applicationCount,
        savedJobs: savedJobCount,
        profileViews: 0,
        notifications: notificationCount,
        scheduledCalls: recruitingCalls.length,
        documents: documentCount,
      },
      analytics: {
        recentApplications,
        recentSavedJobs,
        dailyApplications: buildDailySeries(applicationEvents, 7),
        dailySavedJobs: buildDailySeries(savedJobEvents, 7),
      },
      applications: applications.map((application: (typeof applications)[number]) => ({
        ...application,
        job: application.job ? mapJobToPublic(application.job) : null,
        ...buildApplicationJourney(
          {
            ...application,
            job: application.job ? mapJobToPublic(application.job) : null,
          },
          user.candidateProfile,
        ),
      })),
      recruitingCalls: recruitingCalls.map((call) => ({
        ...call,
        label: RECRUITING_CALL_TYPE_LABELS[call.callType as keyof typeof RECRUITING_CALL_TYPE_LABELS] || call.callType,
        calendarUrl: buildCalendarUrl({
          title: `SalesCareerHub - ${RECRUITING_CALL_TYPE_LABELS[call.callType as keyof typeof RECRUITING_CALL_TYPE_LABELS] || call.callType}`,
          start: call.scheduledTime,
          details: call.notes || undefined,
          location: call.meetingLink || undefined,
        }),
      })),
      notifications,
      profile: {
        firstName: user.candidateProfile.firstName,
        lastName: user.candidateProfile.lastName,
        email: user.candidateProfile.email,
        currentRole: user.candidateProfile.currentRole,
        targetRole: user.candidateProfile.targetRole,
        location: user.candidateProfile.location,
        country: user.candidateProfile.country,
        yearsOfExperience: user.candidateProfile.yearsOfExperience,
        seniority: user.candidateProfile.seniority,
        cvFileName: user.candidateProfile.cvFileName,
        averageDealSize: user.candidateProfile.averageDealSize,
        largestDealClosed: user.candidateProfile.largestDealClosed,
        averageSalesCycle: user.candidateProfile.averageSalesCycle,
        salesMotionExperience: user.candidateProfile.salesMotionExperience,
        industriesExperience: user.candidateProfile.industriesExperience,
      },
      stageCounts,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}
