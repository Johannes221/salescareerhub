import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

function toNullableNumber(value: unknown) {
  if (value === '' || value === null || value === undefined) return null;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function uniqueStrings(values: string[] = []) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    if (!user || user.role !== 'candidate' || !user.candidateProfile) {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });
    }

    const body = await req.json();
    const profile = await prisma.candidateProfile.update({
      where: { id: user.candidateProfile.id },
      data: {
        averageDealSize: toNullableNumber(body.averageDealSize),
        largestDealClosed: toNullableNumber(body.largestDealClosed),
        averageSalesCycle: toNullableNumber(body.averageSalesCycle),
        salesMotionExperience: body.salesMotionExperience?.trim() || null,
        industriesExperience: uniqueStrings(body.industriesExperience || []),
        territorySize: body.territorySize?.trim() || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'candidate_metrics_updated',
        entity: 'CandidateProfile',
        entityId: profile.id,
        details: JSON.stringify({
          averageDealSize: profile.averageDealSize,
          largestDealClosed: profile.largestDealClosed,
          averageSalesCycle: profile.averageSalesCycle,
          salesMotionExperience: profile.salesMotionExperience,
        }),
      },
    });

    return NextResponse.json({ success: true, data: profile });
  } catch {
    return NextResponse.json({ success: false, error: 'Fehler beim Speichern' }, { status: 500 });
  }
}
