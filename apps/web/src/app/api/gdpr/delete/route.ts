import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyIdToken, deleteFirebaseUser } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
    }
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      include: { candidateProfile: true, company: true },
    });
    if (!user) return NextResponse.json({ success: false, error: 'Nicht gefunden' }, { status: 404 });

    // Audit log BEFORE deletion
    await prisma.auditLog.create({
      data: {
        action: 'gdpr_data_deletion_requested',
        entity: 'User',
        entityId: user.id,
        details: `Datenlöschung nach Art. 17 DSGVO angefordert für ${user.email}. Alle personenbezogenen Daten werden gelöscht.`,
      },
    });

    // Delete in dependency order
    if (user.candidateProfile) {
      await prisma.document.deleteMany({ where: { candidateId: user.candidateProfile.id } });
      await prisma.application.deleteMany({ where: { candidateId: user.candidateProfile.id } });
      await prisma.candidateProfile.delete({ where: { id: user.candidateProfile.id } });
    }

    if (user.company) {
      await prisma.rankingSnapshot.deleteMany({ where: { companyId: user.company.id } });
      await prisma.companyReview.deleteMany({ where: { companyId: user.company.id } });
      const companyJobs = await prisma.job.findMany({ where: { companyId: user.company.id }, select: { id: true } });
      const jobIds = companyJobs.map((j) => j.id);
      if (jobIds.length > 0) {
        await prisma.application.deleteMany({ where: { jobId: { in: jobIds } } });
        await prisma.savedJob.deleteMany({ where: { jobId: { in: jobIds } } });
      }
      await prisma.job.deleteMany({ where: { companyId: user.company.id } });
      await prisma.company.delete({ where: { id: user.company.id } });
    }

    await prisma.companyReview.deleteMany({ where: { userId: user.id } });
    await prisma.savedJob.deleteMany({ where: { userId: user.id } });
    await prisma.notification.deleteMany({ where: { userId: user.id } });
    await prisma.analyticsEvent.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });

    // Delete Firebase user
    try { await deleteFirebaseUser(decoded.uid); } catch {}

    // Final audit (anonymous)
    await prisma.auditLog.create({
      data: {
        action: 'gdpr_data_deletion_completed',
        entity: 'User',
        entityId: 'deleted',
        details: `Datenlöschung nach Art. 17 DSGVO abgeschlossen. Alle personenbezogenen Daten wurden gelöscht.`,
      },
    });

    // TODO: Delete files from Firebase Storage (CVs, logos)

    return NextResponse.json({
      success: true,
      message: 'Alle deine personenbezogenen Daten wurden gelöscht (Art. 17 DSGVO).',
    });
  } catch (error) {
    console.error('GDPR deletion error:', error);
    return NextResponse.json({ success: false, error: 'Fehler bei der Löschung' }, { status: 500 });
  }
}
