import { useEffect, useState } from 'react';
import { getNextWorkshopStartTimestamp } from '../../lib/workshopSchedule';

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function getTimeParts(diffMs: number) {
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

/** Live digital countdown to the next workshop session, ticking every second. */
export default function CountdownTimer() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const target = getNextWorkshopStartTimestamp(now);
  const diff = target - now;
  const isLive = diff <= 0;
  const { days, hours, minutes, seconds } = getTimeParts(diff);

  if (isLive) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        Workshop is live now
      </div>
    );
  }

  const units = [
    { value: days, label: 'Days' },
    { value: hours, label: 'Hours' },
    { value: minutes, label: 'Min' },
    { value: seconds, label: 'Sec' },
  ];

  return (
    <div>
      <p className="label-mono mb-3 text-center text-[11px] font-semibold text-white/50">Next Session Starts In</p>
      <div className="flex items-start justify-center gap-2 sm:gap-3">
        {units.map((u, i) => (
          <div key={u.label} className="flex items-start gap-2 sm:gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 font-mono text-xl font-bold tabular-nums text-white ring-1 ring-white/10 sm:h-20 sm:w-20 sm:text-2xl">
                {pad(u.value)}
              </div>
              <span className="label-mono mt-2 text-[10px] text-white/40">{u.label}</span>
            </div>
            {i < units.length - 1 && <span className="pt-2.5 text-xl font-bold text-brand-orange sm:text-2xl">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
