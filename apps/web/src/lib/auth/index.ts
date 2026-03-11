// DO NOT re-export both client and server from the same barrel file.
// firebase (~800KB client) and firebase-admin (~100MB server) would both
// be loaded into every bundle that imports from '@/lib/auth'.
//
// Instead, import directly:
//   Client-side:  import { ... } from '@/lib/auth/client';
//   Server-side:  import { ... } from '@/lib/auth/server';

export {
  getFirebaseApp,
  getFirebaseAuth,
  loginWithEmail,
  loginWithGoogle,
  loginWithApple,
  registerWithEmail,
  resetPassword,
  logout,
  onAuthChange,
  getIdToken,
  type FirebaseUser,
} from './client';
