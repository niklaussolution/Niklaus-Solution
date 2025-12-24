import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { WorkshopsSection } from "./components/WorkshopsSection";
import { WhyChooseSection } from "./components/WhyChooseSection";
import { TrainersSection } from "./components/TrainersSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { PricingSection } from "./components/PricingSection";
import { FreeTrialSection } from "./components/FreeTrialSection";
import { JourneySection } from "./components/JourneySection";
import { KeyFeaturesSection } from "./components/KeyFeaturesSection";
import { ScholarshipSection } from "./components/ScholarshipSection";
import { ComparisonSection } from "./components/ComparisonSection";
import { CompaniesSection } from "./components/CompaniesSection";
import { Footer } from "./components/Footer";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { ScrollToTop } from "./components/ScrollToTop";
import { VideoCarouselSection } from "./components/VideoCarouselSection";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <WorkshopsSection />
      <WhyChooseSection />
      <PricingSection />
      <FreeTrialSection />
      <JourneySection />
      <KeyFeaturesSection />
      <ScholarshipSection />
      <ComparisonSection />
      <CompaniesSection />
      <TrainersSection />
      <TestimonialsSection />
      <VideoCarouselSection />
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
}