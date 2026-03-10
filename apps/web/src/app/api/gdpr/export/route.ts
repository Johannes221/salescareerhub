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
      include: {
        candidateProfile: true,
        company: true,
        reviews: true,
        savedJobs: { include: { job: { select: { title: true, slug: true } } } },
        notifications: true,
      },
    });

    if (!user) return NextResponse.json({ success: false, error: 'Nicht gefunden' }, { status: 404 });

    let applications: any[] = [];
    if (user.candidateProfile) {
      applications = await prisma.application.findMany({
        where: { candidateId: user.candidateProfile.id },
        include: { job: { select: { title: true, slug: true } } },
      });
    }

    const documents = user.candidateProfile
      ? await prisma.document.findMany({ where: { candidateId: user.candidateProfile.id } })
      : [];

    const exportData = {
      exportDate: new Date().toISOString(),
      legalBasis: 'Art. 15 DSGVO – Auskunftsrecht der betroffenen Person',
      user: {
        email: user.email,
        role: user.role,
        displayName: user.displayName,
        createdAt: user.createdAt,
      },
      candidateProfile: user.candidateProfile ? {
        firstName: user.candidateProfile.firstName,
        lastName: user.candidateProfile.lastName,
        email: user.candidateProfile.email,
        phone: user.candidateProfile.phone,
        linkedinUrl: user.candidateProfile.linkedinUrl,
        location: user.candidateProfile.location,
        country: user.candidateProfile.country,
        currentRole: user.candidateProfile.currentRole,
        targetRole: user.candidateProfile.targetRole,
        seniority: user.candidateProfile.seniority,
        yearsOfExperience: user.candidateProfile.yearsOfExperience,
        skills: user.candidateProfile.skills,
        shortBio: user.candidateProfile.shortBio,
        createdAt: user.candidateProfile.createdAt,
      } : null,
      company: user.company ? {
        name: user.company.name,
        website: user.company.website,
        country: user.company.country,
        city: user.company.city,
        industry: user.company.industry,
        createdAt: user.company.createdAt,
      } : null,
      applications: applications.map((a: any) => ({
        jobTitle: a.job?.title,
        status: a.status,
        candidateMessage: a.candidateMessage,
        createdAt: a.createdAt,
      })),
      reviews: user.reviews.map((r: any) => ({
        overallRating: r.overallRating,
        reviewText: r.reviewText,
        status: r.status,
        createdAt: r.createdAt,
      })),
      savedJobs: user.savedJobs.map((s: any) => ({
        jobTitle: s.job?.title,
        savedAt: s.createdAt,
      })),
      documents: documents.map((d: any) => ({
        fileName: d.fileName,
        fileType: d.fileType,
        category: d.category,
        uploadedAt: d.createdAt,
      })),
      _meta: {
        note: 'Interne Notizen (internalNotes, adminNotes, fitScore) sind nicht Bestandteil des Exports, da sie dem berechtigten Interesse des Verantwortlichen dienen (Art. 6 Abs. 1 lit. f DSGVO).',
      },
    };

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'gdpr_data_export',
        entity: 'User',
        entityId: user.id,
        details: 'Datenexport nach Art. 15 DSGVO durchgeführt',
      },
    });

    return NextResponse.json({ success: true, data: exportData });
  } catch (error) {
    console.error('GDPR export error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Export' }, { status: 500 });
  }
}
