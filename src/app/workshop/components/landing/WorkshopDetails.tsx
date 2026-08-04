import { Calendar, Clock3, Video, IndianRupee } from 'lucide-react';
import SectionHeading from '../shared/SectionHeading';
import Reveal from '../shared/Reveal';
import CountdownTimer from '../shared/CountdownTimer';
import { siteContent } from '../../content/siteContent';
import { getNextWorkshopDateLabel } from '../../lib/workshopSchedule';

const icons = [Calendar, Clock3, Video, IndianRupee];

export default function WorkshopDetails() {
  const { workshopDetails } = siteContent;
  const items = workshopDetails.items.map((item) =>
    item.label === 'Date' ? { ...item, value: getNextWorkshopDateLabel() } : item
  );
  return (
    <section className="bg-brand-navy py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading eyebrow="Save The Date" heading={workshopDetails.heading} light />
        <Reveal className="mt-8">
          <CountdownTimer />
        </Reveal>
        <Reveal>
          <div className="ticket mt-8 overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 sm:px-8">
              <span className="label-mono text-[10px] font-semibold text-brand-navy/40">Workshop Pass</span>
              <span className="h-2 w-2 rounded-full bg-brand-orange" />
            </div>
            <div className="grid gap-5 px-6 py-6 sm:grid-cols-2 sm:px-8">
              {items.map((item, i) => {
                const Icon = icons[i % icons.length];
                return (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
                      <Icon className="h-5 w-5 text-brand-blue" />
                    </div>
                    <div>
                      <p className="label-mono text-[10px] font-semibold text-brand-navy/40">{item.label}</p>
                      <p className="font-display font-semibold text-brand-navy">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="ticket-tear -mx-px px-6 py-4 text-center sm:px-8">
              <p className="text-xs text-brand-navy/50">
                Google Meet link shared via email &amp; WhatsApp after registration · limited to the first 30 seats
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
