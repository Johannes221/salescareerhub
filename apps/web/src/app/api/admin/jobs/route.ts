import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { isUser, requireAdmin } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import {
  buildStructuredRequirementsText,
  buildStructuredRequirementTags,
  normalizeStructuredJobRequirements,
} from '@/lib/job-requirements';
import { slugify } from '@/lib/utils';
import { anonymizeJob, JobAnonymizerError } from '@/services/jobAnonymizer';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!isUser(admin)) return admin;

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
    if (!isUser(admin)) return admin;

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
    if (!isUser(admin)) return admin;

    const body = await req.json();
    const {
      jobId, approvalStatus, status, isFeatured, isAgencyManaged, sourceType,
      legalNotes, verificationStatus, companyPermissionStatus,
      title, roleCategory, seniority, employmentType, remoteType, location, country,
      salaryMin, salaryMax, oteMin, oteMax, description, requirements, benefits,
    } = body;

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
    if (title !== undefined) updateData.title = title;
    if (roleCategory !== undefined) updateData.roleCategory = roleCategory;
    if (seniority !== undefined) updateData.seniority = seniority;
    if (employmentType !== undefined) updateData.employmentType = employmentType;
    if (remoteType !== undefined) updateData.remoteType = remoteType;
    if (location !== undefined) updateData.location = location;
    if (country !== undefined) updateData.country = country;
    if (salaryMin !== undefined) updateData.salaryMin = salaryMin;
    if (salaryMax !== undefined) updateData.salaryMax = salaryMax;
    if (oteMin !== undefined) updateData.oteMin = oteMin;
    if (oteMax !== undefined) updateData.oteMax = oteMax;
    if (description !== undefined) { updateData.description = description; updateData.descriptionAnonymized = description; }
    if (requirements !== undefined) updateData.requirements = requirements;
    if (benefits !== undefined) updateData.benefits = benefits;

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
