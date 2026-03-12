import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyIdToken } from '@/lib/auth/server';
import { candidateProfileSchema, deriveSeniorityFromYears } from '@/lib/utils';

async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  try {
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);

    return prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      include: { candidateProfile: true },
    });
  } catch {
    return null;
  }
}

function uniqueStrings(values: string[] = []) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function nullableString(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeLanguageProficiencies(
  values: Array<{ language: string; level: string }> = [],
) {
  const seen = new Set<string>();

  return values
    .map((value) => ({
      language: value.language.trim(),
      level: value.level.trim(),
    }))
    .filter((value) => value.language && value.level)
    .filter((value) => {
      const key = value.language.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

function normalizeWorkExperiences(
  values: Array<{
    id: string;
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    summary?: string;
  }> = [],
) {
  return values
    .map((value) => ({
      id: value.id.trim(),
      title: value.title.trim(),
      company: value.company.trim(),
      startDate: value.startDate?.trim() || '',
      endDate: value.endDate?.trim() || '',
      isCurrent: Boolean(value.isCurrent),
      summary: value.summary?.trim() || '',
    }))
    .filter((value) => value.id && value.title && value.company);
}

function normalizeEducations(
  values: Array<{
    id: string;
    degree?: string;
    institution?: string;
    startYear?: string;
    endYear?: string;
  }> = [],
) {
  return values
    .map((value) => ({
      id: value.id.trim(),
      degree: value.degree?.trim() || '',
      institution: value.institution?.trim() || '',
      startYear: value.startYear?.trim() || '',
      endYear: value.endYear?.trim() || '',
    }))
    .filter((value) => value.id);
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
    }

    return NextResponse.json({ success: true, data: user.candidateProfile });
  } catch {
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    if (!user || user.role !== 'candidate') {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = candidateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: parsed.error.issues[0]?.message || 'Ungültige Eingaben',
      }, { status: 400 });
    }

    const values = parsed.data;
    const yearsOfExperience = Number(values.yearsOfExperience);
    const desiredJobRoles = uniqueStrings(values.desiredJobRoles);
    const desiredIndustries = uniqueStrings(values.desiredIndustries);
    const careerGoals = uniqueStrings(values.careerGoals);
    const preferredCompanyTypes = uniqueStrings(values.preferredCompanyTypes);
    const remotePreference = uniqueStrings(values.remotePreference);
    const languageProficiencies = normalizeLanguageProficiencies(values.languageProficiencies);
    const workExperiences = normalizeWorkExperiences(values.workExperiences);
    const educations = normalizeEducations(values.educations);
    const languages = uniqueStrings([
      ...values.languages,
      ...languageProficiencies.map((entry) => entry.language),
    ]);
    const seniority = deriveSeniorityFromYears(yearsOfExperience) ?? values.seniority ?? null;
    const onboardingStep = Number(values.onboardingStep ?? 5);

    const data = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: nullableString(values.phone),
      linkedinUrl: nullableString(values.linkedinUrl),
      location: values.location.trim(),
      country: values.country.trim(),
      remotePreference,
      yearsOfExperience,
      currentRole: values.currentRole.trim(),
      targetRole: nullableString(values.targetRole) ?? desiredJobRoles[0] ?? null,
      desiredJobRoles,
      desiredIndustries,
      careerGoals,
      preferredCompanyTypes,
      seniority,
      languages,
      languageProficiencies: languageProficiencies as Prisma.InputJsonValue,
      salaryExpectationBase: Number(values.salaryExpectationBase),
      salaryExpectationOte: Number(values.salaryExpectationOte),
      salaryExpectationCurrency: values.salaryExpectationCurrency || 'EUR',
      noticePeriod: nullableString(values.noticePeriod),
      cvUrl: nullableString(values.cvUrl),
      cvFileName: nullableString(values.cvFileName),
      cvUploadDate: values.cvUploadDate ? new Date(values.cvUploadDate) : null,
      shortBio: nullableString(values.shortBio),
      skills: uniqueStrings(values.skills),
      workExperiences: workExperiences as Prisma.InputJsonValue,
      educations: educations as Prisma.InputJsonValue,
      googlePlaceId: nullableString(values.googlePlaceId),
      googlePlaceData: values.googlePlaceData
        ? values.googlePlaceData as Prisma.InputJsonValue
        : null,
      onboardingStep,
      onboardingSource: values.onboardingSource ?? 'manual',
      visibleToRecruiters: values.visibleToRecruiters ?? false,
      openToWork: values.openToWork ?? true,
    };

    const profile = user.candidateProfile
      ? await prisma.candidateProfile.update({
        where: { id: user.candidateProfile.id },
        data,
      })
      : await prisma.candidateProfile.create({
        data: {
          ...data,
          userId: user.id,
        },
      });

    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingCompleted: onboardingStep >= 5 },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'profile_updated',
        entity: 'CandidateProfile',
        entityId: profile.id,
        details: `Kandidatenprofil aktualisiert, Schritt ${onboardingStep}`,
      },
    });

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Speichern' }, { status: 500 });
  }
}
