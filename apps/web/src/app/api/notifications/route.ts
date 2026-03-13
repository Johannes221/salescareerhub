import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });

    return NextResponse.json({ success: true, data: notifications, unreadCount });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ success: false, error: 'Keine Berechtigung' }, { status: 403 });

    const { userId, type, title, message, link } = await req.json();
    if (!userId || !title || !message) {
      return NextResponse.json({ success: false, error: 'Pflichtfelder fehlen' }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: { userId, type: type || 'admin_message', title, message, link },
    });

    return NextResponse.json({ success: true, data: notification }, { status: 201 });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });

    const { id, markAllRead } = await req.json();

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true },
      });
    } else if (id) {
      await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}
