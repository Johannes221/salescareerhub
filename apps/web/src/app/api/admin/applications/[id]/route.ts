import { NextRequest, NextResponse } from 'next/server';
import { isUser, requireAdmin } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { computeCandidateJobMatch } from '@/lib/candidate-journey';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(req);
    if (!isUser(admin)) return admin;

    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                contactPerson: true,
                email: true,
                industry: true,
                fundingStage: true,
                website: true,
              },
            },
          },
        },
        candidate: {
          include: {
            user: { select: { email: true, displayName: true } },
            documents: { orderBy: { createdAt: 'desc' }, take: 5 },
            recruitingCalls: { orderBy: { scheduledTime: 'desc' }, take: 10 },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ success: false, error: 'Bewerbung nicht gefunden' }, { status: 404 });
    }

    const match = computeCandidateJobMatch(application.candidate, application.job);

    const auditLogs = await prisma.auditLog.findMany({
      where: { entity: 'Application', entityId: params.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...application,
        matchScore: match.score,
        matchReasons: match.reasons,
        matchRequirementGroups: match.requirementGroups,
        auditLogs,
      },
    });
  } catch (error) {
    console.error('Admin application detail error:', error);
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(req);
    if (!isUser(admin)) return admin;

    const body = await req.json();
    const { status, internalNotes, fitScore, adminNotes, recommendedByAdmin } = body;

    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: { job: true, candidate: true },
    });
    if (!application) {
      return NextResponse.json({ success: false, error: 'Bewerbung nicht gefunden' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;
    if (fitScore !== undefined) updateData.fitScore = fitScore;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (recommendedByAdmin !== undefined) updateData.recommendedByAdmin = recommendedByAdmin;
    if (status === 'hiring_team') updateData.forwardedAt = new Date();

    const updated = await prisma.application.update({
      where: { id: params.id },
      data: updateData,
    });

    if (status && status !== application.status) {
      await prisma.notification.create({
        data: {
          userId: application.candidate.userId,
          type: 'application_status_changed',
          title: 'Status deiner Bewerbung aktualisiert',
          message: `Deine Bewerbung für "${application.job.title}" wurde aktualisiert.`,
          link: '/dashboard/candidate/bewerbungen',
        },
      });

      if (status === 'hiring_team') {
        const company = await prisma.company.findUnique({ where: { id: application.job.companyId } });
        if (company) {
          await prisma.notification.create({
            data: {
              userId: company.userId,
              type: 'candidate_forwarded',
              title: 'Neuer Kandidat empfohlen',
              message: `Ein Kandidat wurde für "${application.job.title}" empfohlen.`,
              link: '/dashboard/company/bewerbungen',
            },
          });
        }
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'application_updated',
        entity: 'Application',
        entityId: params.id,
        details: JSON.stringify({ previousStatus: application.status, newStatus: status, fitScore, recommendedByAdmin }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Admin application update error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Aktualisieren' }, { status: 500 });
  }
}
