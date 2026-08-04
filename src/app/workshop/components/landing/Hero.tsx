import { useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import LeadForm from '../LeadForm';
import AnimatedNumber from '../shared/AnimatedNumber';
import TypingText from '../shared/TypingText';
import { siteContent } from '../../content/siteContent';

export default function Hero() {
  const { hero, brand } = siteContent;
  const sectionRef = useRef<HTMLElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x, y });
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden bg-brand-navy pt-20"
    >
      {/* one restrained accent glow, not a decorative pattern grid — drifts gently on its
          own, and nudges toward the cursor for a subtle sense of depth */}
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -right-24 top-24 h-96 w-96 rounded-full bg-brand-orange/20 blur-3xl transition-transform duration-700 ease-out"
        style={{ transform: `translate(${tilt.x * 24}px, ${tilt.y * 24}px)` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-brand-blue-light/20 blur-3xl transition-transform duration-700 ease-out"
        style={{ transform: `translate(${tilt.x * -18}px, ${tilt.y * -18}px)` }}
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
        <div className="animate-fade-in-up text-center lg:text-left">
          <span className="label-mono inline-block text-xs font-semibold text-brand-orange">
            {hero.eyebrow}
          </span>
          <h1 className="font-display mt-4 min-h-[2.2em] text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
            <TypingText text={hero.headline} />
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-lg text-white/70 lg:mx-0">{hero.subheadline}</p>

          <ul className="mx-auto mt-7 max-w-md space-y-2.5 text-left lg:mx-0">
            {hero.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2.5 text-white/90">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-white/10 pt-6 lg:justify-start">
            {hero.stats.map((stat) => (
              <div key={stat.label} className="text-center lg:text-left">
                <p className="font-display text-2xl font-bold text-white">
                  <AnimatedNumber value={stat.value} />
                </p>
                <p className="label-mono text-[10px] text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="register" className="animate-issue-in mx-auto w-full max-w-sm [animation-delay:150ms]">
          <p className="mb-2 text-center text-xs font-medium text-white/50 lg:hidden">{brand}</p>
          <LeadForm formLocation="hero" ctaText={hero.ctaText} />
        </div>
      </div>
    </section>
  );
}
