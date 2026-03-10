import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@salescareerhub/db';
import { verifyIdToken } from '@salescareerhub/auth/server';
import { slugify } from '@salescareerhub/utils';

async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    return prisma.user.findUnique({ where: { firebaseUid: decoded.uid }, include: { company: true } });
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
    return NextResponse.json({ success: true, data: user.company });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'company') {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });
    }

    const body = await req.json();
    const { name, website, linkedinUrl, country, city, employeeCount, fundingStage, industry, description, benefits, remotePolicy, salesTeamSize, atsLink } = body;

    const data: any = { name, website, linkedinUrl, country, city, employeeCount, fundingStage, industry, description, benefits: benefits || [], remotePolicy, salesTeamSize, atsLink };

    let company;
    if (user.company) {
      company = await prisma.company.update({ where: { id: user.company.id }, data });
    } else {
      const slug = slugify(name) + '-' + Date.now().toString(36);
      company = await prisma.company.create({ data: { ...data, slug, userId: user.id, tags: [] } });
      await prisma.user.update({ where: { id: user.id }, data: { onboardingCompleted: true } });
    }

    await prisma.auditLog.create({
      data: { userId: user.id, action: 'company_profile_updated', entity: 'Company', entityId: company.id, details: 'Unternehmensprofil aktualisiert' },
    });

    return NextResponse.json({ success: true, data: company });
  } catch (error) {
    console.error('Company profile error:', error);
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}
