import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const posts = await prisma.contentPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fehler beim Laden' }, { status: 500 });
  }
}
