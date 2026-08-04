import { CheckCircle2 } from 'lucide-react';
import SectionHeading from '../shared/SectionHeading';
import Reveal from '../shared/Reveal';
import { siteContent } from '../../content/siteContent';

/** Renders `**bold**` segments as <strong> — just enough markdown for emphasis in list copy. */
function renderEmphasis(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold text-brand-navy">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  );
}

export default function WhatYouLearn() {
  const { whatYouLearn } = siteContent;
  return (
    <section id="curriculum" data-scroll-anchor className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <SectionHeading eyebrow="The Curriculum" heading={whatYouLearn.heading} subheading={whatYouLearn.subheading} />
        <Reveal stagger className="mt-10 space-y-3">
          {whatYouLearn.items.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-xl border border-brand-blue/15 bg-paper p-4 transition-colors duration-300 hover:border-brand-blue-light/40 hover:bg-brand-blue/5"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue-light" />
              <p className="text-brand-navy/80">{renderEmphasis(item)}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
