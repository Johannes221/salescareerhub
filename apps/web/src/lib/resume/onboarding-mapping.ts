import type { NormalizedCandidateProfile } from './schemas';

export interface ResumeLanguageProficiency {
  language: string;
  level: string;
}

export interface ResumeWorkExperienceItem {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  summary: string;
}

export interface ResumeEducationItem {
  id: string;
  degree: string;
  institution: string;
  startYear: string;
  endYear: string;
}

export interface ResumeMappingFallbacks {
  email?: string;
  firstName?: string;
  lastName?: string;
  languageProficiencies?: ResumeLanguageProficiency[];
  salaryExpectationBase?: number;
  salaryExpectationOte?: number;
}

export interface ResumeMappedCandidateSeed {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  location: string;
  remotePreference: string[];
  currentRole: string;
  targetRole: string;
  desiredJobRoles: string[];
  yearsOfExperience: number;
  seniority: string;
  skills: string[];
  languages: string[];
  languageProficiencies: ResumeLanguageProficiency[];
  workExperiences: ResumeWorkExperienceItem[];
  educations: ResumeEducationItem[];
  salaryExpectationBase: number;
  salaryExpectationOte: number;
  noticePeriod: string;
  onboardingSource: 'cv';
}

function getFieldValue<T>(field: { value: T } | null | undefined): T | undefined {
  if (!field) {
    return undefined;
  }

  return field.value;
}

function toTitleCase(value: string): string {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function inferNamePartsFromContact(
  email?: string | null,
  linkedinUrl?: string | null,
): { firstName: string; lastName: string } {
  const parseTokens = (raw?: string | null) =>
    (raw || '')
      .split(/[._\-\/]+/)
      .map((part) => part.trim())
      .filter((part) => /^[a-zA-ZäöüÄÖÜß]{2,}$/.test(part));

  const emailTokens = parseTokens(email?.split('@')[0]);
  if (emailTokens.length >= 2) {
    return {
      firstName: toTitleCase(emailTokens[0]),
      lastName: toTitleCase(emailTokens.slice(1).join(' ')),
    };
  }

  const linkedinMatch = linkedinUrl?.match(/linkedin\.com\/in\/([^/?#]+)/i);
  const linkedinTokens = parseTokens(linkedinMatch?.[1]);
  if (linkedinTokens.length >= 2) {
    return {
      firstName: toTitleCase(linkedinTokens[0]),
      lastName: toTitleCase(linkedinTokens.slice(1).join(' ')),
    };
  }

  return { firstName: '', lastName: '' };
}

function normalizeLanguageProficiencies(
  profile: NormalizedCandidateProfile,
  fallback: ResumeMappingFallbacks,
): ResumeLanguageProficiency[] {
  const languages = (getFieldValue(profile.sprachen) || []).map((entry) => ({
    language: entry.sprache || '',
    level: entry.level || 'Konversationssicher',
  })).filter((entry) => entry.language);

  if (languages.length > 0) {
    return languages;
  }

  return fallback.languageProficiencies?.length
    ? fallback.languageProficiencies
    : [{ language: 'Deutsch', level: 'Muttersprachliches Niveau' }];
}

export function mapResumeProfileToCandidateSeed(
  profile: NormalizedCandidateProfile,
  fallback: ResumeMappingFallbacks = {},
  createId: () => string = () => Math.random().toString(36).slice(2, 10),
): ResumeMappedCandidateSeed {
  const email = getFieldValue(profile.email) || fallback.email || '';
  const linkedinUrl = getFieldValue(profile.linkedinUrl) || '';
  const inferredNameParts = inferNamePartsFromContact(email, linkedinUrl);
  const languageProficiencies = normalizeLanguageProficiencies(profile, fallback);
  const targetRole = getFieldValue(profile.zielrolle) || '';
  const workModel = getFieldValue(profile.arbeitsmodellPraeferenz);
  const salaryExpectationBase = getFieldValue(profile.gehaltBaseJahr) ?? fallback.salaryExpectationBase ?? 60000;
  const salaryExpectationOte = getFieldValue(profile.gehaltOTEJahr) ?? fallback.salaryExpectationOte ?? 100000;

  return {
    firstName: getFieldValue(profile.vorname) || inferredNameParts.firstName || fallback.firstName || '',
    lastName: getFieldValue(profile.nachname) || inferredNameParts.lastName || fallback.lastName || '',
    email,
    phone: getFieldValue(profile.telefon) || '',
    linkedinUrl,
    location: getFieldValue(profile.standort) || '',
    remotePreference: workModel && workModel !== 'unknown' ? [workModel] : [],
    currentRole: getFieldValue(profile.aktuelleRolle) || '',
    targetRole,
    desiredJobRoles: targetRole ? [targetRole] : [],
    yearsOfExperience: getFieldValue(profile.berufserfahrungJahre) ?? 0,
    seniority: getFieldValue(profile.seniority) || '',
    skills: getFieldValue(profile.skills) || [],
    languages: languageProficiencies.map((entry) => entry.language),
    languageProficiencies,
    workExperiences: (getFieldValue(profile.berufsstationen) || []).map((entry) => ({
      id: createId(),
      title: entry.title || '',
      company: entry.company || '',
      startDate: entry.startDate || '',
      endDate: entry.endDate || '',
      isCurrent: Boolean(entry.isCurrent),
      summary: entry.summary || '',
    })),
    educations: (getFieldValue(profile.ausbildungen) || []).map((entry) => ({
      id: createId(),
      degree: entry.degree || '',
      institution: entry.institution || '',
      startYear: entry.startYear || '',
      endYear: entry.endYear || '',
    })),
    salaryExpectationBase,
    salaryExpectationOte,
    noticePeriod: getFieldValue(profile.kuendigungsfrist) || '',
    onboardingSource: 'cv',
  };
}
