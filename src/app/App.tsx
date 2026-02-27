import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { WorkshopsSection } from "./components/WorkshopsSection";
import { WhyChooseSection } from "./components/WhyChooseSection";
import { TrainersSection } from "./components/TrainersSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { PricingSection } from "./components/PricingSection";
import { StudentProjectsSection } from "./components/StudentProjectsSection";
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
import { CertificateDownload } from "./pages/CertificateDownload";
import { ContactFormPopup } from "./components/ContactFormPopup";
import { useEffect } from "react";

export default function App() {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [hasShownPopupOnce, setHasShownPopupOnce] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Get the workshops section
      const workshopsSection = document.getElementById("workshops");
      
      if (workshopsSection && !hasShownPopupOnce) {
        const workshopsPosition = workshopsSection.getBoundingClientRect().top;
        
        // When user scrolls to within 100px above the workshops section
        if (workshopsPosition < 100 && workshopsPosition > 0) {
          setIsContactFormOpen(true);
          setHasShownPopupOnce(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasShownPopupOnce]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <WorkshopsSection />
      <WhyChooseSection onOpenContactForm={() => setIsContactFormOpen(true)} />
      <PricingSection onOpenContactForm={() => setIsContactFormOpen(true)} />
      <StudentProjectsSection onOpenContactForm={() => setIsContactFormOpen(true)} />
      <FreeTrialSection onOpenContactForm={() => setIsContactFormOpen(true)} />
      <JourneySection onOpenContactForm={() => setIsContactFormOpen(true)} />
      <KeyFeaturesSection onOpenContactForm={() => setIsContactFormOpen(true)} />
      <ScholarshipSection onOpenContactForm={() => setIsContactFormOpen(true)} />
      <ComparisonSection onOpenContactForm={() => setIsContactFormOpen(true)} />
      <CompaniesSection onOpenContactForm={() => setIsContactFormOpen(true)} />
      <TrainersSection onOpenContactForm={() => setIsContactFormOpen(true)} />
      <TestimonialsSection onOpenContactForm={() => setIsContactFormOpen(true)} />
      <VideoCarouselSection onOpenContactForm={() => setIsContactFormOpen(true)} />

      {/* Certificates Section */}
      <CertificateDownload />

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />

      {/* Global Contact Form Popup */}
      <ContactFormPopup 
        isOpen={isContactFormOpen} 
        onClose={() => setIsContactFormOpen(false)} 
      />
    </div>
  );
}