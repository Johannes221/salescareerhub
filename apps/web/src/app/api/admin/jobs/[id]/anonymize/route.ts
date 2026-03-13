import { NextRequest, NextResponse } from 'next/server';
import { isUser, requireAdmin } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { anonymizeJob, JobAnonymizerError } from '@/services/jobAnonymizer';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(req);
    if (!isUser(admin)) return admin;

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
