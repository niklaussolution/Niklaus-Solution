import { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions, isFirebaseConfigured } from './firebase';
import { siteContent } from '../content/siteContent';

interface SeatStatus {
  claimed: number;
  total: number;
}

const REFRESH_MS = 60_000;
const FALLBACK: SeatStatus = { claimed: 0, total: siteContent.finalCta.seatsTotal };

async function fetchSeatStatus(): Promise<SeatStatus> {
  if (!isFirebaseConfigured || !functions) return FALLBACK;
  const getSeatStatus = httpsCallable<void, SeatStatus>(functions, 'getSeatStatus');
  const result = await getSeatStatus();
  return result.data;
}

/** Real, live "seats claimed this week" count — resets weekly, never faked. */
export function useSeatStatus(): SeatStatus {
  const [status, setStatus] = useState<SeatStatus>(FALLBACK);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetchSeatStatus()
        .then((result) => {
          if (!cancelled) setStatus(result);
        })
        .catch(() => {
          /* keep last known value on transient failure */
        });
    };

    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return status;
}
