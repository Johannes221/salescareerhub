import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@salescareerhub/db';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const post = await prisma.contentPost.findUnique({ where: { slug: params.slug } });
    if (!post || !post.isPublished) {
      return NextResponse.json({ success: false, error: 'Nicht gefunden' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}
