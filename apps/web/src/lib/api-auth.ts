import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, verifySessionCookie } from './auth/server';
import { AUTH_SESSION_COOKIE, isAdminEmail, normalizeEmail } from './auth/shared';
import { COMPANY_MEMBER_ROLES, ROLES, type CompanyMemberRole, type Role } from './config';
import { prisma } from './db';

const authUserInclude = {
  candidateProfile: true,
  company: true,
  managedCompany: true,
  adminProfile: true,
};

type BaseAuthUser = {
  id: string;
  firebaseUid: string;
  email: string;
  role: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  companyRole?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  candidateProfile?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    linkedinUrl?: string | null;
    location?: string | null;
    country?: string | null;
    currentRole?: string | null;
    targetRole?: string | null;
    seniority?: string | null;
    yearsOfExperience?: number | null;
    skills: string[];
    shortBio?: string | null;
    createdAt: Date;
  } | null;
  company?: {
    id: string;
    name: string;
    slug?: string;
    website?: string | null;
    country?: string | null;
    city?: string | null;
    industry?: string | null;
    createdAt: Date;
  } | null;
  managedCompany?: {
    id: string;
    name: string;
    slug?: string;
    website?: string | null;
    country?: string | null;
    city?: string | null;
    industry?: string | null;
    createdAt: Date;
  } | null;
  adminProfile?: {
    id: string;
  } | null;
};

export type AuthUser = BaseAuthUser & {
  activeCompany: BaseAuthUser['company'] | BaseAuthUser['managedCompany'] | null;
  effectiveCompanyRole?: CompanyMemberRole;
};

function getUnknownPrismaField(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  const match = message.match(/Unknown (?:argument|field) `([^`]+)`/);
  return match?.[1] ?? null;
}

function augmentAuthUser(user: BaseAuthUser): AuthUser {
  const managedCompany = user.managedCompany ?? null;
  const activeCompany = user.company ?? managedCompany ?? null;
  const requestedCompanyRole = user.companyRole as CompanyMemberRole | null;

  return {
    ...user,
    activeCompany,
    effectiveCompanyRole: user.role === ROLES.COMPANY
      ? user.company
        ? COMPANY_MEMBER_ROLES.OWNER
        : requestedCompanyRole ?? COMPANY_MEMBER_ROLES.VIEWER
      : undefined,
  };
}

async function verifyRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    return verifyIdToken(authHeader.split('Bearer ')[1]);
  }

  const sessionCookie = req.cookies.get(AUTH_SESSION_COOKIE)?.value;

  if (!sessionCookie) {
    return null;
  }

  return verifySessionCookie(sessionCookie);
}

async function findAuthUserByFirebaseUid(firebaseUid: string, email?: string | null): Promise<BaseAuthUser | null> {
  const include: {
    candidateProfile?: true;
    company?: true;
    managedCompany?: true;
    adminProfile?: true;
  } = {
    candidateProfile: true,
    company: true,
    managedCompany: true,
    adminProfile: true,
  };

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await (prisma.user as any).findUnique({
        where: { firebaseUid },
        include,
      }) as BaseAuthUser | null;
    } catch (error) {
      const unknownField = getUnknownPrismaField(error);

      if (unknownField === 'managedCompany' && include.managedCompany) {
        delete include.managedCompany;
        continue;
      }

      if (unknownField === 'firebaseUid') {
        break;
      }

      throw error;
    }
  }

  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await (prisma.user as any).findUnique({
        where: { email: normalizedEmail },
        include,
      }) as BaseAuthUser | null;
    } catch (error) {
      if (getUnknownPrismaField(error) === 'managedCompany' && include.managedCompany) {
        delete include.managedCompany;
        continue;
      }

      throw error;
    }
  }

  return null;
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  try {
    const decoded = await verifyRequest(req);

    if (!decoded) {
      return null;
    }

    const user = await findAuthUserByFirebaseUid(decoded.uid, decoded.email);

    if (!user?.isActive) {
      return null;
    }

    const authUser = augmentAuthUser(user);

    if (authUser.role === ROLES.ADMIN && !isAdminUser(authUser)) {
      return null;
    }

    return authUser;
  } catch {
    return null;
  }
}

export function hasRole(user: AuthUser, role: Role) {
  if (role === ROLES.ADMIN) {
    return isAdminUser(user);
  }

  return user.role === role;
}

export function isAdminUser(user: AuthUser) {
  return user.role === ROLES.ADMIN && Boolean(user.adminProfile) && isAdminEmail(user.email);
}

export function isCompanyUser(user: AuthUser) {
  return user.role === ROLES.COMPANY;
}

export function canAccessCompanyArea(user: AuthUser) {
  return isCompanyUser(user);
}

export function canManageCompany(user: AuthUser) {
  if (!isCompanyUser(user)) {
    return false;
  }

  return (
    user.effectiveCompanyRole === COMPANY_MEMBER_ROLES.OWNER ||
    user.effectiveCompanyRole === COMPANY_MEMBER_ROLES.MANAGER ||
    user.effectiveCompanyRole === COMPANY_MEMBER_ROLES.EDITOR
  );
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

  if (result instanceof NextResponse) {
    return result;
  }

  if (!hasRole(result, role)) {
    return NextResponse.json({ success: false, error: 'Keine Berechtigung' }, { status: 403 });
  }

  return result;
}

export async function requireAdmin(req: NextRequest): Promise<AuthUser | NextResponse> {
  return requireRole(req, ROLES.ADMIN);
}

export async function requireCompanyUser(
  req: NextRequest,
  options?: { requireManagedCompany?: boolean; requireWriteAccess?: boolean },
): Promise<AuthUser | NextResponse> {
  const result = await requireRole(req, ROLES.COMPANY);

  if (result instanceof NextResponse) {
    return result;
  }

  if (options?.requireManagedCompany && !result.activeCompany) {
    return NextResponse.json({ success: false, error: 'Unternehmen nicht gefunden' }, { status: 404 });
  }

  if (options?.requireWriteAccess && !canManageCompany(result)) {
    return NextResponse.json({ success: false, error: 'Keine Berechtigung' }, { status: 403 });
  }

  return result;
}

export function isUser(result: AuthUser | NextResponse): result is AuthUser {
  return !(result instanceof NextResponse);
}
