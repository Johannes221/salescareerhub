import { buildPublicCompanyLabel } from '@/services/jobAnonymizer';

export const publicJobSelect = {
  id: true,
  title: true,
  slug: true,
  anonymizedCompanyProfile: true,
  roleCategory: true,
  seniority: true,
  employmentType: true,
  location: true,
  country: true,
  remoteType: true,
  industry: true,
  companyStage: true,
  salaryMin: true,
  salaryMax: true,
  baseSalary: true,
  oteMin: true,
  oteMax: true,
  currency: true,
  commissionStructure: true,
  salesMotion: true,
  averageDealSize: true,
  salesCycleLength: true,
  quota: true,
  description: true,
  descriptionAnonymized: true,
  requirements: true,
  benefits: true,
  sourceType: true,
  applyViaPlattform: true,
  status: true,
  approvalStatus: true,
  isFeatured: true,
  isAgencyManaged: true,
  tags: true,
  viewCount: true,
  interestCount: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  company: {
    select: {
      isVerified: true,
      employeeCount: true,
    },
  },
} as const;

export function mapJobToPublic<
  T extends {
    description?: string | null;
    descriptionAnonymized?: string | null;
    anonymizedCompanyProfile?: string | null;
    company?: { isVerified?: boolean | null; employeeCount?: string | null } | null;
  }
>(job: T) {
  const { descriptionAnonymized, company, ...rest } = job;

  return {
    ...rest,
    description:
      typeof descriptionAnonymized === 'string' && descriptionAnonymized.trim().length > 0
        ? descriptionAnonymized
        : job.description,
    company: {
      name: buildPublicCompanyLabel(job.anonymizedCompanyProfile),
      isVerified: company?.isVerified || false,
      employeeCount: company?.employeeCount || null,
    },
  };
}
