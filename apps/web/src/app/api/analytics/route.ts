import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@salescareerhub/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, entityId, metadata } = body;
    if (!eventType) {
      return NextResponse.json({ success: false }, { status: 400 });
    }
    await prisma.analyticsEvent.create({
      data: { eventType, entityId, metadata },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
