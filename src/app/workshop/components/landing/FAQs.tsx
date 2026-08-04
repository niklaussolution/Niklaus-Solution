import { useState } from 'react';
import { Plus } from 'lucide-react';
import SectionHeading from '../shared/SectionHeading';
import Reveal from '../shared/Reveal';
import { siteContent } from '../../content/siteContent';

export default function FAQs() {
  const { faqs } = siteContent;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" data-scroll-anchor className="bg-paper py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading eyebrow="Before You Register" heading={faqs.heading} />
        <Reveal className="mt-10 space-y-3">
          {faqs.items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={item.question}
                className={`overflow-hidden rounded-xl border bg-white transition-colors duration-300 ${isOpen ? 'border-brand-orange/40' : 'border-brand-navy/10'}`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-brand-navy"
                >
                  {item.question}
                  <Plus className={`h-5 w-5 shrink-0 text-brand-orange transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
                </button>
                <div className={`accordion-panel ${isOpen ? 'is-open' : ''}`}>
                  <div>
                    <div className="border-t border-brand-navy/10 px-5 py-4 text-brand-navy/70">{item.answer}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
