import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyIdToken } from '@/lib/auth/server';

async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    const user = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });
    return user?.role === 'admin' ? user : null;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: users });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });

    const { id, role, isActive } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: 'User-ID erforderlich' }, { status: 400 });

    if (id === admin.id) {
      return NextResponse.json({ success: false, error: 'Du kannst deine eigene Rolle nicht ändern' }, { status: 400 });
    }

    const data: any = {};
    if (role !== undefined && ['admin', 'company', 'candidate', 'recruiter'].includes(role)) data.role = role;
    if (isActive !== undefined) data.isActive = isActive;

    const user = await prisma.user.update({ where: { id }, data });

    await prisma.auditLog.create({
      data: {
        userId: admin.id, action: 'admin_user_updated', entity: 'User', entityId: id,
        details: JSON.stringify({ role, isActive }),
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}
