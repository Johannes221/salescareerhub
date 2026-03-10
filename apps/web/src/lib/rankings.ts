import { prisma } from '@/lib/db';

export const DEFAULT_RANKING_CATEGORY = 'general';

export function getCurrentRankingPeriod(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

export async function generateRankingSnapshots(period = getCurrentRankingPeriod(), category = DEFAULT_RANKING_CATEGORY) {
  const companies = await prisma.company.findMany({
    include: {
      reviews: {
        where: { status: 'approved' },
        select: { overallRating: true },
      },
      jobs: {
        where: { status: 'live', approvalStatus: 'approved' },
        select: { id: true },
      },
    },
  });

  const candidates = companies
    .map((company) => {
      const reviewCount = company.reviews.length;
      const avgRating = reviewCount > 0
        ? company.reviews.reduce((sum, review) => sum + review.overallRating, 0) / reviewCount
        : 0;
      const hiringActivity = company.jobs.length;
      const overallScore = Number((avgRating * 20 + (company.isVerified ? 5 : 0) + Math.min(hiringActivity, 10) * 1.5).toFixed(2));

      return {
        companyId: company.id,
        country: company.country || null,
        overallScore,
        avgRating: Number(avgRating.toFixed(2)),
        reviewCount,
        isVerified: company.isVerified,
        hiringActivity,
      };
    })
    .filter((item) => item.reviewCount > 0 || item.hiringActivity > 0)
    .sort((a, b) => b.overallScore - a.overallScore);

  await prisma.rankingSnapshot.deleteMany({ where: { period, category } });

  if (candidates.length > 0) {
    await prisma.rankingSnapshot.createMany({
      data: candidates.map((item, index) => ({
        companyId: item.companyId,
        overallScore: item.overallScore,
        avgRating: item.avgRating,
        reviewCount: item.reviewCount,
        isVerified: item.isVerified,
        hiringActivity: item.hiringActivity,
        rank: index + 1,
        country: item.country,
        category,
        period,
      })),
    });
  }

  return { generated: candidates.length, period, category };
}

export async function ensureRankingSnapshots(period = getCurrentRankingPeriod(), category = DEFAULT_RANKING_CATEGORY) {
  const existingCount = await prisma.rankingSnapshot.count({ where: { period, category } });
  if (existingCount > 0) {
    return { generated: 0, period, category, created: false };
  }

  const result = await generateRankingSnapshots(period, category);
  return { ...result, created: true };
}
