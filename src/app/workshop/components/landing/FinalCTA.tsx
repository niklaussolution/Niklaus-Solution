import LeadForm from '../LeadForm';
import Reveal from '../shared/Reveal';
import AnimatedNumber from '../shared/AnimatedNumber';
import { siteContent } from '../../content/siteContent';
import { useSeatStatus } from '../../lib/seats';

export default function FinalCTA() {
  const { finalCta } = siteContent;
  const seatStatus = useSeatStatus();
  const fillPercent = Math.round((seatStatus.claimed / seatStatus.total) * 100);

  return (
    <section className="bg-brand-orange py-16 sm:py-20">
      <Reveal className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <span className="label-mono text-xs font-semibold text-white/80">Last Call</span>
        <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {finalCta.heading}
        </h2>
        <p className="mt-3 text-lg text-white/85">{finalCta.subheading}</p>

        <div className="mx-auto mt-6 max-w-sm">
          <div className="label-mono flex justify-between text-[11px] text-white/80">
            <span>
              <AnimatedNumber value={`${seatStatus.claimed}`} /> seats claimed
            </span>
            <span>{seatStatus.total} total</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/25">
            <div
              className="animate-progress-grow h-full rounded-full bg-white"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-sm">
          <LeadForm formLocation="final-cta" ctaText={finalCta.ctaText} />
        </div>
      </Reveal>
    </section>
  );
}
