import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminErrorMessage, verifyIdToken } from '@/lib/auth/server';
import {
  getDisplayNameFallback,
  getProviderFromSignInProvider,
  normalizeEmail,
  resolveDefaultCompanyRole,
  resolveUserRole,
} from '@/lib/auth/shared';
import { ROLES } from '@/lib/config';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Nicht autorisiert' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decoded = await verifyIdToken(token);

    const body = await req.json().catch(() => ({}));
    const requestedRole = typeof body.role === 'string' ? body.role : undefined;
    const requestedCompanyRole = typeof body.companyRole === 'string' ? body.companyRole : undefined;
    const requestedDisplayName = typeof body.displayName === 'string' ? body.displayName : undefined;
    const normalizedEmail = normalizeEmail(decoded.email);

    if (!normalizedEmail) {
      return NextResponse.json({ success: false, error: 'E-Mail-Adresse fehlt im Auth-Provider' }, { status: 400 });
    }

    const existingByUid = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });
    const existingByEmail = existingByUid
      ? null
      : await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existingByEmail && existingByEmail.firebaseUid !== decoded.uid) {
      return NextResponse.json(
        { success: false, error: 'Diese E-Mail-Adresse ist bereits mit einem anderen Login verknüpft.' },
        { status: 409 },
      );
    }

    const existingUser = existingByUid ?? existingByEmail;
    const role = (existingUser?.role as (typeof ROLES)[keyof typeof ROLES] | undefined) || resolveUserRole(normalizedEmail, requestedRole);
    const existingCompanyRole = typeof existingUser?.companyRole === 'string' ? existingUser.companyRole : undefined;
    const companyRole = resolveDefaultCompanyRole(role, existingCompanyRole ?? requestedCompanyRole);
    const displayName = getDisplayNameFallback(normalizedEmail, requestedDisplayName || decoded.name);
    const provider = getProviderFromSignInProvider(decoded.firebase?.sign_in_provider);

    const baseData = {
      firebaseUid: decoded.uid,
      email: normalizedEmail,
      role,
      companyRole: role === ROLES.COMPANY ? companyRole : null,
      authProvider: provider,
      lastLoginAt: new Date(),
      displayName,
      avatarUrl: typeof decoded.picture === 'string' ? decoded.picture : existingUser?.avatarUrl || null,
      isActive: existingUser?.isActive ?? true,
      onboardingCompleted: existingUser?.onboardingCompleted ?? role === ROLES.ADMIN,
    };

    const include = {
      candidateProfile: true,
      company: true,
      managedCompany: true,
    };

    const userRecord = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: baseData,
          include,
        })
      : await prisma.user.create({
          data: baseData,
          include,
        });

    if (!existingUser) {
      try {
        await prisma.auditLog.create({
          data: {
            action: 'user_registered',
            entity: 'User',
            entityId: decoded.uid,
            details: JSON.stringify({ email: normalizedEmail, role, authProvider: provider }),
          },
        });
      } catch (auditError) {
        console.error('Registration audit log error:', auditError);
      }
    }

    return NextResponse.json({ success: true, data: userRecord }, { status: existingUser ? 200 : 201 });
  } catch (error) {
    console.error('Registration error:', error);
    const adminError = getFirebaseAdminErrorMessage(error);
    const prismaMessage = error instanceof Error ? error.message : null;

    if (adminError) {
      return NextResponse.json({ success: false, error: adminError }, { status: 500 });
    }

    if (prismaMessage?.includes('Unknown argument')) {
      return NextResponse.json(
        { success: false, error: 'Prisma Client auf dem Server ist veraltet. Render muss neu bauen/deployen.' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: false, error: prismaMessage || 'Registrierung fehlgeschlagen' },
      { status: 500 },
    );
  }
}
