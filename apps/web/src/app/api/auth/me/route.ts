import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminErrorMessage, verifyIdToken } from '@/lib/auth/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decoded = await verifyIdToken(token);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      include: { candidateProfile: true, company: true },
    });
    return NextResponse.json({ success: true, data: user || null });
  } catch (error) {
    const adminError = getFirebaseAdminErrorMessage(error);
    return NextResponse.json(
      { success: false, error: adminError || 'Token ungültig' },
      { status: adminError ? 500 : 401 },
    );
  }
}
