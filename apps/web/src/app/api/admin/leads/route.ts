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
    const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: leads });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });
    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ success: false, error: 'ID und Status erforderlich' }, { status: 400 });
    const lead = await prisma.lead.update({ where: { id }, data: { status } });
    return NextResponse.json({ success: true, data: lead });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}
