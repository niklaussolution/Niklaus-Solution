import SectionHeading from '../shared/SectionHeading';
import Reveal from '../shared/Reveal';
import trainerPhoto from '../../assets/trainer-photo.png';
import { siteContent } from '../../content/siteContent';

export default function MeetTrainer() {
  const { trainer } = siteContent;
  return (
    <section id="trainer" data-scroll-anchor className="bg-paper py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading eyebrow="Who's Briefing You" heading={trainer.heading} />
        <div className="mt-10 grid items-center gap-6 lg:grid-cols-2 lg:gap-14">
          <Reveal animation="animate-slide-in-left" className="mx-auto w-full max-w-sm lg:mx-0">
            <div className="group relative">
              <img
                src={trainerPhoto}
                alt={trainer.name}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                className="relative mx-auto block w-full max-w-[300px] select-none transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.03]"
              />
            </div>
          </Reveal>

          <Reveal className="text-center lg:text-left">
            <h3 className="font-display text-2xl font-bold text-brand-navy">{trainer.name}</h3>
            <p className="label-mono mt-1 text-xs font-semibold text-brand-orange">{trainer.role}</p>
            <p className="mt-4 text-brand-navy/70">{trainer.bio}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
              {trainer.credentials.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue"
                >
                  {c}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
