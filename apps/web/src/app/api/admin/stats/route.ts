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
    const user = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });
    }

    const [totalUsers, totalJobs, pendingJobs, totalCompanies, totalCandidates, totalApplications, pendingReviews, totalLeads] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.job.count({ where: { approvalStatus: 'pending' } }),
      prisma.company.count(),
      prisma.candidateProfile.count(),
      prisma.application.count(),
      prisma.companyReview.count({ where: { status: 'pending' } }),
      prisma.lead.count({ where: { status: 'new' } }),
    ]);

    return NextResponse.json({
      success: true,
      data: { totalUsers, totalJobs, pendingJobs, totalCompanies, totalCandidates, totalApplications, pendingReviews, totalLeads },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}
