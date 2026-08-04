import {
  query,
  collection,
  orderBy,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions, isFirebaseConfigured } from './firebase';
import type { Review } from '../types/review';

const REVIEWS_COLLECTION = 'Workshop Reviews';

export interface SubmitReviewInput {
  name: string;
  role?: string;
  rating: number;
  comment: string;
}

/** Submits a real attendee review. Always lands as unapproved until an admin reviews it. */
export async function submitReview(input: SubmitReviewInput): Promise<void> {
  if (!isFirebaseConfigured || !functions) {
    throw new Error('Not connected to a backend yet. Firebase must be configured first.');
  }
  const submit = httpsCallable(functions, 'submitReview');
  await submit(input);
}

/** Public-facing: only reviews an admin has approved. */
export function subscribeToApprovedReviews(callback: (reviews: Review[]) => void): Unsubscribe | null {
  if (!isFirebaseConfigured || !db) {
    callback([]);
    return null;
  }
  const q = query(
    collection(db, REVIEWS_COLLECTION),
    where('approved', '==', true),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Review)));
  });
}

/** Admin-facing: every review, approved or not, newest first. */
export function subscribeToAllReviews(callback: (reviews: Review[]) => void): Unsubscribe | null {
  if (!isFirebaseConfigured || !db) {
    callback([]);
    return null;
  }
  const q = query(collection(db, REVIEWS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Review)));
  });
}

/** Admin-only: approve or unapprove a review. Firestore rules require a signed-in admin for this. */
export async function setReviewApproval(reviewId: string, approved: boolean): Promise<void> {
  if (!db) throw new Error('Not connected to a backend yet.');
  await updateDoc(doc(db, REVIEWS_COLLECTION, reviewId), { approved });
}

/** Admin-only: permanently remove a review (e.g. spam). */
export async function deleteReview(reviewId: string): Promise<void> {
  if (!db) throw new Error('Not connected to a backend yet.');
  await deleteDoc(doc(db, REVIEWS_COLLECTION, reviewId));
}
