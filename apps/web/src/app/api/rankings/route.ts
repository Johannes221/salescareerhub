import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@salescareerhub/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country') || '';

    const where: any = {};
    if (country) where.country = country;

    const rankings = await prisma.rankingSnapshot.findMany({
      where,
      include: { company: { select: { name: true, slug: true, logoUrl: true, isVerified: true, industry: true } } },
      orderBy: { rank: 'asc' },
    });

    return NextResponse.json({ success: true, data: rankings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fehler beim Laden' }, { status: 500 });
  }
}
