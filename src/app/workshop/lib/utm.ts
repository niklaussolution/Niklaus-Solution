const STORAGE_KEY = 'tns_lead_source';

export interface LeadSource {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  gclid: string | null;
  fbclid: string | null;
  referrer: string;
  landingPage: string;
}

function readFromUrl(): LeadSource | null {
  const params = new URLSearchParams(window.location.search);
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'] as const;
  const hasAny = keys.some((k) => params.has(k));
  if (!hasAny) return null;

  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
    gclid: params.get('gclid'),
    fbclid: params.get('fbclid'),
    referrer: document.referrer || 'direct',
    landingPage: window.location.href,
  };
}

/**
 * Captures ad-click params on first touch and persists them for the
 * whole session so the lead is still attributed if the form is
 * submitted after navigating within the site.
 */
export function captureLeadSource(): LeadSource {
  const fromUrl = readFromUrl();
  if (fromUrl) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl));
    return fromUrl;
  }

  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as LeadSource;
    } catch {
      // fall through to default
    }
  }

  const fallback: LeadSource = {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    gclid: null,
    fbclid: null,
    referrer: document.referrer || 'direct',
    landingPage: window.location.href,
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
  return fallback;
}

export function deriveSourceLabel(utm: LeadSource): string {
  if (utm.gclid || utm.utm_source === 'google') return 'Google Ads';
  if (utm.fbclid || utm.utm_source === 'facebook' || utm.utm_source === 'instagram') return 'Meta Ads';
  if (utm.utm_source) return utm.utm_source;
  if (utm.referrer && utm.referrer !== 'direct') {
    try {
      return new URL(utm.referrer).hostname.replace('www.', '');
    } catch {
      return 'Referral';
    }
  }
  return 'Direct';
}
