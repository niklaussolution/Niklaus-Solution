import { useEffect, useState } from 'react';
import { Quote, Star } from 'lucide-react';
import SectionHeading from '../shared/SectionHeading';
import Reveal from '../shared/Reveal';
import { subscribeToApprovedReviews } from '../../lib/reviews';
import type { Review } from '../../types/review';

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

/** Shows real, admin-approved attendee reviews. Renders nothing until at least one exists. */
export default function RealReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const unsub = subscribeToApprovedReviews(setReviews);
    return () => unsub?.();
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="From Real Attendees" heading="What People Are Saying" />
        <Reveal stagger className="mt-12 grid gap-6 md:grid-cols-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="flex flex-col rounded-2xl border border-brand-navy/10 bg-paper p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-navy/10"
            >
              <Quote className="mb-3 h-7 w-7 text-brand-orange/50" />
              <p className="flex-1 text-brand-navy/80">"{r.comment}"</p>
              <div className="mt-5 flex items-center gap-1 text-brand-orange">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-current' : 'text-brand-navy/15'}`} />
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">
                  {initials(r.name)}
                </div>
                <div>
                  <p className="font-display font-semibold text-brand-navy">{r.name}</p>
                  {r.role && <p className="text-sm text-brand-navy/50">{r.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
