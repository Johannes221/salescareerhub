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
  | 'shortlisted'
  | 'forwarded'
  | 'interview_1'
  | 'interview_2'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  date: string;
  note?: string;
}

export const APPLICATION_PIPELINE_STAGES = [
  { key: 'interest_expressed', label: 'Bewerbung', shortLabel: 'Beworben' },
  { key: 'screening', label: 'Screening', shortLabel: 'Screening' },
  { key: 'shortlisted', label: 'Vorausgewählt', shortLabel: 'Shortlist' },
  { key: 'forwarded', label: 'Weitergeleitet', shortLabel: 'Intro' },
  { key: 'interview_1', label: 'Erstgespräch', shortLabel: 'Interview 1' },
  { key: 'interview_2', label: 'Fachgespräch', shortLabel: 'Interview 2' },
  { key: 'offer', label: 'Angebot', shortLabel: 'Angebot' },
  { key: 'hired', label: 'Eingestellt', shortLabel: 'Hired' },
  { key: 'rejected', label: 'Absage', shortLabel: 'Absage' },
  { key: 'withdrawn', label: 'Zurückgezogen', shortLabel: 'Zurückgez.' },
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
