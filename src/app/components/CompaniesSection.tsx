import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";

interface Company {
  id: number;
  name: string;
  logo: string;
}

const companies: Company[] = [
  {
    id: 1,
    name: "TCS",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Tata_Consultancy_Services_Logo.svg/1200px-Tata_Consultancy_Services_Logo.svg.png",
  },
  {
    id: 2,
    name: "Zoho",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Zoho_logo.svg/1200px-Zoho_logo.svg.png",
  },
  {
    id: 3,
    name: "Instamojo",
    logo: "https://upload.wikimedia.org/wikipedia/en/3/30/Instamojo_logo.png",
  },
  {
    id: 4,
    name: "Amazon",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png",
  },
  {
    id: 5,
    name: "PayPal",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Paypal_2014_logo.png/1200px-Paypal_2014_logo.png",
  },
  {
    id: 6,
    name: "Wipro",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Wipro_Logo.svg/1200px-Wipro_Logo.svg.png",
  },
  {
    id: 7,
    name: "Oracle",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Oracle_logo.svg/1200px-Oracle_logo.svg.png",
  },
  {
    id: 8,
    name: "Flipkart",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Flipkart_logo.svg/1200px-Flipkart_logo.svg.png",
  },
  {
    id: 9,
    name: "Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/1200px-Microsoft_logo_%282012%29.svg.png",
  },
  {
    id: 10,
    name: "Capgemini",
    logo: "https://upload.wikimedia.org/wikipedia/en/c/c1/Capgemini_logo.png",
  },
  {
    id: 11,
    name: "Lenovo",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Lenovo_logo_2015.svg/1200px-Lenovo_logo_2015.svg.png",
  },
  {
    id: 12,
    name: "Paytm",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/Paytm_logo.svg/1200px-Paytm_logo.svg.png",
  },
];

export function CompaniesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

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
            Our Learners Work At
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of successful learners now working at leading companies worldwide
          </p>
        </motion.div>

        {/* Companies Carousel */}
        <div className="relative">
          {/* Companies Grid */}
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait">
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
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="max-w-full max-h-24 object-contain grayscale group-hover:grayscale-0 transition-all duration-300 filter group-hover:drop-shadow-md"
                      title={company.name}
                    />
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

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12 sm:mt-16"
        >
          <div className="inline-block bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full px-6 py-3 mb-6">
            <p className="text-orange-700 font-semibold text-xs sm:text-sm">
              🚀 Be part of this success story
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base hover:scale-105 active:scale-95"
          >
            Start Your Journey Today
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
