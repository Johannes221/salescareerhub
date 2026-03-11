import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
    const { jobId } = await req.json();
    if (!jobId) return NextResponse.json({ success: false, error: 'Job-ID erforderlich' }, { status: 400 });

    const existing = await prisma.savedJob.findFirst({ where: { userId: user.id, jobId } });
    if (existing) return NextResponse.json({ success: true, data: existing });

    const saved = await prisma.savedJob.create({ data: { userId: user.id, jobId } });
    await prisma.analyticsEvent.create({ data: { eventType: 'job_saved', userId: user.id, entityId: jobId } });
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
    const { jobId } = await req.json();
    if (!jobId) return NextResponse.json({ success: false, error: 'Job-ID erforderlich' }, { status: 400 });

    await prisma.savedJob.deleteMany({ where: { userId: user.id, jobId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });

    const savedJobs = await prisma.savedJob.findMany({
      where: { userId: user.id },
      include: { job: { include: { company: { select: { name: true, slug: true, logoUrl: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: savedJobs });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}
