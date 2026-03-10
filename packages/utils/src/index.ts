import { z } from 'zod';

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

export const candidateProfileSchema = z.object({
  firstName: z.string().min(1, 'Vorname ist erforderlich'),
  lastName: z.string().min(1, 'Nachname ist erforderlich'),
  email: emailSchema,
  phone: z.string().optional(),
  linkedinUrl: z.string().url('Ungültige URL').optional().or(z.literal('')),
  location: z.string().optional(),
  country: z.string().optional(),
  remotePreference: z.string().optional(),
  yearsOfExperience: z.number().min(0).optional(),
  currentRole: z.string().optional(),
  targetRole: z.string().optional(),
  seniority: z.string().optional(),
  languages: z.array(z.string()).optional(),
  salaryExpectationBase: z.number().min(0).optional(),
  salaryExpectationOte: z.number().min(0).optional(),
  noticePeriod: z.string().optional(),
  shortBio: z.string().max(1000).optional(),
  skills: z.array(z.string()).optional(),
  visibleToRecruiters: z.boolean().default(false),
  openToWork: z.boolean().default(true),
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
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '…';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
