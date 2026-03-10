import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@salescareerhub/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, name, email, company, phone, message } = body;

    if (!name || !email) {
      return NextResponse.json({ success: false, error: 'Name und E-Mail sind erforderlich' }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: { type: type || 'contact', name, email, company, phone, message, status: 'new' },
    });

    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fehler beim Speichern' }, { status: 500 });
  }
}
