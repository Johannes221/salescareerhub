import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const companies = await prisma.company.findMany({
      where: { user: { isActive: true } },
      orderBy: [{ isFeatured: 'desc' }, { isVerified: 'desc' }, { name: 'asc' }],
    });
    return NextResponse.json({ success: true, data: companies });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fehler beim Laden' }, { status: 500 });
  }
}
