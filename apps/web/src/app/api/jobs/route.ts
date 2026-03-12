import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/auth/server';
import { computeCandidateJobMatch } from '@/lib/candidate-journey';
import { prisma } from '@/lib/db';
import { mapJobToPublic, publicJobSelect } from '@/lib/public-jobs';

export const dynamic = 'force-dynamic';

function parseMultiValueParam(value: string | null) {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const roleCategories = parseMultiValueParam(searchParams.get('roleCategory'));
    const countries = parseMultiValueParam(searchParams.get('country'));
    const remoteTypes = parseMultiValueParam(searchParams.get('remoteType'));
    const seniorityLevels = parseMultiValueParam(searchParams.get('seniority'));
    const industries = parseMultiValueParam(searchParams.get('industry'));
    const companyTypes = parseMultiValueParam(searchParams.get('companyType'));
    const companySizes = parseMultiValueParam(searchParams.get('companySize'));
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');
    const sort = searchParams.get('sort') || 'newest';
    const filters: any[] = [];
    let candidateProfile: any = null;

    if (search) {
      filters.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { descriptionAnonymized: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
          { industry: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (location) {
      filters.push({
        location: { contains: location, mode: 'insensitive' },
      });
    }

    if (roleCategories.length > 0) {
      filters.push({ roleCategory: { in: roleCategories } });
    }

    if (countries.length > 0) {
      filters.push({ country: { in: countries } });
    }

    if (remoteTypes.length > 0) {
      filters.push({ remoteType: { in: remoteTypes } });
    }

    if (seniorityLevels.length > 0) {
      filters.push({ seniority: { in: seniorityLevels } });
    }

    if (industries.length > 0) {
      filters.push({ industry: { in: industries } });
    }

    if (companySizes.length > 0) {
      filters.push({
        company: {
          is: {
            employeeCount: { in: companySizes },
          },
        },
      });
    }

    if (companyTypes.length > 0) {
      const companyTypeFilters: any[] = [];

      companyTypes.forEach((type) => {
        switch (type) {
          case 'startup':
            companyTypeFilters.push({ companyStage: { in: ['bootstrapped', 'pre-seed', 'seed', 'series-a'] } });
            break;
          case 'scaleup':
            companyTypeFilters.push({ companyStage: { in: ['series-b', 'series-c', 'series-d+'] } });
            break;
          case 'mittelstand':
            companyTypeFilters.push({ company: { is: { employeeCount: { in: ['51-200', '201-500', '501-1000'] } } } });
            break;
          case 'enterprise':
            companyTypeFilters.push({ company: { is: { employeeCount: { in: ['1001-5000', '5000+'] } } } });
            break;
          default:
            break;
        }
      });

      if (companyTypeFilters.length > 0) {
        filters.push({ OR: companyTypeFilters });
      }
    }

    const authHeader = req.headers.get('authorization');

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
        const user = await prisma.user.findUnique({
          where: { firebaseUid: decoded.uid },
          include: { candidateProfile: true },
        });
        candidateProfile = user?.role === 'candidate' ? user.candidateProfile : null;
      } catch {}
    }

    const where: any = {
      status: 'live',
      approvalStatus: 'approved',
      ...(filters.length > 0 ? { AND: filters } : {}),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        select: publicJobSelect,
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
      data: jobs.map((job: (typeof jobs)[number]) => {
        const publicJob = mapJobToPublic(job);
        if (!candidateProfile) {
          return publicJob;
        }
        const match = computeCandidateJobMatch(candidateProfile, publicJob);
        return {
          ...publicJob,
          matchScore: match.score,
          matchReasons: match.reasons,
        };
      }),
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
