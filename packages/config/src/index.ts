export const APP_CONFIG = {
  name: 'SalesCareerHub',
  shortName: 'SCH',
  domain: 'salescareerhub.de',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  description: 'Die spezialisierte Plattform für Software Sales Karrieren im DACH-Raum',
  tagline: 'Deine Karriere im Software Sales – transparent, spezialisiert, persönlich.',
  locale: 'de-DE',
  currency: 'EUR',
  supportedLocales: ['de'] as const,
  contact: {
    email: 'info@salescareerhub.de',
    phone: '+49 XXX XXXXXXX',
  },
} as const;

export const ROLES = {
  ADMIN: 'admin',
  COMPANY: 'company',
  CANDIDATE: 'candidate',
  RECRUITER: 'recruiter',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  company: 'Unternehmen',
  candidate: 'Kandidat',
  recruiter: 'Recruiter',
};

export const JOB_ROLES = [
  'SDR',
  'BDR',
  'Account Executive',
  'Mid-Market AE',
  'Enterprise AE',
  'Strategic AE',
  'Sales Manager',
  'Head of Sales',
  'VP Sales',
  'Revenue Operations',
  'Sales Engineer',
  'Customer Success',
] as const;

export type JobRole = (typeof JOB_ROLES)[number];

export const JOB_ROLE_LABELS: Record<JobRole, string> = {
  SDR: 'Sales Development Representative',
  BDR: 'Business Development Representative',
  'Account Executive': 'Account Executive',
  'Mid-Market AE': 'Mid-Market Account Executive',
  'Enterprise AE': 'Enterprise Account Executive',
  'Strategic AE': 'Strategic Account Executive',
  'Sales Manager': 'Sales Manager',
  'Head of Sales': 'Head of Sales',
  'VP Sales': 'VP Sales',
  'Revenue Operations': 'Revenue Operations',
  'Sales Engineer': 'Sales Engineer / Pre-Sales',
  'Customer Success': 'Customer Success',
};

export const SENIORITY_LEVELS = [
  'junior',
  'mid',
  'senior',
  'lead',
  'head',
  'director',
  'vp',
  'c-level',
] as const;

export type SeniorityLevel = (typeof SENIORITY_LEVELS)[number];

export const SENIORITY_LABELS: Record<SeniorityLevel, string> = {
  junior: 'Junior',
  mid: 'Mid-Level',
  senior: 'Senior',
  lead: 'Lead',
  head: 'Head of',
  director: 'Director',
  vp: 'VP',
  'c-level': 'C-Level',
};

export const EMPLOYMENT_TYPES = ['fulltime', 'parttime', 'contract', 'freelance'] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  fulltime: 'Vollzeit',
  parttime: 'Teilzeit',
  contract: 'Befristet',
  freelance: 'Freelance',
};

export const REMOTE_TYPES = ['remote', 'hybrid', 'onsite'] as const;
export type RemoteType = (typeof REMOTE_TYPES)[number];

export const REMOTE_TYPE_LABELS: Record<RemoteType, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'Vor Ort',
};

export const COUNTRIES = ['Deutschland', 'Österreich', 'Schweiz'] as const;
export type Country = (typeof COUNTRIES)[number];

export const SOURCE_TYPES = [
  'direct_company_posting',
  'approved_mirrored_posting',
  'external_source_link',
  'agency_managed_job',
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  direct_company_posting: 'Direkt vom Unternehmen',
  approved_mirrored_posting: 'Genehmigte Spiegelung',
  external_source_link: 'Externer Link',
  agency_managed_job: 'Agentur-betreut',
};

export const JOB_STATUS = ['draft', 'pending_review', 'live', 'archived'] as const;
export type JobStatus = (typeof JOB_STATUS)[number];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: 'Entwurf',
  pending_review: 'Zur Prüfung',
  live: 'Live',
  archived: 'Archiviert',
};

export const APPLICATION_STATUS = [
  'interest_expressed',
  'screening',
  'shortlisted',
  'forwarded',
  'interview_1',
  'interview_2',
  'offer',
  'hired',
  'rejected',
  'withdrawn',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUS)[number];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  interest_expressed: 'Interesse bekundet',
  screening: 'In Prüfung',
  shortlisted: 'Vorausgewählt',
  forwarded: 'Weitergeleitet',
  interview_1: 'Interview 1',
  interview_2: 'Interview 2',
  offer: 'Angebot',
  hired: 'Eingestellt',
  rejected: 'Abgelehnt',
  withdrawn: 'Zurückgezogen',
};

export const APPROVAL_STATUS = ['pending', 'approved', 'rejected'] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUS)[number];

export const REVIEW_DIMENSIONS = [
  'compensation',
  'quota_realism',
  'lead_quality',
  'career_opportunities',
  'product_market_fit',
  'management',
  'culture',
  'work_life_balance',
] as const;

export type ReviewDimension = (typeof REVIEW_DIMENSIONS)[number];

export const REVIEW_DIMENSION_LABELS: Record<ReviewDimension, string> = {
  compensation: 'Vergütung',
  quota_realism: 'Quota-Realismus',
  lead_quality: 'Lead-Qualität',
  career_opportunities: 'Karrierechancen',
  product_market_fit: 'Produkt-Markt-Fit',
  management: 'Management',
  culture: 'Kultur',
  work_life_balance: 'Work-Life-Balance',
};

export const FUNDING_STAGES = [
  'bootstrapped',
  'pre-seed',
  'seed',
  'series-a',
  'series-b',
  'series-c',
  'series-d+',
  'public',
  'acquired',
] as const;

export type FundingStage = (typeof FUNDING_STAGES)[number];

export const FUNDING_STAGE_LABELS: Record<FundingStage, string> = {
  bootstrapped: 'Bootstrapped',
  'pre-seed': 'Pre-Seed',
  seed: 'Seed',
  'series-a': 'Series A',
  'series-b': 'Series B',
  'series-c': 'Series C',
  'series-d+': 'Series D+',
  public: 'Börsennotiert',
  acquired: 'Akquiriert',
};

export const CONTENT_TYPES = [
  'guide',
  'salary_report',
  'interview_tips',
  'company_insight',
  'market_report',
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  guide: 'Karriere-Guide',
  salary_report: 'Gehaltsreport',
  interview_tips: 'Interview-Tipps',
  company_insight: 'Unternehmens-Einblick',
  market_report: 'Marktreport',
};

export const FILE_UPLOAD = {
  maxSizeMB: 10,
  allowedImageTypes: ['image/png', 'image/jpeg', 'image/webp'],
  allowedDocTypes: ['application/pdf'],
  allowedTypes: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
} as const;

export const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1001-5000',
  '5000+',
] as const;

export type CompanySize = (typeof COMPANY_SIZES)[number];
