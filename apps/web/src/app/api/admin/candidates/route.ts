import { NextRequest, NextResponse } from 'next/server';
import { isUser, requireAdmin } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { serializeCsv } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!isUser(admin)) return admin;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const role = searchParams.get('role')?.trim() || '';
    const salesMotion = searchParams.get('salesMotion')?.trim() || '';
    const industry = searchParams.get('industry')?.trim() || '';
    const minExperience = Number(searchParams.get('minExperience') || 0);
    const minDealSize = Number(searchParams.get('minDealSize') || 0);
    const format = searchParams.get('format') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { currentRole: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.OR = [...(where.OR || []), { currentRole: { contains: role, mode: 'insensitive' } }];
    }

    if (salesMotion) {
      where.salesMotionExperience = { contains: salesMotion, mode: 'insensitive' };
    }

    if (industry) {
      where.industriesExperience = { has: industry };
    }

    if (minExperience > 0) {
      where.yearsOfExperience = { gte: minExperience };
    }

    if (minDealSize > 0) {
      where.averageDealSize = { gte: minDealSize };
    }

    const candidates = await prisma.candidateProfile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: format === 'csv' ? 500 : 100,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        currentRole: true,
        seniority: true,
        yearsOfExperience: true,
        skills: true,
        averageDealSize: true,
        largestDealClosed: true,
        averageSalesCycle: true,
        salesMotionExperience: true,
        industriesExperience: true,
        visibleToRecruiters: true,
        openToWork: true,
        createdAt: true,
      },
    });

    if (format === 'csv') {
      const csv = serializeCsv(candidates.map((candidate) => ({
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        currentRole: candidate.currentRole,
        seniority: candidate.seniority,
        yearsOfExperience: candidate.yearsOfExperience,
        averageDealSize: candidate.averageDealSize,
        largestDealClosed: candidate.largestDealClosed,
        averageSalesCycle: candidate.averageSalesCycle,
        salesMotionExperience: candidate.salesMotionExperience,
        industriesExperience: candidate.industriesExperience,
        openToWork: candidate.openToWork,
        visibleToRecruiters: candidate.visibleToRecruiters,
        createdAt: candidate.createdAt.toISOString(),
      })));

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename=\"candidate-pipeline.csv\"',
        },
      });
    }

    return NextResponse.json({ success: true, data: candidates });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}
