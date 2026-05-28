import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, AlertCircle, MessageCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { db } from "../../admin/config/firebase";
import { doc, getDoc } from "firebase/firestore";

interface CompaniesSectionProps {
  onOpenContactForm?: () => void;
}

interface Company {
  id: string;
  name: string;
  logoUrl?: string;
}

interface CompaniesContent {
  heading: string;
  subheading: string;
  motivationalText: string;
  companies: Company[];
  updatedAt?: number;
}

export function CompaniesSection({ onOpenContactForm }: CompaniesSectionProps) {
  const [content, setContent] = useState<CompaniesContent | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const contentRef = doc(db, 'content', 'companies');
        const docSnap = await getDoc(contentRef);
        
        if (docSnap.exists()) {
          setContent(docSnap.data() as CompaniesContent);
        } else {
          setError('Companies content not found');
        }
      } catch (err) {
        setError('Failed to load companies');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const companies = content?.companies || [];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swiped left, go to next
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % companies.length);
      } else {
        // Swiped right, go to previous
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + companies.length) % companies.length);
      }
    }
  };

  const getVisibleCompanies = () => {
    if (companies.length === 0) return [];
    const visible = [];
    // Show 1 card on mobile, 2 cards on tablet, 4 cards on desktop
    const cardsToShow = window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 4;
    for (let i = 0; i < Math.min(cardsToShow, companies.length); i++) {
      const index = (currentIndex + i) % companies.length;
      visible.push(companies[index]);
    }
    return visible;
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + companies.length) % companies.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % companies.length);
  };

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  return (
    <section id="companies" className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {content?.heading || "Our Learners Work At"}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {content?.subheading || "Join thousands of successful learners now working at leading companies worldwide"}
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent"></div>
              Loading companies...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && companies.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600">No companies available at the moment.</p>
          </div>
        )}

        {/* Companies Carousel */}
        {!loading && companies.length > 0 && (
        <div className="relative">
          {/* Companies Grid */}
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence>
              {getVisibleCompanies().map((company, index) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="h-32 md:h-40 bg-white rounded-2xl border-2 border-teal-200 hover:border-orange-500 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center p-6 cursor-pointer hover:bg-gradient-to-br hover:from-blue-50 hover:to-teal-50 hover:scale-105">
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={company.name}
                        className="max-w-full max-h-24 object-contain transition-all duration-300 filter group-hover:drop-shadow-md"
                        title={company.name}
                      />
                    ) : (
                      <span className="text-gray-700 font-semibold text-center">{company.name}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 md:mt-12">
            <button
              type="button"
              onClick={handlePrevious}
              className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 hover:bg-orange-500 text-gray-700 hover:text-white transition-all shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
              aria-label="Previous company"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Dots Indicator */}
            <div className="flex items-center gap-2 mx-auto">
              {companies.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => handleDotClick(index, e)}
                  className={`transition-all ${
                    index === currentIndex
                      ? "w-8 h-3 bg-gray-900"
                      : "w-3 h-3 bg-gray-300 hover:bg-gray-400 hover:scale-110 active:scale-95"
                  } rounded-full`}
                  aria-label={`Go to company ${index + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 hover:bg-orange-500 text-gray-700 hover:text-white transition-all shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
              aria-label="Next company"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
        )}

        {/* Bottom CTA */}
        {!loading && companies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12 sm:mt-16"
        >
          <div className="inline-block bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full px-6 py-3 mb-6">
            <p className="text-orange-700 font-semibold text-xs sm:text-sm">
              {content?.motivationalText || "🚀 Be part of this success story Start Your Journey Today"}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenContactForm}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base hover:scale-105 active:scale-95"
          >
            <MessageCircle size={18} />
            Get in Touch
          </button>
        </motion.div>
        )}
      </div>
    </section>
  );
}
