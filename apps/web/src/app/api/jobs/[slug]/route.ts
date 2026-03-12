import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyIdToken } from '@/lib/auth/server';
import { mapJobToPublic, publicJobSelect } from '@/lib/public-jobs';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const job = await prisma.job.findUnique({
      where: { slug: params.slug },
      select: publicJobSelect,
    });

    if (!job || job.status !== 'live' || job.approvalStatus !== 'approved') {
      return NextResponse.json({ success: false, error: 'Job nicht gefunden' }, { status: 404 });
    }

    // Increment view count
    await prisma.job.update({ where: { id: job.id }, data: { viewCount: { increment: 1 } } });

    // Track analytics
    await prisma.analyticsEvent.create({ data: { eventType: 'job_viewed', entityId: job.id } });

    // Check if logged-in user has expressed interest or saved this job
    let interestStatus: string | null = null;
    let saved = false;

    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split('Bearer ')[1];
        const decoded = await verifyIdToken(token);
        const user = await prisma.user.findUnique({
          where: { firebaseUid: decoded.uid },
          include: { candidateProfile: true },
        });

        if (user?.candidateProfile) {
          const application = await prisma.application.findFirst({
            where: { jobId: job.id, candidateId: user.candidateProfile.id },
          });
          if (application) interestStatus = application.status;
        }

        if (user) {
          const savedJob = await prisma.savedJob.findFirst({
            where: { jobId: job.id, userId: user.id },
          });
          saved = !!savedJob;
        }
      } catch {}
    }

    return NextResponse.json({ success: true, data: mapJobToPublic(job), interestStatus, saved });
  } catch (error) {
    console.error('Job detail error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Laden' }, { status: 500 });
  }
}
