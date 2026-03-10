import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@salescareerhub/db';
import { verifyIdToken } from '@salescareerhub/auth/server';

async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    const user = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });
    return user?.role === 'admin' ? user : null;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const where: any = {};
    if (status) where.approvalStatus = status;

    const jobs = await prisma.job.findMany({
      where,
      include: {
        company: { select: { name: true, slug: true, isVerified: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: jobs });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });

    const body = await req.json();
    const { jobId, approvalStatus, status, isFeatured, isAgencyManaged, sourceType, legalNotes, verificationStatus, companyPermissionStatus } = body;

    if (!jobId) return NextResponse.json({ success: false, error: 'Job-ID erforderlich' }, { status: 400 });

    const updateData: any = {};
    if (approvalStatus !== undefined) updateData.approvalStatus = approvalStatus;
    if (status !== undefined) updateData.status = status;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isAgencyManaged !== undefined) updateData.isAgencyManaged = isAgencyManaged;
    if (sourceType !== undefined) updateData.sourceType = sourceType;
    if (legalNotes !== undefined) updateData.legalNotes = legalNotes;
    if (verificationStatus !== undefined) updateData.verificationStatus = verificationStatus;
    if (companyPermissionStatus !== undefined) updateData.companyPermissionStatus = companyPermissionStatus;

    if (approvalStatus === 'approved' && status === undefined) {
      updateData.status = 'live';
      updateData.publishedAt = new Date();
    }

    const job = await prisma.job.update({ where: { id: jobId }, data: updateData });

    // Notify company
    const company = await prisma.company.findUnique({ where: { id: job.companyId } });
    if (company && approvalStatus) {
      await prisma.notification.create({
        data: {
          userId: company.userId,
          type: approvalStatus === 'approved' ? 'job_approved' : 'job_rejected',
          title: approvalStatus === 'approved' ? 'Job freigeschaltet' : 'Job abgelehnt',
          message: `Dein Job "${job.title}" wurde ${approvalStatus === 'approved' ? 'freigeschaltet' : 'abgelehnt'}.`,
          link: '/dashboard/company/jobs',
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: admin.id, action: 'admin_job_updated', entity: 'Job', entityId: jobId,
        details: JSON.stringify({ approvalStatus, status, isFeatured, isAgencyManaged }),
      },
    });

    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    console.error('Admin job update error:', error);
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}
