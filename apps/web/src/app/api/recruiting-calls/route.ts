import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { RECRUITING_CALL_TYPES, RECRUITING_CALL_TYPE_LABELS } from '@/lib/config';
import { buildCalendarUrl } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
    }

    if (user.role === 'admin') {
      const calls = await prisma.recruitingCall.findMany({
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              currentRole: true,
            },
          },
        },
        orderBy: [{ scheduledTime: 'asc' }, { createdAt: 'desc' }],
        take: 100,
      });

      return NextResponse.json({
        success: true,
        data: calls.map((call) => ({
          ...call,
          label: RECRUITING_CALL_TYPE_LABELS[call.callType as keyof typeof RECRUITING_CALL_TYPE_LABELS] || call.callType,
          calendarUrl: buildCalendarUrl({
            title: `SalesCareerHub - ${RECRUITING_CALL_TYPE_LABELS[call.callType as keyof typeof RECRUITING_CALL_TYPE_LABELS] || call.callType}`,
            start: call.scheduledTime,
            details: call.notes || undefined,
            location: call.meetingLink || undefined,
          }),
        })),
      });
    }

    if (user.role !== 'candidate' || !user.candidateProfile) {
      return NextResponse.json({ success: true, data: [] });
    }

    const calls = await prisma.recruitingCall.findMany({
      where: { candidateId: user.candidateProfile.id },
      orderBy: [{ scheduledTime: 'asc' }, { createdAt: 'desc' }],
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: calls.map((call) => ({
        ...call,
        label: RECRUITING_CALL_TYPE_LABELS[call.callType as keyof typeof RECRUITING_CALL_TYPE_LABELS] || call.callType,
        calendarUrl: buildCalendarUrl({
          title: `SalesCareerHub - ${RECRUITING_CALL_TYPE_LABELS[call.callType as keyof typeof RECRUITING_CALL_TYPE_LABELS] || call.callType}`,
          start: call.scheduledTime,
          details: call.notes || undefined,
          location: call.meetingLink || undefined,
        }),
      })),
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Fehler beim Laden' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    if (!user || user.role !== 'candidate' || !user.candidateProfile) {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });
    }

    const body = await req.json();
    const callType = body.callType as string;
    const scheduledTime = new Date(body.scheduledTime);

    if (!RECRUITING_CALL_TYPES.includes(callType as (typeof RECRUITING_CALL_TYPES)[number])) {
      return NextResponse.json({ success: false, error: 'Ungültiger Call-Typ' }, { status: 400 });
    }

    if (Number.isNaN(scheduledTime.getTime()) || scheduledTime.getTime() <= Date.now()) {
      return NextResponse.json({ success: false, error: 'Bitte wähle einen zukünftigen Termin' }, { status: 400 });
    }

    const label = RECRUITING_CALL_TYPE_LABELS[callType as keyof typeof RECRUITING_CALL_TYPE_LABELS] || callType;
    const calendarUrl = buildCalendarUrl({
      title: `SalesCareerHub - ${label}`,
      start: scheduledTime,
      details: body.notes?.trim() || undefined,
      location: 'SalesCareerHub Recruiting Call',
    });

    const call = await prisma.recruitingCall.create({
      data: {
        candidateId: user.candidateProfile.id,
        callType,
        scheduledTime,
        notes: body.notes?.trim() || null,
        meetingLink: calendarUrl,
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'recruiting_call_scheduled',
        title: 'Recruiting Call gebucht',
        message: `${label} am ${scheduledTime.toLocaleString('de-DE')} wurde geplant.`,
        link: '/dashboard/candidate',
      },
    });

    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true },
    });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: 'recruiting_call_booked',
          title: 'Neuer Recruiting Call',
          message: `${user.candidateProfile?.firstName} ${user.candidateProfile?.lastName} hat einen ${label} gebucht.`,
          link: '/dashboard/admin',
        })),
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'recruiting_call_booked',
        entity: 'RecruitingCall',
        entityId: call.id,
        details: JSON.stringify({ callType, scheduledTime: scheduledTime.toISOString() }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...call,
        label,
        calendarUrl,
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Fehler beim Buchen' }, { status: 500 });
  }
}
