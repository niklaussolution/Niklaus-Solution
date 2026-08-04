import { Clock, MessageCircleQuestion, BookOpen, Award } from 'lucide-react';
import SectionHeading from '../shared/SectionHeading';
import Reveal from '../shared/Reveal';
import { siteContent } from '../../content/siteContent';

const icons = [Clock, MessageCircleQuestion, BookOpen, Award];

export default function WorkshopHighlights() {
  const { highlights } = siteContent;
  return (
    <section className="bg-brand-navy py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="Inside the Room" heading={highlights.heading} light />
        <Reveal stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.items.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <div
                key={item.title}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-brand-orange/30 hover:bg-white/[0.08]"
              >
                <Icon className="mx-auto mb-3 h-7 w-7 text-brand-orange transition-transform duration-300 group-hover:scale-110" />
                <h3 className="font-display font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-white/60">{item.description}</p>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
