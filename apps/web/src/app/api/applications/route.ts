import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
    if (user.role !== 'candidate' || !user.candidateProfile) {
      return NextResponse.json({ success: false, error: 'Nur Kandidaten können Interesse bekunden' }, { status: 403 });
    }

    const { jobId, message } = await req.json();
    if (!jobId) return NextResponse.json({ success: false, error: 'Job-ID erforderlich' }, { status: 400 });

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== 'live') {
      return NextResponse.json({ success: false, error: 'Job nicht verfügbar' }, { status: 404 });
    }

    const existing = await prisma.application.findFirst({
      where: { jobId, candidateId: user.candidateProfile.id },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Du hast bereits Interesse an diesem Job bekundet' }, { status: 409 });
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId: user.candidateProfile.id,
        status: 'interest_expressed',
        candidateMessage: message || null,
        recommendedByAdmin: false,
      },
    });

    // Update interest count
    await prisma.job.update({ where: { id: jobId }, data: { interestCount: { increment: 1 } } });

    // Create notification for admin
    const admins = await prisma.user.findMany({ where: { role: 'admin' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'new_interest',
          title: 'Neues Interesse',
          message: `${user.candidateProfile.firstName} ${user.candidateProfile.lastName} hat Interesse an "${job.title}" bekundet.`,
          link: `/dashboard/admin/applications`,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'interest_expressed',
        entity: 'Application',
        entityId: application.id,
        details: `Interesse an Job "${job.title}" bekundet`,
      },
    });

    // DSGVO: Log data processing
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'data_processing',
        entity: 'Application',
        entityId: application.id,
        details: `Bewerbungsdaten verarbeitet (Art. 6 Abs. 1 lit. b DSGVO - Vertragsanbahnung). Kandidaten-Profildaten werden dem Admin zur Prüfung zugänglich gemacht.`,
      },
    });

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error) {
    console.error('Application error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Speichern' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });

    if (user.role === 'admin') {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get('status') || '';
      const where: any = {};
      if (status) where.status = status;

      const applications = await prisma.application.findMany({
        where,
        include: {
          job: { include: { company: { select: { name: true, slug: true } } } },
          candidate: { select: { firstName: true, lastName: true, email: true, currentRole: true, seniority: true, skills: true, linkedinUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100, // Limit to prevent OOM
      });
      return NextResponse.json({ success: true, data: applications });
    }

    if (user.role === 'candidate' && user.candidateProfile) {
      const applications = await prisma.application.findMany({
        where: { candidateId: user.candidateProfile.id },
        include: { job: { include: { company: { select: { name: true, slug: true, logoUrl: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: 50, // Limit to prevent OOM
      });
      return NextResponse.json({ success: true, data: applications });
    }

    if (user.role === 'company' && user.activeCompany) {
      const applications = await prisma.application.findMany({
        where: {
          job: { companyId: user.activeCompany.id },
          status: { in: ['forwarded', 'interview_1', 'interview_2', 'offer', 'hired', 'rejected'] },
        },
        include: {
          job: { select: { title: true, slug: true } },
          candidate: { select: { firstName: true, lastName: true, currentRole: true, seniority: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100, // Limit to prevent OOM
      });
      return NextResponse.json({ success: true, data: applications });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fehler beim Laden' }, { status: 500 });
  }
}
