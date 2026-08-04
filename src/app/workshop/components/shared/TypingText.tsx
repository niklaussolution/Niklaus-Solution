import { useEffect, useState } from 'react';

interface TypingTextProps {
  text: string;
  speed?: number;
  startDelay?: number;
}

/**
 * Reveals `text` one character at a time with a blinking cursor. The full
 * text is also rendered in a screen-reader-only span so assistive tech and
 * crawlers get the real heading immediately, not a half-typed fragment.
 */
export default function TypingText({ text, speed = 45, startDelay = 300 }: TypingTextProps) {
  const [display, setDisplay] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplay(text);
      setDone(true);
      return;
    }

    let i = 0;
    let interval: ReturnType<typeof setInterval>;
    const startTimeout = setTimeout(() => {
      interval = setInterval(() => {
        i++;
        setDisplay(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(startTimeout);
      clearInterval(interval);
    };
  }, [text, speed, startDelay]);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {display}
        <span
          className={`ml-1 inline-block h-[0.85em] w-[3px] translate-y-[0.1em] bg-current align-middle ${
            done ? 'animate-cursor-blink' : 'opacity-100'
          }`}
        />
      </span>
    </>
  );
}
