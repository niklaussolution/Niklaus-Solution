/**
 * The workshop runs every Sunday, 11 AM–1 PM IST. Once that window has
 * passed for the current week, the "next session" rolls forward to the
 * following Sunday automatically — no manual date edits needed.
 */

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

const WORKSHOP_END_HOUR_IST = 13; // 1 PM

function nowInIST(): Date {
  // Render the current instant as if read from IST, without needing a full
  // timezone library — good enough for picking "which Sunday" to show.
  const utc = new Date(Date.now());
  const istOffsetMinutes = 5.5 * 60;
  return new Date(utc.getTime() + (istOffsetMinutes + utc.getTimezoneOffset()) * 60000);
}

export function getNextWorkshopDate(reference: Date = nowInIST()): Date {
  const day = reference.getDay(); // 0 = Sunday
  const hour = reference.getHours();

  let daysUntilSunday: number;
  if (day === 0) {
    daysUntilSunday = hour < WORKSHOP_END_HOUR_IST ? 0 : 7;
  } else {
    daysUntilSunday = 7 - day;
  }

  const result = new Date(reference);
  result.setDate(reference.getDate() + daysUntilSunday);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function formatWorkshopDate(date: Date): string {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  return `${weekday}, ${ordinal(date.getDate())} ${month} ${date.getFullYear()}`;
}

export function getNextWorkshopDateLabel(): string {
  return formatWorkshopDate(getNextWorkshopDate());
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const WORKSHOP_START_HOUR_IST = 11; // 11 AM

/**
 * Real UTC timestamp (ms since epoch) of the next workshop's start time —
 * done with pure UTC math so it's correct regardless of the visitor's own
 * timezone, unlike reading local Date fields directly.
 */
export function getNextWorkshopStartTimestamp(nowMs: number = Date.now()): number {
  const istMs = nowMs + IST_OFFSET_MS;
  const istDate = new Date(istMs);
  const day = istDate.getUTCDay();
  const hour = istDate.getUTCHours();

  let daysUntilSunday: number;
  if (day === 0) {
    daysUntilSunday = hour < WORKSHOP_END_HOUR_IST ? 0 : 7;
  } else {
    daysUntilSunday = 7 - day;
  }

  const targetIstMidnightMs = Date.UTC(
    istDate.getUTCFullYear(),
    istDate.getUTCMonth(),
    istDate.getUTCDate() + daysUntilSunday,
    0, 0, 0, 0
  );
  const targetIstStartMs = targetIstMidnightMs + WORKSHOP_START_HOUR_IST * 60 * 60 * 1000;
  return targetIstStartMs - IST_OFFSET_MS;
}
