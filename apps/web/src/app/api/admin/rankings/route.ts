import { NextRequest, NextResponse } from 'next/server';
import { isUser, requireAdmin } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { generateRankingSnapshots, getCurrentRankingPeriod, DEFAULT_RANKING_CATEGORY } from '@/lib/rankings';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!isUser(admin)) return admin;

    const period = getCurrentRankingPeriod();
    const result = await generateRankingSnapshots(period, DEFAULT_RANKING_CATEGORY);

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'rankings_generated',
        entity: 'RankingSnapshot',
        entityId: period,
        details: `Generated ${result.generated} ranking snapshots for ${period}`,
      },
    });

    return NextResponse.json({ success: true, generated: result.generated, period });
  } catch (error) {
    console.error('Rankings generation error:', error);
    return NextResponse.json({ success: false, error: 'Fehler bei der Ranking-Generierung' }, { status: 500 });
  }
}
