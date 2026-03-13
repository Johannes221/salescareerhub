import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyIdToken } from '@/lib/auth/server';
import {
  buildStructuredRequirementsText,
  buildStructuredRequirementTags,
  normalizeStructuredJobRequirements,
} from '@/lib/job-requirements';
import { slugify } from '@/lib/utils';
import { anonymizeJob, JobAnonymizerError } from '@/services/jobAnonymizer';

async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    const user = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });
    return user?.role === 'admin' ? user : null;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });

    const body = await req.json();
    const {
      companyId,
      companyName,
      title,
      role,
      roleCategory,
      seniority,
      employmentType,
      location,
      country,
      remoteType,
      salaryMin,
      salaryMax,
      oteMin,
      oteMax,
      currency,
      description,
      jobDescription,
      requirementsStructured,
      benefits,
      sourceUrl,
      tags,
    } = body;

    const company = companyId
      ? await prisma.company.findUnique({ where: { id: companyId } })
      : companyName
        ? await prisma.company.findFirst({ where: { name: companyName } })
        : null;

    if (!company) {
      return NextResponse.json({ success: false, error: 'Unternehmen nicht gefunden' }, { status: 404 });
    }

    const resolvedRoleCategory = roleCategory || role;
    const resolvedTitle = title || role || roleCategory;
    const resolvedDescription = description || jobDescription;

    if (!resolvedTitle || !resolvedRoleCategory || !resolvedDescription) {
      return NextResponse.json({ success: false, error: 'Pflichtfelder fehlen' }, { status: 400 });
    }

    const normalizedRequirements = normalizeStructuredJobRequirements(requirementsStructured);
    const requirementsSummary = buildStructuredRequirementsText(normalizedRequirements);
    const mergedTags = Array.from(new Set([
      resolvedRoleCategory,
      ...(Array.isArray(tags) ? tags : []),
      ...buildStructuredRequirementTags(normalizedRequirements),
    ].filter(Boolean)));

    const anonymizedJob = await anonymizeJob({
      title: resolvedTitle,
      companyName: company.name,
      companyWebsite: company.website,
      companyLinkedInUrl: company.linkedinUrl,
      companyDescription: company.description,
      companyIndustry: company.industry,
      companyStage: company.fundingStage,
      role: resolvedRoleCategory,
      location,
      oteRange: [oteMin, oteMax].some((value) => value !== undefined && value !== null)
        ? `${oteMin ?? ''}-${oteMax ?? ''} ${currency || 'EUR'}`
        : null,
      jobDescription: resolvedDescription,
      requirements: requirementsSummary || undefined,
      benefits,
    });

    const publicTitle = anonymizedJob.titleAnonymized || resolvedTitle;
    const slug = slugify(publicTitle) + '-' + Date.now().toString(36);

    const job = await prisma.job.create({
      data: {
        companyId: company.id,
        originalCompanyName: company.name,
        anonymizedCompanyProfile: anonymizedJob.anonymizedCompanyProfile,
        title: publicTitle,
        slug,
        roleCategory: resolvedRoleCategory,
        seniority: seniority || 'mid',
        employmentType: employmentType || 'fulltime',
        location,
        country,
        remoteType: remoteType || 'hybrid',
        salaryMin,
        salaryMax,
        oteMin,
        oteMax,
        currency: currency || 'EUR',
        description: anonymizedJob.descriptionAnonymized,
        descriptionOriginal: anonymizedJob.descriptionOriginal,
        descriptionAnonymized: anonymizedJob.descriptionAnonymized,
        requirements: anonymizedJob.requirementsAnonymized,
        requirementsStructured: normalizedRequirements as Prisma.InputJsonValue,
        benefits: anonymizedJob.benefitsAnonymized,
        sourceType: 'agency_managed_job',
        sourceUrl,
        applyViaPlattform: true,
        status: 'pending_review',
        approvalStatus: 'pending',
        tags: mergedTags,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'admin_job_created',
        entity: 'Job',
        entityId: job.id,
        details: JSON.stringify({ companyId: company.id, companyName: company.name }),
      },
    });

    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error) {
    const anonymizerError = error instanceof JobAnonymizerError ? error : null;
    if (anonymizerError) {
      const status =
        anonymizerError.code === 'CONFIGURATION_ERROR'
          ? 503
          : anonymizerError.code === 'VALIDATION_ERROR'
            ? 422
            : 502;
      return NextResponse.json({ success: false, error: anonymizerError.message }, { status });
    }
    console.error('Admin job create error:', error);
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
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
