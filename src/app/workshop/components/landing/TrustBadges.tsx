import { Video, GraduationCap, Award, UserCheck } from 'lucide-react';
import { siteContent } from '../../content/siteContent';

const icons = [Video, GraduationCap, Award, UserCheck];

export default function TrustBadges() {
  const { trustBadges } = siteContent;
  return (
    <section className="border-y border-brand-navy/10 bg-white py-7">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="label-mono mb-5 text-center text-[11px] font-semibold text-brand-navy/40">
          {trustBadges.heading}
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {trustBadges.items.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <div key={item} className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-center">
                <Icon className="h-4 w-4 shrink-0 text-brand-orange" />
                <span className="text-sm font-semibold text-brand-navy">{item}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
