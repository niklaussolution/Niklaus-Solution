import { Link } from 'react-router-dom';
import { Mail, MessageSquareHeart } from 'lucide-react';
import logo from '../../assets/logo.png';
import { siteContent } from '../../content/siteContent';

export default function Footer() {
  const { brand, footer } = siteContent;
  return (
    <footer className="border-t border-white/10 bg-brand-navy py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          <div className="text-center sm:text-left">
            <img src={logo} alt={brand} className="mx-auto h-16 w-16 rounded-2xl bg-white p-2 sm:mx-0" />
            <p className="mt-3 text-sm text-white/50">{footer.tagline}</p>
          </div>

          <div className="text-center">
            <p className="label-mono text-xs font-semibold text-white/40">Quick Links</p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <a href="#why" className="text-white/70 hover:text-white">Why Attend</a>
              <a href="#curriculum" className="text-white/70 hover:text-white">Curriculum</a>
              <a href="#trainer" className="text-white/70 hover:text-white">Trainer</a>
              <a href="#faq" className="text-white/70 hover:text-white">FAQ</a>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <p className="label-mono text-xs font-semibold text-white/40">Get In Touch</p>
            <div className="mt-3 flex flex-col items-center gap-2 text-sm sm:items-end">
              <a
                href={`mailto:${footer.contactEmail}`}
                className="flex items-center gap-1.5 text-white/70 hover:text-brand-orange"
              >
                <Mail className="h-4 w-4" /> {footer.contactEmail}
              </a>
              <Link
                to="/workshop/review"
                className="flex items-center gap-1.5 text-white/70 hover:text-brand-orange"
              >
                <MessageSquareHeart className="h-4 w-4" /> Attended? Leave a Review
              </Link>
            </div>
          </div>
        </div>

        <div className="label-mono mt-10 flex items-center justify-center border-t border-white/10 pt-6 text-[11px] text-white/30">
          <span>&copy; {new Date().getFullYear()} {brand}. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
