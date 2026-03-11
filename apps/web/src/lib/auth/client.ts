import type { FirebaseApp } from 'firebase/app';
import type { Auth, User as FirebaseUser, UserCredential } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your-api-key' && firebaseConfig.apiKey.length > 5;

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
  if (!auth) throw new Error('Firebase ist nicht konfiguriert. Bitte .env-Datei mit Firebase-Credentials füllen.');
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  return signInWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle(): Promise<UserCredential> {
  const auth = await getFirebaseAuth();
  if (!auth) throw new Error('Firebase ist nicht konfiguriert. Bitte .env-Datei mit Firebase-Credentials füllen.');
  const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return signInWithPopup(auth, provider);
}

export async function loginWithApple(): Promise<UserCredential> {
  const auth = await getFirebaseAuth();
  if (!auth) throw new Error('Firebase ist nicht konfiguriert. Bitte .env-Datei mit Firebase-Credentials füllen.');
  const { OAuthProvider, signInWithPopup } = await import('firebase/auth');
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  return signInWithPopup(auth, provider);
}

export async function registerWithEmail(email: string, password: string) {
  const auth = await getFirebaseAuth();
  if (!auth) throw new Error('Firebase ist nicht konfiguriert. Bitte .env-Datei mit Firebase-Credentials füllen.');
  const { createUserWithEmailAndPassword } = await import('firebase/auth');
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function resetPassword(email: string) {
  const auth = await getFirebaseAuth();
  if (!auth) throw new Error('Firebase ist nicht konfiguriert. Bitte .env-Datei mit Firebase-Credentials füllen.');
  const { sendPasswordResetEmail } = await import('firebase/auth');
  return sendPasswordResetEmail(auth, email);
}

export async function logout() {
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

export type { FirebaseUser };
