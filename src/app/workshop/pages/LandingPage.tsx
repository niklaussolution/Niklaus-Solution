import { useEffect } from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import TrustBadges from '../components/landing/TrustBadges';
import WhyAttend from '../components/landing/WhyAttend';
import WhatYouLearn from '../components/landing/WhatYouLearn';
import WorkshopHighlights from '../components/landing/WorkshopHighlights';
import MeetTrainer from '../components/landing/MeetTrainer';
import Testimonials from '../components/landing/Testimonials';
import RealReviews from '../components/landing/RealReviews';
import VideoReviews from '../components/landing/VideoReviews';
import Bonuses from '../components/landing/Bonuses';
import WorkshopDetails from '../components/landing/WorkshopDetails';
import FAQs from '../components/landing/FAQs';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';
import MobileStickyCta from '../components/landing/MobileStickyCta';
import ScrollProgressBar from '../components/shared/ScrollProgressBar';
import BackToTop from '../components/shared/BackToTop';
import { captureLeadSource } from '../lib/utm';
import { initAdPixels } from '../lib/analytics';

export default function LandingPage() {
  useEffect(() => {
    captureLeadSource();
    initAdPixels();
  }, []);

  return (
    <div className="workshop-page min-h-screen bg-white">
      <ScrollProgressBar />
      <Navbar />
      <Hero />
      <TrustBadges />
      <WhyAttend />
      <WhatYouLearn />
      <WorkshopHighlights />
      <MeetTrainer />
      <Testimonials />
      <RealReviews />
      <VideoReviews />
      <Bonuses />
      <WorkshopDetails />
      <FAQs />
      <FinalCTA />
      <Footer />
      <MobileStickyCta />
      <BackToTop />
    </div>
  );
}
