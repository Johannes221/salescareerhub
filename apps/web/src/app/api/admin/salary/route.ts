import { NextRequest, NextResponse } from 'next/server';
import { isUser, requireAdmin } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!isUser(admin)) return admin;
    const insights = await prisma.salaryInsight.findMany({ orderBy: [{ role: 'asc' }, { seniority: 'asc' }] });
    return NextResponse.json({ success: true, data: insights });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!isUser(admin)) return admin;

    const body = await req.json();
    const { role, country, region, seniority, baseSalaryMin, baseSalaryMedian, baseSalaryMax, oteMin, oteMedian, oteMax, currency, source, confidenceScore, year } = body;

    if (!role || !country || !seniority) {
      return NextResponse.json({ success: false, error: 'Rolle, Land und Seniority sind erforderlich' }, { status: 400 });
    }

    const insight = await prisma.salaryInsight.create({
      data: {
        role, country, region, seniority,
        baseSalaryMin: baseSalaryMin || 0, baseSalaryMedian: baseSalaryMedian || 0, baseSalaryMax: baseSalaryMax || 0,
        oteMin: oteMin || 0, oteMedian: oteMedian || 0, oteMax: oteMax || 0,
        currency: currency || 'EUR', source, confidenceScore: confidenceScore || 0.5, year: year || new Date().getFullYear(),
      },
    });

    await prisma.auditLog.create({
      data: { userId: admin.id, action: 'salary_insight_created', entity: 'SalaryInsight', entityId: insight.id, details: `${role} / ${country} / ${seniority}` },
    });

    return NextResponse.json({ success: true, data: insight }, { status: 201 });
  } catch (error) {
    console.error('Salary create error:', error);
    return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!isUser(admin)) return admin;

    const body = await req.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ success: false, error: 'ID erforderlich' }, { status: 400 });

    const insight = await prisma.salaryInsight.update({ where: { id }, data: updateData });

    await prisma.auditLog.create({
      data: { userId: admin.id, action: 'salary_insight_updated', entity: 'SalaryInsight', entityId: id, details: JSON.stringify(updateData) },
    });

    return NextResponse.json({ success: true, data: insight });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!isUser(admin)) return admin;

    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: 'ID erforderlich' }, { status: 400 });

    await prisma.salaryInsight.delete({ where: { id } });

    await prisma.auditLog.create({
      data: { userId: admin.id, action: 'salary_insight_deleted', entity: 'SalaryInsight', entityId: id, details: 'Gelöscht' },
    });

    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ success: false, error: 'Fehler' }, { status: 500 }); }
}
