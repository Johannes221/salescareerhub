import { NextRequest, NextResponse } from 'next/server';
import { isUser, requireAdmin } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!isUser(admin)) return admin;
    const companies = await prisma.company.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: companies });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!isUser(admin)) return admin;
    const { id, isVerified, isFeatured } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: 'ID erforderlich' }, { status: 400 });
    const data: any = {};
    if (isVerified !== undefined) data.isVerified = isVerified;
    if (isFeatured !== undefined) data.isFeatured = isFeatured;
    const company = await prisma.company.update({ where: { id }, data });

    if (isVerified !== undefined) {
      await prisma.notification.create({
        data: {
          userId: company.userId,
          type: isVerified ? 'company_verified' : 'company_unverified',
          title: isVerified ? 'Unternehmen verifiziert' : 'Verifizierung entfernt',
          message: isVerified ? 'Dein Unternehmen wurde verifiziert.' : 'Die Verifizierung wurde entfernt.',
          link: '/dashboard/company',
        },
      });
    }

    await prisma.auditLog.create({
      data: { userId: admin.id, action: 'admin_company_updated', entity: 'Company', entityId: id, details: JSON.stringify({ isVerified, isFeatured }) },
    });

    return NextResponse.json({ success: true, data: company });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}
