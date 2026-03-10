export {
  getFirebaseApp,
  getFirebaseAuth,
  loginWithEmail,
  registerWithEmail,
  resetPassword,
  logout,
  onAuthChange,
  getIdToken,
  type FirebaseUser,
} from './client';

export {
  verifyIdToken,
  getFirebaseUser,
  createFirebaseUser,
  deleteFirebaseUser,
  type DecodedIdToken,
} from './server';
