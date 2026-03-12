import type {
  Role,
  JobRole,
  SeniorityLevel,
  EmploymentType,
  RemoteType,
  SourceType,
  JobStatus,
  ApplicationStatus,
  ApprovalStatus,
  ReviewDimension,
  FundingStage,
  ContentType,
  CompanySize,
  Country,
} from '../config';

export type {
  Role,
  JobRole,
  SeniorityLevel,
  EmploymentType,
  RemoteType,
  SourceType,
  JobStatus,
  ApplicationStatus,
  ApprovalStatus,
  ReviewDimension,
  FundingStage,
  ContentType,
  CompanySize,
  Country,
};

// ─── User ────────────────────────────────────────────────────
export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  role: Role;
  displayName?: string;
  avatarUrl?: string;
  isActive: boolean;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  candidateProfile?: CandidateProfile | null;
}

// ─── Candidate Profile ──────────────────────────────────────
export interface CandidateProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  location?: string;
  country?: Country;
  remotePreference?: RemoteType[];
  yearsOfExperience?: number;
  currentRole?: string;
  targetRole?: JobRole | string;
  desiredJobRoles?: string[];
  desiredIndustries?: string[];
  careerGoals?: string[];
  preferredCompanyTypes?: string[];
  seniority?: SeniorityLevel;
  languages?: string[];
  languageProficiencies?: Array<{ language: string; level: string }>;
  salaryExpectationBase?: number;
  salaryExpectationOte?: number;
  salaryExpectationCurrency?: string;
  noticePeriod?: string;
  cvUrl?: string;
  cvFileName?: string;
  cvUploadDate?: Date | string;
  shortBio?: string;
  skills?: string[];
  workExperiences?: Array<{
    id: string;
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    summary?: string;
  }>;
  educations?: Array<{
    id: string;
    degree?: string;
    institution?: string;
    startYear?: string;
    endYear?: string;
  }>;
  googlePlaceId?: string;
  googlePlaceData?: Record<string, unknown>;
  onboardingStep?: number;
  onboardingSource?: 'manual' | 'cv';
  visibleToRecruiters: boolean;
  openToWork: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Company ─────────────────────────────────────────────────
export interface Company {
  id: string;
  userId: string;
  name: string;
  slug: string;
  logoUrl?: string;
  website?: string;
  linkedinUrl?: string;
  country?: Country;
  city?: string;
  employeeCount?: CompanySize;
  fundingStage?: FundingStage;
  industry?: string;
  description?: string;
  benefits?: string[];
  remotePolicy?: RemoteType;
  salesTeamSize?: string;
  atsLink?: string;
  isVerified: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Job ─────────────────────────────────────────────────────
export interface Job {
  id: string;
  companyId: string;
  company?: Company;
  title: string;
  slug: string;
  roleCategory: JobRole;
  seniority: SeniorityLevel;
  employmentType: EmploymentType;
  location?: string;
  country?: Country;
  remoteType: RemoteType;
  salaryMin?: number;
  salaryMax?: number;
  oteMin?: number;
  oteMax?: number;
  currency: string;
  description: string;
  requirements?: string;
  benefits?: string;
  sourceType: SourceType;
  sourceUrl?: string;
  applyViaPlattform: boolean;
  status: JobStatus;
  approvalStatus: ApprovalStatus;
  companyPermissionStatus?: ApprovalStatus;
  legalNotes?: string;
  verificationStatus?: ApprovalStatus;
  isFeatured: boolean;
  isAgencyManaged: boolean;
  tags?: string[];
  viewCount: number;
  interestCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Application (Interest / Agency-Managed) ────────────────
export interface Application {
  id: string;
  jobId: string;
  job?: Job;
  candidateId: string;
  candidate?: CandidateProfile;
  status: ApplicationStatus;
  recommendedByAdmin: boolean;
  internalNotes?: string;
  fitScore?: number;
  adminNotes?: string;
  candidateMessage?: string;
  forwardedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Saved Job ───────────────────────────────────────────────
export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  job?: Job;
  createdAt: Date;
}

// ─── Company Review ──────────────────────────────────────────
export interface CompanyReview {
  id: string;
  companyId: string;
  userId: string;
  compensation: number;
  quotaRealism: number;
  leadQuality: number;
  careerOpportunities: number;
  productMarketFit: number;
  management: number;
  culture: number;
  workLifeBalance: number;
  overallRating: number;
  reviewText?: string;
  pros?: string;
  cons?: string;
  roleAtCompany?: string;
  status: ApprovalStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Salary Insight ──────────────────────────────────────────
export interface SalaryInsight {
  id: string;
  role: JobRole;
  country: Country;
  region?: string;
  seniority: SeniorityLevel;
  baseSalaryMin: number;
  baseSalaryMedian: number;
  baseSalaryMax: number;
  oteMin: number;
  oteMedian: number;
  oteMax: number;
  currency: string;
  source?: string;
  confidenceScore: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Ranking Snapshot ────────────────────────────────────────
export interface RankingSnapshot {
  id: string;
  companyId: string;
  company?: Company;
  overallScore: number;
  avgRating: number;
  reviewCount: number;
  isVerified: boolean;
  hiringActivity: number;
  rank: number;
  country?: Country;
  category?: string;
  period: string;
  createdAt: Date;
}

// ─── Content Post ────────────────────────────────────────────
export interface ContentPost {
  id: string;
  title: string;
  slug: string;
  contentType: ContentType;
  excerpt?: string;
  body: string;
  coverImageUrl?: string;
  authorName?: string;
  isPublished: boolean;
  publishedAt?: Date;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Notification ────────────────────────────────────────────
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

// ─── Lead ────────────────────────────────────────────────────
export interface Lead {
  id: string;
  type: 'company_listing' | 'talent_network' | 'contact';
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
  status: 'new' | 'contacted' | 'converted' | 'archived';
  createdAt: Date;
}

// ─── Audit Log ───────────────────────────────────────────────
export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  details?: string;
  createdAt: Date;
}

// ─── Analytics Event ─────────────────────────────────────────
export type AnalyticsEventType =
  | 'job_viewed'
  | 'job_saved'
  | 'job_interest_expressed'
  | 'external_apply_clicked'
  | 'company_profile_viewed'
  | 'salary_page_viewed'
  | 'lead_form_submitted'
  | 'ranking_page_viewed';

export interface AnalyticsEvent {
  id: string;
  eventType: AnalyticsEventType;
  userId?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// ─── API Response Types ──────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Filter Types ────────────────────────────────────────────
export interface JobFilters {
  roleCategory?: JobRole;
  country?: Country;
  city?: string;
  remoteType?: RemoteType;
  salaryMin?: number;
  oteMin?: number;
  seniority?: SeniorityLevel;
  employmentType?: EmploymentType;
  verifiedCompany?: boolean;
  featured?: boolean;
  agencyManaged?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface RankingFilters {
  country?: Country;
  role?: JobRole;
  companySize?: CompanySize;
  fundingStage?: FundingStage;
  verifiedOnly?: boolean;
}
