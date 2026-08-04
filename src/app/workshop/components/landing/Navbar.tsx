import { useEffect, useState } from 'react';
import logoIcon from '../../assets/logo-icon.png';
import { siteContent } from '../../content/siteContent';

const NAV_LINKS = [
  { id: 'why', label: 'Why Attend' },
  { id: 'curriculum', label: 'Curriculum' },
  { id: 'trainer', label: 'Trainer' },
  { id: 'faq', label: 'FAQ' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((link) => document.getElementById(link.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-brand-navy/95 shadow-md shadow-black/10 backdrop-blur' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <a href="#" className="group flex shrink-0 items-center gap-2.5">
          <img
            src={logoIcon}
            alt={siteContent.brand}
            className="h-8 w-auto rounded-md bg-white p-1 transition-transform duration-300 group-hover:scale-110"
          />
          <span className="label-mono hidden text-[11px] font-semibold text-white/90 md:inline">
            {siteContent.brand} <span className="text-brand-orange">· Live Workshop</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                activeId === link.id ? 'text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              {link.label}
              <span
                className={`absolute inset-x-3 -bottom-0.5 h-px bg-brand-orange transition-transform duration-300 ${
                  activeId === link.id ? 'scale-x-100' : 'scale-x-0'
                }`}
              />
            </a>
          ))}
        </nav>

        <a
          href="#register"
          className="btn-sweep shrink-0 rounded-full bg-brand-orange px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-orange-dark sm:px-5 sm:text-sm"
        >
          Reserve Seat
        </a>
      </div>
    </div>
  );
}
