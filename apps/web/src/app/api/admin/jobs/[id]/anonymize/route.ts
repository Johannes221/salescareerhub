import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyIdToken } from '@/lib/auth/server';
import { anonymizeJob, JobAnonymizerError } from '@/services/jobAnonymizer';

async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    const user = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });
    return user?.role === 'admin' ? user : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });

    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: {
            name: true,
            website: true,
            linkedinUrl: true,
            description: true,
            industry: true,
            fundingStage: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ success: false, error: 'Job nicht gefunden' }, { status: 404 });
    }

    const originalDescription = job.descriptionOriginal || job.description;

    const anonymized = await anonymizeJob({
      title: job.title,
      companyName: job.company.name,
      companyWebsite: job.company.website,
      companyLinkedInUrl: job.company.linkedinUrl,
      companyDescription: job.company.description,
      companyIndustry: job.company.industry,
      companyStage: job.company.fundingStage,
      role: job.roleCategory,
      location: job.location,
      oteRange: job.oteMin && job.oteMax ? `${job.oteMin}-${job.oteMax} ${job.currency}` : null,
      jobDescription: originalDescription,
      requirements: job.requirements || undefined,
      benefits: job.benefits || undefined,
    });

    const updated = await prisma.job.update({
      where: { id: params.id },
      data: {
        description: anonymized.descriptionAnonymized,
        descriptionAnonymized: anonymized.descriptionAnonymized,
        descriptionOriginal: originalDescription,
        requirements: anonymized.requirementsAnonymized,
        benefits: anonymized.benefitsAnonymized,
        anonymizedCompanyProfile: anonymized.anonymizedCompanyProfile,
        title: anonymized.titleAnonymized || job.title,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'admin_job_reanonymized',
        entity: 'Job',
        entityId: params.id,
        details: JSON.stringify({ companyName: job.company.name }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof JobAnonymizerError) {
      const status = error.code === 'CONFIGURATION_ERROR' ? 503 : error.code === 'VALIDATION_ERROR' ? 422 : 502;
      return NextResponse.json({ success: false, error: error.message }, { status });
    }
    console.error('Re-anonymize error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Anonymisieren' }, { status: 500 });
  }
}
