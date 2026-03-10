import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@salescareerhub/auth/server';
import { prisma } from '@salescareerhub/db';
import type { Role } from '@salescareerhub/config';

interface AuthUser {
  id: string;
  firebaseUid: string;
  email: string;
  role: string;
  displayName: string | null;
  isActive: boolean;
  candidateProfile?: any;
  company?: any;
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = await verifyIdToken(authHeader.split('Bearer ')[1]);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      include: { candidateProfile: true, company: true },
    });
    return user as AuthUser | null;
  } catch {
    return null;
  }
}

export async function requireAuth(req: NextRequest): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
  }
  return user;
}

export async function requireRole(req: NextRequest, role: Role): Promise<AuthUser | NextResponse> {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;
  if (result.role !== role) {
    return NextResponse.json({ success: false, error: 'Keine Berechtigung' }, { status: 403 });
  }
  return result;
}

export async function requireAdmin(req: NextRequest): Promise<AuthUser | NextResponse> {
  return requireRole(req, 'admin');
}

export function isUser(result: AuthUser | NextResponse): result is AuthUser {
  return !(result instanceof NextResponse);
}
