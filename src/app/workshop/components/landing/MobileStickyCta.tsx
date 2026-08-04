import { useEffect, useState } from 'react';
import { siteContent } from '../../content/siteContent';

export default function MobileStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 700);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-brand-navy/10 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(11,18,32,0.25)] backdrop-blur transition-transform duration-300 sm:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <a
        href="#register"
        className="btn-sweep flex w-full items-center justify-center rounded-lg bg-brand-orange px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98]"
      >
        {siteContent.hero.ctaText}
      </a>
    </div>
  );
}
