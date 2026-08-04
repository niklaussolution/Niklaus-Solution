import { Link, useLocation } from 'react-router-dom';
import { HelpCircle, Mail } from 'lucide-react';
import logo from '../assets/logo.png';
import { siteContent } from '../content/siteContent';
import Footer from '../components/landing/Footer';

interface LocationState {
  name?: string;
}

export default function NotReadyPage() {
  const location = useLocation();
  const { name } = (location.state as LocationState | null) ?? {};

  return (
    <div className="workshop-page min-h-screen bg-paper">
      <header className="border-b border-brand-navy/10 py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-center px-4 sm:px-6">
          <Link to="/workshop" className="flex items-center gap-2.5">
            <img src={logo} alt={siteContent.brand} className="h-9 w-9 rounded-lg bg-white p-1 ring-1 ring-brand-navy/10" />
            <span className="font-display text-sm font-bold text-brand-navy">{siteContent.brand}</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="ticket animate-issue-in overflow-hidden text-center">
          <div className="px-6 pb-8 pt-10 sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-blue/10">
              <HelpCircle className="h-9 w-9 text-brand-blue" />
            </div>
            <p className="label-mono mt-5 text-[11px] font-semibold text-brand-blue">Thanks For Letting Us Know</p>
            <h1 className="font-display mt-2 text-2xl font-bold text-brand-navy sm:text-3xl">
              {name ? `No worries, ${name.split(' ')[0]}!` : 'No worries at all.'}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-brand-navy/70 sm:text-base">
              Right now The Niklaus Solutions only runs this paid workshop (₹399). We've saved your details, and if
              we ever host a free workshop, we'll reach out to you directly on WhatsApp or email.
            </p>
          </div>
          <div className="ticket-tear -mx-px px-6 py-7 sm:px-10">
            <p className="text-center text-sm text-brand-navy/60">
              Changed your mind? You can still reserve your seat for ₹399 any time.
            </p>
            <div className="mt-4 flex justify-center">
              <Link
                to="/workshop"
                className="btn-sweep rounded-lg bg-brand-orange px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-orange/30 transition hover:-translate-y-0.5 hover:bg-brand-orange-dark hover:shadow-xl hover:shadow-brand-orange/40"
              >
                Reserve My Seat for ₹399
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-6">
          <Link to="/workshop" className="text-sm font-semibold text-brand-navy/60 hover:text-brand-navy">
            ← Back to Home
          </Link>
          <a
            href={`mailto:${siteContent.footer.contactEmail}`}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-orange"
          >
            <Mail className="h-4 w-4" /> {siteContent.footer.contactEmail}
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
