import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';

let adminApp: App;

function getAdminApp(): App {
  if (!adminApp) {
    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
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
