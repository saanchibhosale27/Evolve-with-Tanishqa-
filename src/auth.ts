import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Strict Authorized Admin list
export const AUTHORIZED_ADMIN_EMAILS = [
  'tanishqabhosale99@gmail.com',
  'saanchibhosale27@gmail.com',
];

/**
 * Checks if an email is in the authorized admin list
 */
export function isEmailAuthorizedAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return AUTHORIZED_ADMIN_EMAILS.some((admin) => admin.toLowerCase() === normalized);
}

/**
 * Retrieve the current Firebase Auth ID Token for server-side verification
 */
export async function getCurrentIdToken(forceRefresh = false): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken(forceRefresh);
  } catch (err) {
    console.error('[AUTH] Failed to get ID token:', err);
    return null;
  }
}

/**
 * Sign in with email and password
 */
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return cred.user;
}

/**
 * Sign up with email and password (for initial account setup)
 */
export async function registerWithEmail(email: string, pass: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  return cred.user;
}

/**
 * Sign in with Google Popup
 */
export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Sign out
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribe to auth state changes
 */
export function subscribeToAuth(callback: (user: User | null, isAdmin: boolean) => void) {
  return onAuthStateChanged(auth, (user) => {
    const isAdmin = isEmailAuthorizedAdmin(user?.email);
    callback(user, isAdmin);
  });
}
