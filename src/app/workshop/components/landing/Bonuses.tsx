import { Gift } from 'lucide-react';
import SectionHeading from '../shared/SectionHeading';
import Reveal from '../shared/Reveal';
import { siteContent } from '../../content/siteContent';

export default function Bonuses() {
  const { bonuses } = siteContent;
  return (
    <section className="bg-paper py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <SectionHeading eyebrow="The Offer Stack" heading={bonuses.heading} subheading={bonuses.subheading} />
        <Reveal>
          <div className="mt-10 divide-y divide-brand-navy/10 rounded-2xl border border-brand-navy/10 bg-white">
            {bonuses.items.map((item) => (
              <div key={item.title} className="flex items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange/10">
                    <Gift className="h-4 w-4 text-brand-orange" />
                  </div>
                  <span className="font-medium text-brand-navy">{item.title}</span>
                </div>
                <span className="label-mono shrink-0 text-xs text-brand-navy/40 line-through">
                  {item.value}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 bg-brand-navy p-5">
              <span className="font-display font-semibold text-white">Total value</span>
              <span className="label-mono text-sm text-white/40 line-through">{bonuses.totalValue}</span>
            </div>
            <div className="flex items-center justify-between gap-4 bg-brand-orange p-5">
              <span className="font-display font-semibold text-white">Your price today</span>
              <span className="font-display text-lg font-bold text-white">{bonuses.workshopFee}</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
