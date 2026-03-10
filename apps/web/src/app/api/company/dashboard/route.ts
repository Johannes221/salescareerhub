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
      include: { company: true },
    });
    if (!user || !user.company) {
      return NextResponse.json({ success: true, stats: { totalJobs: 0, liveJobs: 0, totalApplications: 0, profileViews: 0 }, jobs: [] });
    }

    const [totalJobs, liveJobs, jobs] = await Promise.all([
      prisma.job.count({ where: { companyId: user.company.id } }),
      prisma.job.count({ where: { companyId: user.company.id, status: 'live' } }),
      prisma.job.findMany({
        where: { companyId: user.company.id },
        include: { _count: { select: { applications: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const jobIds = jobs.map((j) => j.id);
    const totalApplications = jobIds.length > 0
      ? await prisma.application.count({ where: { jobId: { in: jobIds } } })
      : 0;

    return NextResponse.json({
      success: true,
      stats: { totalJobs, liveJobs, totalApplications, profileViews: 0 },
      jobs,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}
