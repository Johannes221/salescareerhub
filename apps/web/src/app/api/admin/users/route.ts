import { NextRequest, NextResponse } from 'next/server';
import { COMPANY_MEMBER_ROLES, ROLES } from '@/lib/config';
import { isUser, requireAdmin } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!isUser(admin)) return admin;
    const [users, companies] = await Promise.all([
      prisma.user.findMany({
        include: {
          company: { select: { id: true, name: true } },
          managedCompany: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.company.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ]);
    return NextResponse.json({ success: true, data: users, meta: { companies } });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!isUser(admin)) return admin;

    const { id, role, isActive, companyRole, managedCompanyId } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: 'User-ID erforderlich' }, { status: 400 });

    if (id === admin.id) {
      return NextResponse.json({ success: false, error: 'Du kannst deine eigene Rolle nicht ändern' }, { status: 400 });
    }

    const data: any = {};
    if (role !== undefined && Object.values(ROLES).includes(role)) data.role = role;
    if (isActive !== undefined) data.isActive = isActive;
    if (companyRole !== undefined && Object.values(COMPANY_MEMBER_ROLES).includes(companyRole)) data.companyRole = companyRole;
    if (managedCompanyId !== undefined) data.managedCompanyId = managedCompanyId || null;
    if (role === ROLES.COMPANY && companyRole === undefined) data.companyRole = COMPANY_MEMBER_ROLES.OWNER;
    if (role !== undefined && role !== ROLES.COMPANY) {
      data.companyRole = null;
      data.managedCompanyId = null;
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      include: {
        company: { select: { id: true, name: true } },
        managedCompany: { select: { id: true, name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.id, action: 'admin_user_updated', entity: 'User', entityId: id,
        details: JSON.stringify({ role, isActive, companyRole, managedCompanyId }),
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}
