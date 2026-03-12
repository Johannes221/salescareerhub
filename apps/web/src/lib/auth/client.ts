import type { FirebaseApp } from 'firebase/app';
import type { Auth, User as FirebaseUser, UserCredential } from 'firebase/auth';
import type { CompanyMemberRole } from '@/lib/config';
import { getFirebaseClientConfig } from '@/lib/auth/shared';

const firebaseConfig = getFirebaseClientConfig();
const missingFirebaseConfigKeys = [
  ['NEXT_PUBLIC_FIREBASE_API_KEY', firebaseConfig.apiKey],
  ['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', firebaseConfig.authDomain],
  ['NEXT_PUBLIC_FIREBASE_PROJECT_ID', firebaseConfig.projectId],
  ['NEXT_PUBLIC_FIREBASE_APP_ID', firebaseConfig.appId],
].filter(([, value]) => !value || value === 'your-api-key').map(([key]) => key);

const isConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId &&
  firebaseConfig.apiKey !== 'your-api-key' &&
  firebaseConfig.apiKey.length > 5,
);

function getFirebaseConfigurationError() {
  if (missingFirebaseConfigKeys.length === 0) {
    return 'Firebase ist nicht konfiguriert.';
  }

  return `Firebase ist nicht konfiguriert. Fehlende Konfiguration: ${missingFirebaseConfigKeys.join(', ')}`;
}

let app: FirebaseApp | null = null;

export async function getFirebaseApp(): Promise<FirebaseApp | null> {
  if (!isConfigured) return null;
  if (!app) {
    const { initializeApp, getApps, getApp } = await import('firebase/app');
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return app;
}

export async function getFirebaseAuth(): Promise<Auth | null> {
  const fbApp = await getFirebaseApp();
  if (!fbApp) return null;
  const { getAuth } = await import('firebase/auth');
  return getAuth(fbApp);
}

export async function loginWithEmail(email: string, password: string) {
  const auth = await getFirebaseAuth();
  if (!auth) throw new Error(getFirebaseConfigurationError());
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  return signInWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle(): Promise<UserCredential> {
  const auth = await getFirebaseAuth();
  if (!auth) throw new Error(getFirebaseConfigurationError());
  const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return signInWithPopup(auth, provider);
}

export async function loginWithApple(): Promise<UserCredential> {
  const auth = await getFirebaseAuth();
  if (!auth) throw new Error(getFirebaseConfigurationError());
  const { OAuthProvider, signInWithPopup } = await import('firebase/auth');
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  return signInWithPopup(auth, provider);
}

export async function registerWithEmail(email: string, password: string) {
  const auth = await getFirebaseAuth();
  if (!auth) throw new Error(getFirebaseConfigurationError());
  const { createUserWithEmailAndPassword } = await import('firebase/auth');
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function resetPassword(email: string) {
  const auth = await getFirebaseAuth();
  if (!auth) throw new Error(getFirebaseConfigurationError());
  const { sendPasswordResetEmail } = await import('firebase/auth');
  return sendPasswordResetEmail(auth, email);
}

export async function logout() {
  await fetch('/api/auth/session', {
    method: 'DELETE',
    credentials: 'include',
  }).catch(() => undefined);

  const auth = await getFirebaseAuth();
  if (!auth) return;
  const { signOut } = await import('firebase/auth');
  return signOut(auth);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  let unsubscribe = () => {};

  void getFirebaseAuth().then(async (auth) => {
    if (!auth) {
      if (typeof window !== 'undefined') setTimeout(() => callback(null), 0);
      return;
    }

    const { onAuthStateChanged } = await import('firebase/auth');
    unsubscribe = onAuthStateChanged(auth, callback);
  });

  return () => unsubscribe();
}

export async function getIdToken(): Promise<string | null> {
  const auth = await getFirebaseAuth();
  if (!auth) return null;
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export async function establishServerSession(token?: string | null) {
  const resolvedToken = token ?? await getIdToken();

  if (!resolvedToken) {
    throw new Error('Authentifizierung fehlgeschlagen.');
  }

  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resolvedToken}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || 'Server-Session konnte nicht erstellt werden.');
  }
}

export async function syncCurrentUser(payload?: {
  role?: 'candidate' | 'company';
  companyRole?: CompanyMemberRole;
  displayName?: string | null;
}) {
  const token = await getIdToken();

  if (!token) {
    throw new Error('Authentifizierung fehlgeschlagen.');
  }

  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload || {}),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || 'Benutzer konnte nicht synchronisiert werden.');
  }

  await establishServerSession(token).catch(() => undefined);

  return response.json().catch(() => null);
}

export type { FirebaseUser };
