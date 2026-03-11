import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import { sanitizeEnvValue } from '@/lib/auth/shared';

let adminApp: App;

const env = (globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
}).process?.env;

function getAdminApp(): App {
  if (!adminApp) {
    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert({
          projectId: sanitizeEnvValue(env?.FIREBASE_ADMIN_PROJECT_ID),
          clientEmail: sanitizeEnvValue(env?.FIREBASE_ADMIN_CLIENT_EMAIL),
          privateKey: sanitizeEnvValue(env?.FIREBASE_ADMIN_PRIVATE_KEY)?.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      adminApp = getApps()[0];
    }
  }
  return adminApp;
}

export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  const auth = getAuth(getAdminApp());
  return auth.verifyIdToken(token);
}

export async function createSessionCookie(token: string, expiresIn = 60 * 60 * 24 * 5 * 1000) {
  const auth = getAuth(getAdminApp());
  return auth.createSessionCookie(token, { expiresIn });
}

export async function verifySessionCookie(sessionCookie: string): Promise<DecodedIdToken> {
  const auth = getAuth(getAdminApp());
  return auth.verifySessionCookie(sessionCookie, true);
}

export async function getFirebaseUser(uid: string) {
  const auth = getAuth(getAdminApp());
  return auth.getUser(uid);
}

export async function createFirebaseUser(email: string, password: string) {
  const auth = getAuth(getAdminApp());
  return auth.createUser({ email, password });
}

export async function deleteFirebaseUser(uid: string) {
  const auth = getAuth(getAdminApp());
  return auth.deleteUser(uid);
}

export type { DecodedIdToken };
