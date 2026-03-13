import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, isAdminUser } from '@/lib/api-auth';
import { buildApplicationJourney, computeCandidateJobMatch } from '@/lib/candidate-journey';
import { prisma } from '@/lib/db';
import { validateFile } from '@/lib/gdpr';
import { mapJobToPublic, publicJobSelect } from '@/lib/public-jobs';
import { uploadCandidateDocument } from '@/lib/storage/candidate-documents';
import { applicationSubmissionSchema, deriveSeniorityFromYears, serializeCsv } from '@/lib/utils';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_CV_TYPES = ['application/pdf'];

function getNameParts(displayName: string | null | undefined, email: string) {
  const fallback = email.split('@')[0] || 'Kandidat';
  const parts = (displayName || fallback).trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] || 'Kandidat',
    lastName: parts.slice(1).join(' ') || 'Profil',
  };
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function nullableString(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function parseOptionalNumber(value: FormDataEntryValue | null) {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getStringValue(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value : '';
}

function getStringArray(formData: FormData, key: string) {
  return uniqueStrings(
    formData
      .getAll(key)
      .map((value) => (typeof value === 'string' ? value : '')),
  );
}

function getFileEntries(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

async function storeCandidateDocument(params: {
  candidateId: string;
  category: string;
  file: File;
}) {
  const { candidateId, category, file } = params;
  const uploaded = await uploadCandidateDocument({
    candidateId,
    category,
    file,
  });

  return prisma.document.create({
    data: {
      candidateId,
      fileName: uploaded.fileName,
      fileUrl: uploaded.fileUrl,
      fileType: uploaded.fileType,
      fileSizeKb: uploaded.fileSizeKb,
      category,
    },
  });
}

async function ensureCandidateProfile(user: NonNullable<Awaited<ReturnType<typeof getAuthUser>>>) {
  if (user.candidateProfile) {
    return user.candidateProfile;
  }

  const { firstName, lastName } = getNameParts(user.displayName, user.email);

  return prisma.candidateProfile.create({
    data: {
      userId: user.id,
      firstName,
      lastName,
      email: user.email,
      remotePreference: [],
      desiredJobRoles: [],
      desiredIndustries: [],
      careerGoals: [],
      preferredCompanyTypes: [],
      languages: [],
      skills: [],
      industriesExperience: [],
      onboardingStep: 0,
      onboardingSource: 'manual',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
    if (user.role !== 'candidate') {
      return NextResponse.json({ success: false, error: 'Nur Kandidaten können sich bewerben' }, { status: 403 });
    }

    const formData = await req.formData();
    const parsed = applicationSubmissionSchema.safeParse({
      jobId: getStringValue(formData.get('jobId')),
      linkedinUrl: getStringValue(formData.get('linkedinUrl')),
      yearsOfSalesExperience: parseOptionalNumber(formData.get('yearsOfSalesExperience')),
      currentRole: getStringValue(formData.get('currentRole')),
      averageDealSize: parseOptionalNumber(formData.get('averageDealSize')),
      averageSalesCycle: parseOptionalNumber(formData.get('averageSalesCycle')),
      quotaTarget: parseOptionalNumber(formData.get('quotaTarget')),
      quotaAttainment: parseOptionalNumber(formData.get('quotaAttainment')),
      industriesExperience: getStringArray(formData, 'industriesExperience'),
      salesMotionExperience: getStringArray(formData, 'salesMotionExperience'),
      largestDealClosed: parseOptionalNumber(formData.get('largestDealClosed')),
      territoryType: getStringValue(formData.get('territoryType')),
      candidateMessage: getStringValue(formData.get('candidateMessage')),
    });

    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: parsed.error.issues[0]?.message || 'Ungültige Eingaben',
      }, { status: 400 });
    }

    const {
      jobId,
      linkedinUrl,
      yearsOfSalesExperience,
      currentRole,
      averageDealSize,
      averageSalesCycle,
      quotaTarget,
      quotaAttainment,
      industriesExperience,
      salesMotionExperience,
      largestDealClosed,
      territoryType,
      candidateMessage,
    } = parsed.data;

    const candidateProfile = await ensureCandidateProfile(user);
    const existingProfile = candidateProfile as any;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== 'live') {
      return NextResponse.json({ success: false, error: 'Job nicht verfügbar' }, { status: 404 });
    }

    const existing = await prisma.application.findFirst({
      where: { jobId, candidateId: candidateProfile.id },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Du hast dich bereits auf diesen Job beworben' }, { status: 409 });
    }

    const cvFile = formData.get('cv');
    const coverLetterFile = formData.get('coverLetter');
    const additionalDocuments = getFileEntries(formData, 'additionalDocuments');

    if (cvFile instanceof File && cvFile.size > 0) {
      const validation = validateFile(cvFile, 'CV');
      if (!validation.valid) {
        return NextResponse.json({ success: false, error: validation.error || 'CV konnte nicht geprüft werden' }, { status: 400 });
      }
    }

    if (coverLetterFile instanceof File && coverLetterFile.size > 0) {
      const validation = validateFile(coverLetterFile, 'COVER_LETTER');
      if (!validation.valid) {
        return NextResponse.json({ success: false, error: validation.error || 'Anschreiben konnte nicht geprüft werden' }, { status: 400 });
      }
    }

    for (const file of additionalDocuments) {
      const validation = validateFile(file, 'OTHER');
      if (!validation.valid) {
        return NextResponse.json({ success: false, error: validation.error || `Dokument ${file.name} ist ungültig` }, { status: 400 });
      }
    }

    let cvDocument:
      | {
        id: string;
        fileName: string;
        fileUrl: string;
      }
      | null = null;

    if (cvFile instanceof File && cvFile.size > 0) {
      cvDocument = await storeCandidateDocument({
        candidateId: candidateProfile.id,
        category: 'cv',
        file: cvFile,
      });
    }

    if (coverLetterFile instanceof File && coverLetterFile.size > 0) {
      await storeCandidateDocument({
        candidateId: candidateProfile.id,
        category: 'cover_letter',
        file: coverLetterFile,
      });
    }

    if (additionalDocuments.length > 0) {
      await Promise.all(
        additionalDocuments.map((file) => storeCandidateDocument({
          candidateId: candidateProfile.id,
          category: 'other',
          file,
        })),
      );
    }

    const yearsValue = yearsOfSalesExperience ?? existingProfile.yearsOfExperience ?? undefined;
    const seniority = deriveSeniorityFromYears(yearsValue) ?? existingProfile.seniority ?? null;
    const quotaHistory = (quotaTarget !== undefined || quotaAttainment !== undefined)
      ? {
        target: quotaTarget ?? null,
        attainment: quotaAttainment ?? null,
      } as Prisma.InputJsonValue
      : existingProfile.quotaHistory as Prisma.InputJsonValue | undefined;

    await prisma.candidateProfile.update({
      where: { id: candidateProfile.id },
      data: {
        email: user.email,
        linkedinUrl,
        currentRole: nullableString(currentRole) ?? existingProfile.currentRole ?? null,
        yearsOfExperience: yearsOfSalesExperience ?? existingProfile.yearsOfExperience ?? null,
        seniority,
        averageDealSize: averageDealSize ?? existingProfile.averageDealSize ?? null,
        averageSalesCycle: averageSalesCycle ?? existingProfile.averageSalesCycle ?? null,
        industriesExperience,
        salesMotionExperience: salesMotionExperience.join(', '),
        largestDealClosed: largestDealClosed ?? existingProfile.largestDealClosed ?? null,
        territorySize: nullableString(territoryType) ?? existingProfile.territorySize ?? null,
        quotaHistory,
        cvUrl: cvDocument?.fileUrl ?? existingProfile.cvUrl ?? null,
        cvFileName: cvDocument?.fileName ?? existingProfile.cvFileName ?? null,
        cvUploadDate: cvDocument ? new Date() : existingProfile.cvUploadDate ?? null,
        visibleToRecruiters: true,
        openToWork: true,
      },
    });

    const matchProfile = {
      ...existingProfile,
      email: user.email,
      linkedinUrl,
      currentRole: nullableString(currentRole) ?? existingProfile.currentRole ?? null,
      yearsOfExperience: yearsOfSalesExperience ?? existingProfile.yearsOfExperience ?? null,
      seniority,
      averageDealSize: averageDealSize ?? existingProfile.averageDealSize ?? null,
      averageSalesCycle: averageSalesCycle ?? existingProfile.averageSalesCycle ?? null,
      industriesExperience,
      salesMotionExperience,
      largestDealClosed: largestDealClosed ?? existingProfile.largestDealClosed ?? null,
      territorySize: nullableString(territoryType) ?? existingProfile.territorySize ?? null,
    };
    const match = computeCandidateJobMatch(matchProfile, job);

    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId: candidateProfile.id,
        status: 'interest_expressed',
        candidateMessage: nullableString(candidateMessage),
        recommendedByAdmin: false,
        fitScore: match.score,
        linkedinUrl: nullableString(linkedinUrl) ?? existingProfile.linkedinUrl ?? null,
        yearsOfSalesExperience: yearsOfSalesExperience ?? existingProfile.yearsOfExperience ?? null,
        currentRoleSnapshot: nullableString(currentRole) ?? existingProfile.currentRole ?? null,
        averageDealSize: averageDealSize ?? existingProfile.averageDealSize ?? null,
        averageSalesCycle: averageSalesCycle ?? existingProfile.averageSalesCycle ?? null,
        quotaTarget: quotaTarget ?? null,
        quotaAttainment: quotaAttainment ?? null,
        industriesExperience,
        salesMotionExperience,
        largestDealClosed: largestDealClosed ?? existingProfile.largestDealClosed ?? null,
        territoryType: nullableString(territoryType) ?? existingProfile.territorySize ?? null,
        cvDocumentId: cvDocument?.id ?? null,
        cvFileName: cvDocument?.fileName ?? existingProfile.cvFileName ?? null,
        cvFileUrl: cvDocument?.fileUrl ?? existingProfile.cvUrl ?? null,
      },
    });

    // Update interest count
    await prisma.job.update({ where: { id: jobId }, data: { interestCount: { increment: 1 } } });

    // Create notification for admin
    const admins = await prisma.adminUser.findMany({ select: { userId: true } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.userId,
          type: 'new_application',
          title: 'Neue Bewerbung',
          message: `${candidateProfile.firstName} ${candidateProfile.lastName} hat sich auf "${job.title}" beworben.`,
          link: `/dashboard/admin/applications`,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'application_submitted',
        entity: 'Application',
        entityId: application.id,
        details: `Bewerbung für Job "${job.title}" eingereicht`,
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

    if (isAdminUser(user)) {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get('status') || '';
      const search = searchParams.get('search') || '';
      const jobId = searchParams.get('jobId') || '';
      const format = searchParams.get('format') || '';
      const where: any = {};
      if (status) where.status = status;
      if (jobId) where.jobId = jobId;
      if (search) {
        where.OR = [
          { candidate: { firstName: { contains: search, mode: 'insensitive' } } },
          { candidate: { lastName: { contains: search, mode: 'insensitive' } } },
          { candidate: { email: { contains: search, mode: 'insensitive' } } },
          { job: { title: { contains: search, mode: 'insensitive' } } },
        ];
      }

      const applications = await prisma.application.findMany({
        where,
        include: {
          job: { include: { company: { select: { name: true, slug: true } } } },
          candidate: { select: { firstName: true, lastName: true, email: true, currentRole: true, seniority: true, skills: true, linkedinUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: format === 'csv' ? 500 : 100,
      });

      if (format === 'csv') {
        const csv = serializeCsv(applications.map((application) => ({
          id: application.id,
          candidateName: `${application.candidate?.firstName || ''} ${application.candidate?.lastName || ''}`.trim(),
          candidateEmail: application.candidate?.email,
          currentRole: application.candidate?.currentRole,
          seniority: application.candidate?.seniority,
          jobTitle: application.job?.title,
          companyName: application.job?.company?.name,
          status: application.status,
          fitScore: application.fitScore,
          recommendedByAdmin: application.recommendedByAdmin,
          averageDealSize: application.averageDealSize,
          averageSalesCycle: application.averageSalesCycle,
          quotaTarget: application.quotaTarget,
          quotaAttainment: application.quotaAttainment,
          largestDealClosed: application.largestDealClosed,
          territoryType: application.territoryType,
          createdAt: application.createdAt.toISOString(),
        })));

        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename=\"applications.csv\"',
          },
        });
      }

      return NextResponse.json({ success: true, data: applications });
    }

    if (user.role === 'candidate' && user.candidateProfile) {
      const applications = await prisma.application.findMany({
        where: { candidateId: user.candidateProfile.id },
        include: { job: { select: publicJobSelect } },
        orderBy: { createdAt: 'desc' },
        take: 50, // Limit to prevent OOM
      });
      return NextResponse.json({
        success: true,
        data: applications.map((application: (typeof applications)[number]) => ({
          ...application,
          job: application.job ? mapJobToPublic(application.job) : null,
          ...buildApplicationJourney(
            {
              ...application,
              job: application.job ? mapJobToPublic(application.job) : null,
            },
            user.candidateProfile,
          ),
        })),
      });
    }

    if (user.role === 'company' && user.activeCompany) {
      const applications = await prisma.application.findMany({
        where: {
          job: { companyId: user.activeCompany.id },
          status: { in: ['hiring_team', 'contract_negotiation', 'signed', 'rejected'] },
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
