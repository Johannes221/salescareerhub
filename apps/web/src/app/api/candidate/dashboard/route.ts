import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@salescareerhub/db';
import { verifyIdToken } from '@salescareerhub/auth/server';

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
      return NextResponse.json({ success: true, stats: { applications: 0, savedJobs: 0, profileViews: 0, notifications: 0 }, applications: [] });
    }

    const [applicationCount, savedJobCount, notificationCount, applications] = await Promise.all([
      prisma.application.count({ where: { candidateId: user.candidateProfile.id } }),
      prisma.savedJob.count({ where: { userId: user.id } }),
      prisma.notification.count({ where: { userId: user.id, isRead: false } }),
      prisma.application.findMany({
        where: { candidateId: user.candidateProfile.id },
        include: { job: { include: { company: { select: { name: true, slug: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: { applications: applicationCount, savedJobs: savedJobCount, profileViews: 0, notifications: notificationCount },
      applications,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}
