import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyIdToken } from '@/lib/auth/server';
import { slugify } from '@/lib/utils';

async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    return prisma.user.findUnique({ where: { firebaseUid: decoded.uid }, include: { company: true } });
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'company' || !user.company) {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title, roleCategory, seniority, employmentType, location, country,
      remoteType, salaryMin, salaryMax, oteMin, oteMax, currency,
      description, requirements, benefits, sourceUrl, tags,
    } = body;

    if (!title || !roleCategory || !seniority || !description) {
      return NextResponse.json({ success: false, error: 'Pflichtfelder fehlen' }, { status: 400 });
    }

    const slug = slugify(title) + '-' + slugify(user.company.name) + '-' + Date.now().toString(36);

    const job = await prisma.job.create({
      data: {
        companyId: user.company.id,
        title, slug, roleCategory, seniority,
        employmentType: employmentType || 'fulltime',
        location, country, remoteType: remoteType || 'hybrid',
        salaryMin, salaryMax, oteMin, oteMax,
        currency: currency || 'EUR',
        description, requirements, benefits,
        sourceType: 'direct_company_posting',
        sourceUrl,
        applyViaPlattform: true,
        status: 'pending_review',
        approvalStatus: 'pending',
        tags: tags || [],
      },
    });

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: 'admin' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id, type: 'new_job_pending',
          title: 'Neuer Job zur Prüfung',
          message: `${user.company.name} hat "${title}" eingereicht.`,
          link: '/dashboard/admin/jobs',
        },
      });
    }

    await prisma.auditLog.create({
      data: { userId: user.id, action: 'job_created', entity: 'Job', entityId: job.id, details: `Job "${title}" erstellt` },
    });

    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error) {
    console.error('Job create error:', error);
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || !user.company) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });

    const jobs = await prisma.job.findMany({
      where: { companyId: user.company.id },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: jobs });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}
