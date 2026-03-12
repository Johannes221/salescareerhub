import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import { sanitizeEnvValue } from '@/lib/auth/shared';

let adminApp: App;

type FirebaseAdminConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

function getFirebaseAdminConfig(): FirebaseAdminConfig {
  const projectId = sanitizeEnvValue(process.env.FIREBASE_ADMIN_PROJECT_ID);
  const clientEmail = sanitizeEnvValue(process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
  const privateKey = sanitizeEnvValue(process.env.FIREBASE_ADMIN_PRIVATE_KEY)?.replace(/\\n/g, '\n');
  const publicProjectId = sanitizeEnvValue(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

  const missingKeys = [
    !projectId ? 'FIREBASE_ADMIN_PROJECT_ID' : null,
    !clientEmail ? 'FIREBASE_ADMIN_CLIENT_EMAIL' : null,
    !privateKey ? 'FIREBASE_ADMIN_PRIVATE_KEY' : null,
  ].filter((value): value is string => Boolean(value));

  if (missingKeys.length > 0) {
    throw new Error(`Firebase Admin ist nicht vollständig konfiguriert: ${missingKeys.join(', ')}`);
  }

  if (publicProjectId && projectId && publicProjectId !== projectId) {
    throw new Error('Firebase Web SDK und Firebase Admin SDK verwenden unterschiedliche Projekte. Bitte prüfe NEXT_PUBLIC_FIREBASE_PROJECT_ID und FIREBASE_ADMIN_PROJECT_ID.');
  }

  return {
    projectId: projectId!,
    clientEmail: clientEmail!,
    privateKey: privateKey!,
  };
}

export function getFirebaseAdminErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : '';

  if (message.includes('Firebase Admin ist nicht vollständig konfiguriert')) {
    return message;
  }

  if (message.includes('Failed to parse private key')) {
    return 'Firebase Admin Private Key ist ungültig formatiert.';
  }

  if (message.includes('credential implementation provided to initializeApp() via the "credential" property failed to fetch a valid Google OAuth2 access token')) {
    return 'Firebase Admin Credentials sind ungültig oder gehören zum falschen Projekt.';
  }

  if (message.includes('incorrect "aud"') || message.includes('incorrect "iss"')) {
    return 'Firebase Web SDK und Firebase Admin SDK verwenden unterschiedliche Projekte. Bitte prüfe NEXT_PUBLIC_FIREBASE_* gegen FIREBASE_ADMIN_*.';
  }

  if (message.includes('Expected an ID token, but was given a custom token')) {
    return 'Der Server hat kein Firebase ID Token erhalten.';
  }

  return null;
}

function getAdminApp(): App {
  if (!adminApp) {
    if (getApps().length === 0) {
      const config = getFirebaseAdminConfig();
      adminApp = initializeApp({
        credential: cert({
          projectId: config.projectId,
          clientEmail: config.clientEmail,
          privateKey: config.privateKey,
        }),
      });
    } else {
      adminApp = getApps()[0];
    }
  }
  return adminApp;
}

export function getFirebaseAdminApp() {
  return getAdminApp();
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
