import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/auth/server';
import { prisma } from '@/lib/db';

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
    if (!user) {
      return NextResponse.json({ success: false, error: 'Benutzer nicht gefunden' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Token ungültig' }, { status: 401 });
  }
}
