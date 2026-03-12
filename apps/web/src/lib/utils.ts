import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Formatting ──────────────────────────────────────────────
export function formatCurrency(amount: number, currency = 'EUR', locale = 'de-DE'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatSalaryRange(min?: number, max?: number, currency = 'EUR'): string {
  if (!min && !max) return 'Auf Anfrage';
  if (min && max) return `${formatCurrency(min, currency)} – ${formatCurrency(max, currency)}`;
  if (min) return `ab ${formatCurrency(min, currency)}`;
  return `bis ${formatCurrency(max!, currency)}`;
}

export function formatDate(date: Date | string, locale = 'de-DE'): string {
  return new Date(date).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatRelativeDate(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Heute';
  if (diffDays === 1) return 'Gestern';
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  if (diffDays < 30) return `vor ${Math.floor(diffDays / 7)} Wochen`;
  if (diffDays < 365) return `vor ${Math.floor(diffDays / 30)} Monaten`;
  return `vor ${Math.floor(diffDays / 365)} Jahren`;
}

function formatCalendarDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export function buildCalendarUrl(input: {
  title: string;
  start: Date | string;
  end?: Date | string;
  details?: string;
  location?: string;
}) {
  const start = new Date(input.start);
  const end = input.end ? new Date(input.end) : new Date(start.getTime() + 45 * 60 * 1000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: input.title,
    dates: `${formatCalendarDate(start)}/${formatCalendarDate(end)}`,
  });

  if (input.details) {
    params.set('details', input.details);
  }

  if (input.location) {
    params.set('location', input.location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function getCandidateApplicationStage(status?: string | null) {
  switch (status) {
    case 'screening':
    case 'shortlisted':
      return 'Screening';
    case 'forwarded':
    case 'interview_1':
    case 'interview_2':
    case 'offer':
      return 'Intro Sent';
    case 'rejected':
    case 'withdrawn':
      return 'Rejected';
    case 'hired':
      return 'Hired';
    default:
      return 'Applied';
  }
}

export function getCandidateApplicationStageVariant(status?: string | null): string {
  switch (getCandidateApplicationStage(status)) {
    case 'Screening':
      return 'warning';
    case 'Intro Sent':
      return 'secondary';
    case 'Rejected':
      return 'destructive';
    case 'Hired':
      return 'success';
    default:
      return 'outline';
  }
}

export function getPublicCompanyLabel(input?: {
  anonymizedCompanyProfile?: string | null;
  industry?: string | null;
  companyStage?: string | null;
  country?: string | null;
} | null): string {
  const profile = input?.anonymizedCompanyProfile?.trim();
  if (profile) return profile;

  const parts = [input?.industry, input?.companyStage]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map((value) => value.trim());

  if (parts.length > 0) {
    return input?.country ? `${parts.join(' · ')} · ${input.country}` : parts.join(' · ');
  }

  if (input?.country) {
    return `Vertrauliches Unternehmen in ${input.country}`;
  }

  return 'Vertrauliches B2B SaaS Unternehmen';
}

export function serializeCsv(rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) {
    return '';
  }

  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set<string>()),
  );

  const escapeValue = (value: unknown) => {
    if (value === null || value === undefined) return '""';

    const normalized = Array.isArray(value)
      ? value.join(', ')
      : typeof value === 'object'
        ? JSON.stringify(value)
        : String(value);

    return `"${normalized.replace(/"/g, '""')}"`;
  };

  return [
    headers.map(escapeValue).join(','),
    ...rows.map((row) => headers.map((header) => escapeValue(row[header])).join(',')),
  ].join('\n');
}

// ─── Slugify ─────────────────────────────────────────────────
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

// ─── Validation Schemas ──────────────────────────────────────
export const emailSchema = z.string().email('Bitte gib eine gültige E-Mail-Adresse ein');

export const passwordSchema = z
  .string()
  .min(8, 'Passwort muss mindestens 8 Zeichen lang sein')
  .regex(/[A-Z]/, 'Passwort muss mindestens einen Großbuchstaben enthalten')
  .regex(/[0-9]/, 'Passwort muss mindestens eine Zahl enthalten');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Passwort ist erforderlich'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  role: z.enum(['candidate', 'company']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirmPassword'],
});

const requiredNumber = (fieldLabel: string) => z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
  z.number({
    required_error: `${fieldLabel} ist erforderlich`,
    invalid_type_error: `${fieldLabel} ist erforderlich`,
  }).min(0, `${fieldLabel} ist erforderlich`),
);

const optionalNumber = () => z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
  z.number().min(0).optional(),
);

const stringArraySchema = () => z.array(z.string().trim().min(1));

export const languageProficiencySchema = z.object({
  language: z.string().trim().min(1, 'Sprache ist erforderlich'),
  level: z.string().trim().min(1, 'Sprachniveau ist erforderlich'),
});

export const workExperienceSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1, 'Jobtitel ist erforderlich'),
  company: z.string().trim().min(1, 'Unternehmen ist erforderlich'),
  startDate: z.string().trim().optional().or(z.literal('')),
  endDate: z.string().trim().optional().or(z.literal('')),
  isCurrent: z.boolean().default(false),
  summary: z.string().max(2000).optional().or(z.literal('')),
});

export const educationSchema = z.object({
  id: z.string().trim().min(1),
  degree: z.string().trim().optional().or(z.literal('')),
  institution: z.string().trim().optional().or(z.literal('')),
  startYear: z.string().trim().optional().or(z.literal('')),
  endYear: z.string().trim().optional().or(z.literal('')),
});

export function deriveSeniorityFromYears(yearsOfExperience?: number | null) {
  if (yearsOfExperience === null || yearsOfExperience === undefined || Number.isNaN(yearsOfExperience)) {
    return undefined;
  }

  if (yearsOfExperience < 2) return 'junior';
  if (yearsOfExperience < 5) return 'mid';
  if (yearsOfExperience < 8) return 'senior';
  if (yearsOfExperience < 11) return 'lead';
  if (yearsOfExperience < 14) return 'head';
  if (yearsOfExperience < 17) return 'director';
  if (yearsOfExperience < 20) return 'vp';
  return 'c-level';
}

export const candidateProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'Vorname ist erforderlich'),
  lastName: z.string().trim().min(1, 'Nachname ist erforderlich'),
  email: emailSchema,
  phone: z.string().optional(),
  linkedinUrl: z.string().url('Ungültige URL').optional().or(z.literal('')),
  location: z.string().trim().min(1, 'Standort ist erforderlich'),
  country: z.string().trim().min(1, 'Land ist erforderlich'),
  remotePreference: stringArraySchema().min(1, 'Bitte wähle mindestens eine Arbeitspräferenz aus'),
  yearsOfExperience: requiredNumber('Berufserfahrung'),
  currentRole: z.string().trim().min(1, 'Aktuelle Rolle ist erforderlich'),
  targetRole: z.string().trim().optional().or(z.literal('')),
  desiredJobRoles: stringArraySchema().min(1, 'Bitte wähle mindestens eine Zielrolle aus'),
  desiredIndustries: stringArraySchema().min(1, 'Bitte wähle mindestens eine Branche aus'),
  careerGoals: stringArraySchema().min(1, 'Bitte wähle mindestens ein Karriereziel aus'),
  preferredCompanyTypes: stringArraySchema().default([]),
  seniority: z.string().optional(),
  languages: stringArraySchema().default([]),
  languageProficiencies: z.array(languageProficiencySchema).min(1, 'Bitte gib mindestens eine Sprache an'),
  salaryExpectationBase: requiredNumber('Grundgehalt'),
  salaryExpectationOte: requiredNumber('OTE'),
  salaryExpectationCurrency: z.string().default('EUR'),
  noticePeriod: z.string().trim().optional(),
  shortBio: z.string().max(1000).optional().or(z.literal('')),
  skills: stringArraySchema().min(5, 'Bitte wähle mindestens 5 Skills aus'),
  workExperiences: z.array(workExperienceSchema).default([]),
  educations: z.array(educationSchema).default([]),
  cvUrl: z.string().url('Ungültige Dateiadresse').optional().or(z.literal('')),
  cvFileName: z.string().optional().or(z.literal('')),
  cvUploadDate: z.any().optional(),
  googlePlaceId: z.string().optional().or(z.literal('')),
  googlePlaceData: z.record(z.any()).optional(),
  onboardingStep: optionalNumber(),
  onboardingSource: z.enum(['manual', 'cv']).optional(),
  visibleToRecruiters: z.boolean().default(false),
  openToWork: z.boolean().default(true),
}).refine((data) => Number(data.salaryExpectationOte) >= Number(data.salaryExpectationBase), {
  message: 'OTE muss mindestens so hoch wie das Grundgehalt sein',
  path: ['salaryExpectationOte'],
});

export const applicationSubmissionSchema = z.object({
  jobId: z.string().trim().min(1, 'Job-ID erforderlich'),
  linkedinUrl: z.string().trim().url('LinkedIn-Profil ist erforderlich'),
  yearsOfSalesExperience: optionalNumber(),
  currentRole: z.string().trim().optional().or(z.literal('')),
  averageDealSize: optionalNumber(),
  averageSalesCycle: optionalNumber(),
  quotaTarget: optionalNumber(),
  quotaAttainment: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
    z.number().min(0).max(999).optional(),
  ),
  industriesExperience: stringArraySchema().default([]),
  salesMotionExperience: stringArraySchema().default([]),
  largestDealClosed: optionalNumber(),
  territoryType: z.string().trim().optional().or(z.literal('')),
  candidateMessage: z.string().max(2000).optional().or(z.literal('')),
});

export const companyProfileSchema = z.object({
  name: z.string().min(1, 'Firmenname ist erforderlich'),
  website: z.string().url('Ungültige URL').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Ungültige URL').optional().or(z.literal('')),
  country: z.string().optional(),
  city: z.string().optional(),
  employeeCount: z.string().optional(),
  fundingStage: z.string().optional(),
  industry: z.string().optional(),
  description: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  remotePolicy: z.string().optional(),
  salesTeamSize: z.string().optional(),
  atsLink: z.string().url('Ungültige URL').optional().or(z.literal('')),
});

export const jobSchema = z.object({
  title: z.string().min(1, 'Jobtitel ist erforderlich'),
  roleCategory: z.string().min(1, 'Rolle ist erforderlich'),
  seniority: z.string().min(1, 'Seniority ist erforderlich'),
  employmentType: z.string().default('fulltime'),
  location: z.string().optional(),
  country: z.string().optional(),
  remoteType: z.string().default('hybrid'),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  oteMin: z.number().min(0).optional(),
  oteMax: z.number().min(0).optional(),
  currency: z.string().default('EUR'),
  description: z.string().min(1, 'Beschreibung ist erforderlich'),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  sourceType: z.string().default('direct_company_posting'),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
});

export const leadSchema = z.object({
  type: z.enum(['company_listing', 'talent_network', 'contact']),
  name: z.string().min(1, 'Name ist erforderlich'),
  email: emailSchema,
  company: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
});

export const reviewSchema = z.object({
  compensation: z.number().min(1).max(5),
  quotaRealism: z.number().min(1).max(5),
  leadQuality: z.number().min(1).max(5),
  careerOpportunities: z.number().min(1).max(5),
  productMarketFit: z.number().min(1).max(5),
  management: z.number().min(1).max(5),
  culture: z.number().min(1).max(5),
  workLifeBalance: z.number().min(1).max(5),
  reviewText: z.string().optional(),
  pros: z.string().optional(),
  cons: z.string().optional(),
  roleAtCompany: z.string().optional(),
});

// ─── Permissions ─────────────────────────────────────────────
type Permission =
  | 'jobs:read'
  | 'jobs:create'
  | 'jobs:edit'
  | 'jobs:delete'
  | 'jobs:approve'
  | 'applications:read'
  | 'applications:create'
  | 'applications:manage'
  | 'candidates:read'
  | 'candidates:manage'
  | 'companies:read'
  | 'companies:manage'
  | 'reviews:read'
  | 'reviews:create'
  | 'reviews:manage'
  | 'salary:read'
  | 'salary:manage'
  | 'rankings:read'
  | 'rankings:manage'
  | 'content:read'
  | 'content:manage'
  | 'leads:read'
  | 'leads:manage'
  | 'users:manage'
  | 'settings:manage'
  | 'analytics:read'
  | 'logs:read';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    'jobs:read', 'jobs:create', 'jobs:edit', 'jobs:delete', 'jobs:approve',
    'applications:read', 'applications:create', 'applications:manage',
    'candidates:read', 'candidates:manage',
    'companies:read', 'companies:manage',
    'reviews:read', 'reviews:create', 'reviews:manage',
    'salary:read', 'salary:manage',
    'rankings:read', 'rankings:manage',
    'content:read', 'content:manage',
    'leads:read', 'leads:manage',
    'users:manage', 'settings:manage',
    'analytics:read', 'logs:read',
  ],
  company: [
    'jobs:read', 'jobs:create', 'jobs:edit',
    'applications:read',
    'companies:read',
    'reviews:read',
    'salary:read',
    'rankings:read',
    'content:read',
  ],
  candidate: [
    'jobs:read',
    'applications:read', 'applications:create',
    'candidates:read',
    'companies:read',
    'reviews:read', 'reviews:create',
    'salary:read',
    'rankings:read',
    'content:read',
  ],
  recruiter: [
    'jobs:read', 'jobs:create', 'jobs:edit',
    'applications:read', 'applications:manage',
    'candidates:read',
    'companies:read',
    'reviews:read',
    'salary:read',
    'rankings:read',
    'content:read',
  ],
};

export function hasPermission(role: string, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export type { Permission };

// ─── Analytics Event Tracking ────────────────────────────────
export function trackEvent(eventType: string, entityId?: string, metadata?: Record<string, unknown>) {
  // This sends to our API endpoint for tracking
  if (typeof window !== 'undefined') {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, entityId, metadata }),
    }).catch(() => {
      // Silent fail for analytics
    });
  }
}

// ─── Misc ────────────────────────────────────────────────────
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '…';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
