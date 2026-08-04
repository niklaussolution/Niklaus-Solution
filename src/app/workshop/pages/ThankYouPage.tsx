import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail } from 'lucide-react';
import logo from '../assets/logo.png';
import { siteContent } from '../content/siteContent';
import TypingText from '../components/shared/TypingText';
import Reveal from '../components/shared/Reveal';
import WorkshopDetails from '../components/landing/WorkshopDetails';
import Footer from '../components/landing/Footer';

interface LocationState {
  name?: string;
}

const nextSteps = [
  {
    title: 'Watch WhatsApp & email',
    description: "We'll message you directly — no forms, no waiting on hold.",
  },
  {
    title: 'Complete your ₹399 payment',
    description: 'Our team confirms your seat the moment it clears.',
  },
  {
    title: 'Get your live session link',
    description: 'Sent before the workshop starts — just show up and log in.',
  },
];

export default function ThankYouPage() {
  const location = useLocation();
  const { name } = (location.state as LocationState | null) ?? {};

  return (
    <div className="workshop-page min-h-screen bg-paper">
      <section className="relative overflow-hidden bg-brand-navy px-4 py-14 text-center sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
            backgroundSize: '34px 34px',
          }}
        />

        <Link to="/workshop" className="relative z-10 inline-flex items-center gap-2.5">
          <img src={logo} alt={siteContent.brand} className="h-8 w-8 rounded-lg bg-white p-1" />
          <span className="font-display text-sm font-bold text-white/90">{siteContent.brand}</span>
        </Link>

        <div className="relative z-10 mx-auto mt-10 max-w-lg animate-issue-in">
          <p className="label-mono text-[11px] text-brand-orange">
            <TypingText text="> registration_status --verify" speed={26} startDelay={150} />
          </p>

          <div className="relative mx-auto mt-8 flex h-24 w-24 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/20" />
            <span className="absolute inline-flex h-[82%] w-[82%] rounded-full bg-emerald-400/10 ring-1 ring-emerald-400/30" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/40">
              <ShieldCheck className="h-8 w-8 text-emerald-400" />
            </div>
          </div>

          <p className="label-mono mt-5 text-[11px] font-semibold text-emerald-400">Access Granted</p>
          <h1 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl">
            {name ? `You're In, ${name.split(' ')[0]}!` : "You're Registered!"}
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm text-white/60 sm:text-base">
            Our team will contact you shortly on WhatsApp or email to collect the ₹399 payment and confirm your
            seat.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <Reveal stagger className="grid gap-5 sm:grid-cols-3">
          {nextSteps.map((step, i) => (
            <div key={step.title} className="ticket p-6">
              <span className="label-mono flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue/10 text-xs font-bold text-brand-blue">
                {i + 1}
              </span>
              <h3 className="font-display mt-3 text-sm font-bold text-brand-navy">{step.title}</h3>
              <p className="mt-1.5 text-sm text-brand-navy/60">{step.description}</p>
            </div>
          ))}
        </Reveal>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-6">
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

      <WorkshopDetails />
      <Footer />
    </div>
  );
}
