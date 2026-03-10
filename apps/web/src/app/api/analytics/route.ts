import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@salescareerhub/db';
import { verifyIdToken } from '@salescareerhub/auth/server';

async function getOptionalUserId(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  try {
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      select: { id: true },
    });

    return user?.id || null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, entityId, metadata } = body;
    if (typeof eventType !== 'string' || eventType.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Ungültiger Event-Typ' }, { status: 400 });
    }

    const normalizedEventType = eventType.trim().slice(0, 100);
    const normalizedEntityId = typeof entityId === 'string' && entityId.trim().length > 0 ? entityId.trim().slice(0, 100) : null;
    const userId = await getOptionalUserId(req);

    await prisma.analyticsEvent.create({
      data: {
        eventType: normalizedEventType,
        entityId: normalizedEntityId,
        userId,
        metadata: metadata && typeof metadata === 'object' ? metadata : undefined,
      },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
