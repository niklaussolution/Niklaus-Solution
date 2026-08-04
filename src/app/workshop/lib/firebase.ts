/**
 * Auth, Firestore, and Cloud Functions for the workshop funnel all live in
 * the "niklaussolutions" project - the same one the rest of this site
 * already uses (see src/config/firebase.ts), so this just re-exports it.
 */
export { db, functions } from '../../../config/firebase';
export const isFirebaseConfigured = true;
