import { Hammer, MessageCircle, Wrench } from 'lucide-react';
import SectionHeading from '../shared/SectionHeading';
import Reveal from '../shared/Reveal';
import { siteContent } from '../../content/siteContent';

const icons = [Hammer, MessageCircle, Wrench];

export default function Testimonials() {
  const { outcomes } = siteContent;
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="What To Expect" heading={outcomes.heading} subheading={outcomes.subheading} />
        <Reveal stagger className="mt-12 grid gap-6 md:grid-cols-3">
          {outcomes.items.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <div
                key={item.title}
                className="group flex flex-col rounded-2xl border border-brand-navy/10 bg-paper p-6 text-center transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-navy/10"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange/10 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-6 w-6 text-brand-orange" />
                </div>
                <h3 className="font-display font-semibold text-brand-navy">{item.title}</h3>
                <p className="mt-2 text-sm text-brand-navy/70">{item.description}</p>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
