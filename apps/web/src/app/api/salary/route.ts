import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country') || '';
    const role = searchParams.get('role') || '';

    const where: any = {};
    if (country) where.country = country;
    if (role) where.role = role;

    const insights = await prisma.salaryInsight.findMany({
      where,
      orderBy: [{ role: 'asc' }, { seniority: 'asc' }],
    });

    return NextResponse.json({ success: true, data: insights });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fehler beim Laden' }, { status: 500 });
  }
}
