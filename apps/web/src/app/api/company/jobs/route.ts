import { NextRequest, NextResponse } from 'next/server';
import { isUser, requireCompanyUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const result = await requireCompanyUser(req, { requireManagedCompany: true, requireWriteAccess: true });
    if (!isUser(result)) return result;
    const activeCompany = result.activeCompany;
    if (!activeCompany) return NextResponse.json({ success: false, error: 'Unternehmen nicht gefunden' }, { status: 404 });

    const body = await req.json();
    const {
      title, roleCategory, seniority, employmentType, location, country,
      remoteType, salaryMin, salaryMax, oteMin, oteMax, currency,
      description, requirements, benefits, sourceUrl, tags,
    } = body;

    if (!title || !roleCategory || !seniority || !description) {
      return NextResponse.json({ success: false, error: 'Pflichtfelder fehlen' }, { status: 400 });
    }

    const slug = slugify(title) + '-' + slugify(activeCompany.name) + '-' + Date.now().toString(36);

    const job = await prisma.job.create({
      data: {
        companyId: activeCompany.id,
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
          message: `${activeCompany.name} hat "${title}" eingereicht.`,
          link: '/dashboard/admin/jobs',
        },
      });
    }

    await prisma.auditLog.create({
      data: { userId: result.id, action: 'job_created', entity: 'Job', entityId: job.id, details: `Job "${title}" erstellt` },
    });

    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error) {
    console.error('Job create error:', error);
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const result = await requireCompanyUser(req, { requireManagedCompany: true });
    if (!isUser(result)) return result;
    const activeCompany = result.activeCompany;
    if (!activeCompany) return NextResponse.json({ success: false, error: 'Unternehmen nicht gefunden' }, { status: 404 });

    const jobs = await prisma.job.findMany({
      where: { companyId: activeCompany.id },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: jobs });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}
