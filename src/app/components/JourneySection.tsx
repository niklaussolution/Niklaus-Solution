import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../../src/admin/config/firebase";

interface JourneySectionProps {
  onOpenContactForm?: () => void;
}

interface Learner {
  id: string;
  name: string;
  photo?: string;
  company: string;
  position: string;
  workshopName?: string;
  isActive: boolean;
  order: number;
}

export function JourneySection({ onOpenContactForm }: JourneySectionProps) {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    fetchLearners();
  }, []);

  const fetchLearners = async () => {
    try {
      const journeysRef = collection(db, "journeys");
      const q = query(journeysRef, where("isActive", "==", true), orderBy("order"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Learner));
      setLearners(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getVisibleLearners = () => {
    if (learners.length === 0) return [];
    const visible = [];
    // Show 1 card on mobile, 3 cards on desktop
    const cardsToShow = window.innerWidth < 768 ? 1 : 3;
    for (let i = 0; i < Math.min(cardsToShow, learners.length); i++) {
      const index = (currentIndex + i) % learners.length;
      visible.push(learners[index]);
    }
    return visible;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
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
        setCurrentIndex((prev) => (prev + 1) % learners.length);
      } else {
        // Swiped right, go to previous
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + learners.length) % learners.length);
      }
    }
  };

  if (loading) {
    return (
      <section id="journey" className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </section>
    );
  }

  if (learners.length === 0) {
    return null;
  }

  return (
    <section id="journey" className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
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
            Journey Of Our Learners
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the success stories of our learners who have transformed their careers through our workshops
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          {/* Learners Cards */}
          <div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence>
              {getVisibleLearners().map((learner, index) => (
                <motion.div
                  key={learner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden bg-gray-200">
                    {learner.photo ? (
                      <img
                        src={learner.photo}
                        alt={learner.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600">
                        <span className="text-5xl font-bold text-white">
                          {learner.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {learner.name}
                    </h3>

                    {/* Company */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-600">
                        {learner.company}
                      </p>
                    </div>

                    {/* After Workshop Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-teal-500"></span>
                        <span className="inline-block w-2 h-2 rounded-full bg-teal-300"></span>
                      </div>
                      <span className="text-sm text-gray-600">
                        After {learner.workshopName || "Workshop"}
                      </span>
                    </div>

                    {/* Position */}
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-teal-500"></span>
                        <span className="inline-block w-2 h-2 rounded-full bg-teal-300"></span>
                      </div>
                      <p className="text-sm font-semibold text-gray-700">
                        {learner.position}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 md:mt-12">
            <button
              onClick={() => {
                setDirection(-1);
                setCurrentIndex((prev) => (prev - 1 + learners.length) % learners.length);
              }}
              className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 hover:bg-orange-500 text-gray-700 hover:text-white transition-all shadow-md hover:shadow-lg group"
              aria-label="Previous learner"
            >
              <ChevronLeft size={24} className="group-hover:scale-110 transition-transform" />
            </button>

            {/* Dots Indicator */}
            <div className="flex items-center gap-2 mx-auto">
              {learners.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={`transition-all ${
                    index === currentIndex
                      ? "w-8 h-3 bg-gray-900"
                      : "w-3 h-3 bg-gray-300 hover:bg-gray-400"
                  } rounded-full`}
                  aria-label={`Go to learner ${index + 1}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                />
              ))}
            </div>

            <button
              onClick={() => {
                setDirection(1);
                setCurrentIndex((prev) => (prev + 1) % learners.length);
              }}
              className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 hover:bg-orange-500 text-gray-700 hover:text-white transition-all shadow-md hover:shadow-lg group"
              aria-label="Next learner"
            >
              <ChevronRight size={24} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Get in Touch Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-12"
        >
          <motion.button
            onClick={onOpenContactForm}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl font-medium"
          >
            <MessageCircle size={20} />
            Get in Touch
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
