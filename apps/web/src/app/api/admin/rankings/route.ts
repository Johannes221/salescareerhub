import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyIdToken } from '@/lib/auth/server';
import { generateRankingSnapshots, getCurrentRankingPeriod, DEFAULT_RANKING_CATEGORY } from '@/lib/rankings';

async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    const user = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });
    return user?.role === 'admin' ? user : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });
    }

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
