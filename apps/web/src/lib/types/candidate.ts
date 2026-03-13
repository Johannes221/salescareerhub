// ─── Candidate Platform Types ────────────────────────────────

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  location?: string;
  country?: string;
  workModel?: 'remote' | 'hybrid' | 'onsite';
  seniority?: string;
  salaryMin?: number;
  salaryMax?: number;
  oteMin?: number;
  oteMax?: number;
  tags?: string[];
  descriptionPreview?: string;
  publishedAt?: string;
  slug?: string;
  matchScore?: number;
  matchReasons?: string[];
  roleCategory?: string;
  industry?: string;
  isSaved?: boolean;
}

export interface ApplicationEntry {
  id: string;
  candidateId?: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location?: string;
  appliedAt: string;
  currentStatus: ApplicationStatus;
  statusHistory?: StatusHistoryEntry[];
  nextStep?: string;
  nextStepDate?: string;
  notes?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  interviewCount?: number;
  candidateMessage?: string;
  jobSlug?: string;
}

export type ApplicationStatus =
  | 'interest_expressed'
  | 'screening'
  | 'recruiter_call'
  | 'briefing'
  | 'hiring_team'
  | 'contract_negotiation'
  | 'signed'
  | 'rejected'
  | 'withdrawn';

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  date: string;
  note?: string;
}

export const APPLICATION_PIPELINE_STAGES = [
  { key: 'interest_expressed', label: 'Bewerbung eingegangen', shortLabel: 'Beworben' },
  { key: 'screening', label: 'Recruiter Screening', shortLabel: 'Screening' },
  { key: 'recruiter_call', label: 'Recruiter Call', shortLabel: 'Call' },
  { key: 'briefing', label: 'Briefing mit Recruiter', shortLabel: 'Briefing' },
  { key: 'hiring_team', label: 'Hiring Team Kennenlernen', shortLabel: 'Hiring Team' },
  { key: 'contract_negotiation', label: 'Vertragsverhandlung', shortLabel: 'Verhandlung' },
  { key: 'signed', label: 'Unterschrift & Start', shortLabel: 'Unterschrift' },
  { key: 'rejected', label: 'Absage', shortLabel: 'Absage' },
  { key: 'withdrawn', label: 'Zurückgezogen', shortLabel: 'Zurückg ez.' },
] as const;

export interface InsightArticle {
  id: string;
  type: 'salary_report' | 'trend' | 'career_tip' | 'market_report';
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  category: string;
  publishedAt: string;
  readingTime?: number;
  coverImage?: string;
}

export interface SalaryReportSubmission {
  role: string;
  seniority: string;
  country: string;
  region?: string;
  baseSalary: number;
  ote: number;
  variableComp?: number;
  companySize?: string;
  workModel: string;
  yearsExperience: number;
  industry?: string;
  comment?: string;
}

export interface CandidateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  location?: string;
  country?: string;
  currentRole?: string;
  targetRole?: string;
  targetRoles?: string[];
  preferredCountries?: string[];
  preferredWorkModels?: string[];
  targetOTE?: number;
  seniority?: string;
  experienceYears?: number;
  industries?: string[];
  salesMotion?: string[];
  averageDealSize?: number;
  averageSalesCycle?: number;
  quotaAttainment?: number;
  largestDealClosed?: number;
  territorySize?: string;
  skills?: string[];
  languages?: string[];
  cvUrl?: string;
  cvFileName?: string;
  profileCompletionScore?: number;
}

export interface JobFilters {
  roles: string[];
  countries: string[];
  workModels: string[];
  seniorityLevels: string[];
  industries: string[];
  search: string;
  sort: string;
}

export const EMPTY_JOB_FILTERS: JobFilters = {
  roles: [],
  countries: [],
  workModels: [],
  seniorityLevels: [],
  industries: [],
  search: '',
  sort: 'newest',
};

export interface DashboardSummary {
  activeApplications: number;
  interviewsThisWeek: number;
  pendingFeedback: number;
  newMatches: number;
  profileCompletionScore: number;
  savedJobs: number;
}
