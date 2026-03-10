import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@salescareerhub/auth/server';
import { prisma } from '@salescareerhub/db';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decoded = await verifyIdToken(token);

    const body = await req.json();
    const { role, displayName } = body;

    if (!['candidate', 'company'].includes(role)) {
      return NextResponse.json({ success: false, error: 'Ungültige Rolle' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });
    if (existingUser) {
      return NextResponse.json({ success: true, data: existingUser });
    }

    const user = await prisma.user.create({
      data: {
        firebaseUid: decoded.uid,
        email: decoded.email || '',
        role,
        displayName: displayName || decoded.email?.split('@')[0] || '',
        isActive: true,
        onboardingCompleted: false,
      },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: 'Registrierung fehlgeschlagen' }, { status: 500 });
  }
}
