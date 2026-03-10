import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@salescareerhub/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const roleCategory = searchParams.get('roleCategory') || '';
    const country = searchParams.get('country') || '';
    const remoteType = searchParams.get('remoteType') || '';
    const seniority = searchParams.get('seniority') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');
    const sort = searchParams.get('sort') || 'newest';

    const where: any = { status: 'live', approvalStatus: 'approved' };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (roleCategory) where.roleCategory = roleCategory;
    if (country) where.country = country;
    if (remoteType) where.remoteType = remoteType;
    if (seniority) where.seniority = seniority;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: { company: { select: { name: true, slug: true, logoUrl: true, isVerified: true } } },
        orderBy: [
          { isFeatured: 'desc' },
          ...(sort === 'salary_high' ? [{ oteMax: 'desc' as const }]
            : sort === 'salary_low' ? [{ salaryMin: 'asc' as const }]
            : sort === 'oldest' ? [{ publishedAt: 'asc' as const }]
            : [{ publishedAt: 'desc' as const }]),
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: jobs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Jobs fetch error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Laden der Jobs' }, { status: 500 });
  }
}
