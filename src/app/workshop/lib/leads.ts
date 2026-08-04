import { query, collection, orderBy, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions, isFirebaseConfigured } from './firebase';
import { captureLeadSource, deriveSourceLabel } from './utm';
import type { Lead } from '../types/lead';

const LEADS_COLLECTION = 'Google Ads Registration';

export interface SubmitLeadInput {
  name: string;
  email: string;
  phone: string;
  formLocation: 'hero' | 'final-cta';
}

function buildLeadPayload(input: SubmitLeadInput) {
  const utm = captureLeadSource();
  return {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    formLocation: input.formLocation,
    source: deriveSourceLabel(utm),
    utm: {
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      utm_content: utm.utm_content,
      utm_term: utm.utm_term,
      gclid: utm.gclid,
      fbclid: utm.fbclid,
    },
    referrer: utm.referrer,
    landingPage: utm.landingPage,
    userAgent: navigator.userAgent,
  };
}

/**
 * Records a lead who said they're not ready to pay right now. Kept so the
 * team can follow up if a free workshop is ever offered.
 */
export async function declineLead(input: SubmitLeadInput): Promise<void> {
  if (!isFirebaseConfigured || !functions) {
    throw new Error('Registration isn’t connected to a backend yet. Firebase must be configured first.');
  }
  const recordDeclined = httpsCallable(functions, 'recordDeclinedLead');
  await recordDeclined(buildLeadPayload(input));
}

/**
 * Records a registration for someone ready to pay ₹399. No payment gateway
 * is wired up right now, so this saves the lead as "pending" — the team
 * follows up directly to collect payment and confirm the seat.
 */
export async function submitLead(input: SubmitLeadInput): Promise<void> {
  if (!isFirebaseConfigured || !functions) {
    throw new Error('Registration isn’t connected to a backend yet. Firebase must be configured first.');
  }
  const recordRegistration = httpsCallable(functions, 'recordRegistration');
  await recordRegistration(buildLeadPayload(input));
}

/** Marks a registration as paid once you've manually collected the ₹399. Admin-only. */
export async function markAsPaid(registrationId: string): Promise<void> {
  if (!isFirebaseConfigured || !functions) {
    throw new Error('Not connected to a backend yet. Firebase must be configured first.');
  }
  const mark = httpsCallable(functions, 'markRegistrationPaid');
  await mark({ registrationId });
}

export function subscribeToLeads(callback: (leads: Lead[]) => void): Unsubscribe | null {
  if (!isFirebaseConfigured || !db) {
    callback([]);
    return null;
  }

  const q = query(collection(db, LEADS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const leads = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Lead));
    callback(leads);
  });
}
