import { COMPANY_MEMBER_ROLES, ROLES, type CompanyMemberRole, type Role } from '@/lib/config';

declare const process: {
  env: Record<string, string | undefined>;
};

export const AUTH_SESSION_COOKIE = 'sch_session';
export const ADMIN_EMAILS_ENV_KEY = 'ADMIN_EMAILS';

const env = (globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
}).process?.env;

export function sanitizeEnvValue(value?: string | null) {
  if (!value) return undefined;

  let sanitized = value.trim();

  if (
    (sanitized.startsWith('"') && sanitized.endsWith('"')) ||
    (sanitized.startsWith("'") && sanitized.endsWith("'"))
  ) {
    sanitized = sanitized.slice(1, -1).trim();
  }

  sanitized = sanitized.replace(/[;,]\s*$/, '').trim();

  if (
    (sanitized.startsWith('"') && sanitized.endsWith('"')) ||
    (sanitized.startsWith("'") && sanitized.endsWith("'"))
  ) {
    sanitized = sanitized.slice(1, -1).trim();
  }

  return sanitized || undefined;
}

export function normalizeEmail(email?: string | null) {
  return sanitizeEnvValue(email)?.toLowerCase();
}

export function getAdminEmails() {
  const raw = sanitizeEnvValue(env?.[ADMIN_EMAILS_ENV_KEY]);

  if (!raw) return [];

  return raw
    .split(',')
    .map((entry) => normalizeEmail(entry))
    .filter((entry): entry is string => Boolean(entry));
}

export function isAdminEmail(email?: string | null) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return false;

  return getAdminEmails().includes(normalizedEmail);
}

export function resolveRequestedRole(requestedRole?: string | null): Role {
  if (requestedRole === ROLES.COMPANY) return ROLES.COMPANY;
  return ROLES.CANDIDATE;
}

export function resolveUserRole(email: string | null | undefined, requestedRole?: string | null): Role {
  return resolveRequestedRole(requestedRole);
}

export function resolveDefaultCompanyRole(role: Role, requestedCompanyRole?: string | null): CompanyMemberRole | undefined {
  if (role !== ROLES.COMPANY) return undefined;

  if (requestedCompanyRole && Object.values(COMPANY_MEMBER_ROLES).includes(requestedCompanyRole as CompanyMemberRole)) {
    return requestedCompanyRole as CompanyMemberRole;
  }

  return COMPANY_MEMBER_ROLES.OWNER;
}

export function getProviderFromSignInProvider(provider?: string | null) {
  switch (provider) {
    case 'google.com':
      return 'google';
    case 'apple.com':
      return 'apple';
    case 'password':
      return 'email';
    default:
      return sanitizeEnvValue(provider) || 'unknown';
  }
}

export function isAllowedAdminProvider(provider?: string | null) {
  return getProviderFromSignInProvider(provider) === 'email';
}

export function getDisplayNameFallback(email?: string | null, displayName?: string | null) {
  const sanitizedDisplayName = sanitizeEnvValue(displayName);
  if (sanitizedDisplayName) return sanitizedDisplayName;

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return undefined;

  return normalizedEmail.split('@')[0];
}

export function getFirebaseClientConfig() {
  return {
    apiKey: sanitizeEnvValue(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: sanitizeEnvValue(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: sanitizeEnvValue(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: sanitizeEnvValue(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: sanitizeEnvValue(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    appId: sanitizeEnvValue(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  };
}
