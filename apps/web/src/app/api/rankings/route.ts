import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@salescareerhub/db';
import { ensureRankingSnapshots, getCurrentRankingPeriod, DEFAULT_RANKING_CATEGORY } from '@/lib/rankings';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const country = searchParams.get('country') || '';
    const period = searchParams.get('period') || getCurrentRankingPeriod();

    await ensureRankingSnapshots(period, DEFAULT_RANKING_CATEGORY);

    const where: any = {};
    if (country) where.country = country;
    where.period = period;
    where.category = DEFAULT_RANKING_CATEGORY;

    const rankings = await prisma.rankingSnapshot.findMany({
      where,
      include: { company: { select: { name: true, slug: true, logoUrl: true, isVerified: true, industry: true } } },
      orderBy: { rank: 'asc' },
    });

    return NextResponse.json({ success: true, data: rankings });
  } catch (error) {
    console.error('Rankings loading error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Laden' }, { status: 500 });
  }
}
