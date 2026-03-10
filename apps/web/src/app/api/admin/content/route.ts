import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@salescareerhub/db';
import { verifyIdToken } from '@salescareerhub/auth/server';
import { slugify } from '@salescareerhub/utils';

async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    const user = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });
    return user?.role === 'admin' ? user : null;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });
    const posts = await prisma.contentPost.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: posts });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });

    const body = await req.json();
    const { title, contentType, excerpt, body: postBody, coverImageUrl, authorName, tags } = body;

    if (!title || !postBody) return NextResponse.json({ success: false, error: 'Titel und Inhalt erforderlich' }, { status: 400 });

    const slug = slugify(title) + '-' + Date.now().toString(36);
    const post = await prisma.contentPost.create({
      data: {
        title, slug, contentType: contentType || 'guide',
        excerpt, body: postBody, coverImageUrl, authorName,
        isPublished: false, tags: tags || [],
      },
    });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error) {
    console.error('Content create error:', error);
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });

    const body = await req.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ success: false, error: 'ID erforderlich' }, { status: 400 });

    // Rename 'body' field from client to avoid conflict
    if (updateData.body !== undefined) {
      // body is the post content, but Prisma field is also 'body'
      // This is fine since the Prisma model field IS 'body'
    }

    const post = await prisma.contentPost.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('Content update error:', error);
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}
