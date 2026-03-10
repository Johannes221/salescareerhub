import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  type Auth,
  type User as FirebaseUser,
  type UserCredential,
} from 'firebase/auth';

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

export function getFirebaseApp(): FirebaseApp | null {
  if (!isConfigured) return null;
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return app;
}

export function getFirebaseAuth(): Auth | null {
  const fbApp = getFirebaseApp();
  if (!fbApp) return null;
  return getAuth(fbApp);
}

export async function loginWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase ist nicht konfiguriert. Bitte .env-Datei mit Firebase-Credentials füllen.');
  return signInWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle(): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase ist nicht konfiguriert. Bitte .env-Datei mit Firebase-Credentials füllen.');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return signInWithPopup(auth, provider);
}

export async function loginWithApple(): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase ist nicht konfiguriert. Bitte .env-Datei mit Firebase-Credentials füllen.');
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  return signInWithPopup(auth, provider);
}

export async function registerWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase ist nicht konfiguriert. Bitte .env-Datei mit Firebase-Credentials füllen.');
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function resetPassword(email: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase ist nicht konfiguriert. Bitte .env-Datei mit Firebase-Credentials füllen.');
  return sendPasswordResetEmail(auth, email);
}

export async function logout() {
  const auth = getFirebaseAuth();
  if (!auth) return;
  return signOut(auth);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  const auth = getFirebaseAuth();
  if (!auth) {
    // No Firebase configured – call back with null immediately, return no-op unsubscribe
    if (typeof window !== 'undefined') setTimeout(() => callback(null), 0);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function getIdToken(): Promise<string | null> {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export type { FirebaseUser };
