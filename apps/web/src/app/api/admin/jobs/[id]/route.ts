import { NextRequest, NextResponse } from 'next/server';
import { isUser, requireAdmin } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(req);
    if (!isUser(admin)) return admin;

    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            isVerified: true,
            contactPerson: true,
            email: true,
            website: true,
            industry: true,
            fundingStage: true,
          },
        },
        applications: {
          include: {
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                currentRole: true,
                seniority: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { applications: true, savedBy: true } },
      },
    });

    if (!job) {
      return NextResponse.json({ success: false, error: 'Job nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    console.error('Admin job detail error:', error);
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}
