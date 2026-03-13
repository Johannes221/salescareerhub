import { NextRequest, NextResponse } from 'next/server';
import { isUser, requireAdmin } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!isUser(admin)) return admin;
    const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: leads });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!isUser(admin)) return admin;
    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ success: false, error: 'ID und Status erforderlich' }, { status: 400 });
    const lead = await prisma.lead.update({ where: { id }, data: { status } });
    return NextResponse.json({ success: true, data: lead });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}
