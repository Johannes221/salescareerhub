import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie, getFirebaseAdminErrorMessage, verifyIdToken } from '@/lib/auth/server';
import { AUTH_SESSION_COOKIE } from '@/lib/auth/shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    await verifyIdToken(token);
    const sessionCookie = await createSessionCookie(token, SESSION_MAX_AGE_SECONDS * 1000);

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: AUTH_SESSION_COOKIE,
      value: sessionCookie,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
  } catch (error) {
    console.error('Session creation error:', error);
    const adminError = getFirebaseAdminErrorMessage(error);
    return NextResponse.json(
      { success: false, error: adminError || 'Server-Session konnte nicht erstellt werden.' },
      { status: adminError ? 500 : 401 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: AUTH_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}
