import { NextRequest, NextResponse } from 'next/server';
import { isUser, requireAdmin } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(req);
    if (!isUser(admin)) return admin;

    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
        applications: {
          include: {
            job: {
              select: {
                title: true,
                slug: true,
                company: { select: { name: true, slug: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!candidate) {
      return NextResponse.json({ success: false, error: 'Kandidat nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: candidate });
  } catch (error) {
    console.error('Admin candidate detail error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Laden' }, { status: 500 });
  }
}
