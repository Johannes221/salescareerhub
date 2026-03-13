import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyIdToken } from '@/lib/auth/server';

async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    return prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });
  } catch { return null; }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });
    }

    const body = await req.json();
    const { status, internalNotes, fitScore, adminNotes, recommendedByAdmin } = body;

    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: { job: true, candidate: true },
    });
    if (!application) {
      return NextResponse.json({ success: false, error: 'Bewerbung nicht gefunden' }, { status: 404 });
    }

    const updateData: any = {};
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

    // Notify candidate about status change
    if (status && status !== application.status) {
      await prisma.notification.create({
        data: {
          userId: application.candidate.userId,
          type: 'application_status_changed',
          title: 'Status deiner Interessenbekundung aktualisiert',
          message: `Deine Anfrage für "${application.job.title}" wurde aktualisiert.`,
          link: '/dashboard/candidate/bewerbungen',
        },
      });

      // If forwarded, notify company
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

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'application_updated',
        entity: 'Application',
        entityId: params.id,
        details: JSON.stringify({ previousStatus: application.status, newStatus: status, fitScore, recommendedByAdmin }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Application update error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Aktualisieren' }, { status: 500 });
  }
}
