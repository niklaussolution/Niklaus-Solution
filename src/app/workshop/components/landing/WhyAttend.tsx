import { Target, Wrench, Mic, Gift } from 'lucide-react';
import SectionHeading from '../shared/SectionHeading';
import Reveal from '../shared/Reveal';
import { siteContent } from '../../content/siteContent';

const icons = [Wrench, Target, Mic, Gift];

export default function WhyAttend() {
  const { whyAttend } = siteContent;
  return (
    <section id="why" data-scroll-anchor className="bg-paper py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="Why This, Why Now" heading={whyAttend.heading} subheading={whyAttend.subheading} />
        <Reveal stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyAttend.points.map((point, i) => {
            const Icon = icons[i % icons.length];
            return (
              <div
                key={point.title}
                className="group rounded-2xl border border-brand-navy/10 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-brand-navy/10"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange/10 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-6 w-6 text-brand-orange" />
                </div>
                <h3 className="font-display font-semibold text-brand-navy">{point.title}</h3>
                <p className="mt-2 text-sm text-brand-navy/60">{point.description}</p>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
