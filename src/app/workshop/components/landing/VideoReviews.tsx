import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import SectionHeading from '../shared/SectionHeading';
import Reveal from '../shared/Reveal';

interface VideoReview {
  id: string;
  title: string;
}

const videos: VideoReview[] = [
  { id: 'xRO56Q2wfb8', title: 'Attendee review — Cyber Security Awareness Workshop' },
  { id: 'Pp8w8yZZ-ZI', title: 'Attendee review — Cyber Security Awareness Workshop' },
];

/**
 * Real attendee video reviews, one at a time in a phone-window frame. Each
 * video shows YouTube's own thumbnail until clicked — the raw embed iframe
 * otherwise briefly shows a black frame while it loads its own thumbnail
 * internally. Only one iframe is ever mounted, so switching videos (or
 * navigating away) always stops whatever was playing.
 */
export default function VideoReviews() {
  const [active, setActive] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const current = videos[active];
  const isPlaying = playingId === current.id;

  function goTo(index: number) {
    setActive((index + videos.length) % videos.length);
  }

  return (
    <section className="bg-paper py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="See It For Yourself"
          heading="Real Attendees, On Camera"
          subheading="Short clips from people who actually sat through the workshop."
        />

        <Reveal className="mt-12 flex items-center justify-center gap-2 sm:gap-6">
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Previous video"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-navy/15 bg-white text-brand-navy transition hover:border-brand-orange hover:text-brand-orange sm:h-11 sm:w-11"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="w-full max-w-[240px] overflow-hidden rounded-[28px] bg-brand-navy p-2 shadow-xl shadow-brand-navy/20 ring-1 ring-brand-navy/10 sm:max-w-[300px]">
            <div className="flex items-center justify-center py-1.5">
              <span className="h-1.5 w-10 rounded-full bg-white/20" />
            </div>
            <div className="relative aspect-[9/16] overflow-hidden rounded-[20px] bg-black">
              {isPlaying ? (
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${current.id}?autoplay=1`}
                  title={current.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlayingId(current.id)}
                  className="group absolute inset-0 flex items-center justify-center"
                  aria-label={`Play video: ${current.title}`}
                >
                  <img
                    src={`https://i.ytimg.com/vi/${current.id}/hqdefault.jpg`}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 bg-black/25 transition group-hover:bg-black/10" />
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg transition group-hover:scale-110">
                    <Play className="h-6 w-6 translate-x-0.5 fill-brand-navy text-brand-navy" />
                  </span>
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Next video"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-navy/15 bg-white text-brand-navy transition hover:border-brand-orange hover:text-brand-orange sm:h-11 sm:w-11"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </Reveal>

        <div className="mt-6 flex items-center justify-center gap-2">
          {videos.map((video, i) => (
            <button
              key={video.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show video ${i + 1}`}
              aria-current={i === active}
              className={`h-2 rounded-full transition-all ${
                i === active ? 'w-6 bg-brand-orange' : 'w-2 bg-brand-navy/20 hover:bg-brand-navy/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
