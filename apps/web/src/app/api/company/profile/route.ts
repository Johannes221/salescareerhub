import { NextRequest, NextResponse } from 'next/server';
import { COMPANY_MEMBER_ROLES } from '@/lib/config';
import { isUser, requireCompanyUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const result = await requireCompanyUser(req);
    if (!isUser(result)) return result;
    return NextResponse.json({ success: true, data: result.activeCompany });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try {
    const result = await requireCompanyUser(req, { requireWriteAccess: true });
    if (!isUser(result)) return result;

    const body = await req.json();
    const { name, website, linkedinUrl, country, city, employeeCount, fundingStage, industry, description, benefits, remotePolicy, salesTeamSize, atsLink } = body;

    const data: any = { name, website, linkedinUrl, country, city, employeeCount, fundingStage, industry, description, benefits: benefits || [], remotePolicy, salesTeamSize, atsLink };

    let company;
    if (result.activeCompany) {
      company = await prisma.company.update({ where: { id: result.activeCompany.id }, data });
    } else {
      const slug = slugify(name) + '-' + Date.now().toString(36);
      company = await prisma.company.create({ data: { ...data, slug, userId: result.id, tags: [] } });
      await prisma.user.update({
        where: { id: result.id },
        data: {
          onboardingCompleted: true,
          companyRole: result.companyRole || COMPANY_MEMBER_ROLES.OWNER,
        },
      });
    }

    await prisma.auditLog.create({
      data: { userId: result.id, action: 'company_profile_updated', entity: 'Company', entityId: company.id, details: 'Unternehmensprofil aktualisiert' },
    });

    return NextResponse.json({ success: true, data: company });
  } catch (error) {
    console.error('Company profile error:', error);
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}
