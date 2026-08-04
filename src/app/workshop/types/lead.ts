export interface Lead {
  id?: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  formLocation: 'hero' | 'final-cta';
  utm: {
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_content: string | null;
    utm_term: string | null;
    gclid: string | null;
    fbclid: string | null;
  };
  referrer: string;
  landingPage: string;
  userAgent: string;
  createdAt: unknown;
  paymentStatus: 'pending' | 'paid' | 'declined';
  readyToPay: 'Yes' | 'No';
  amount: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAt?: unknown;
}
