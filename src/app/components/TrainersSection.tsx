import { motion, AnimatePresence } from "motion/react";
import { Linkedin, Github, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "../../admin/config/firebase";

interface Trainer {
  id: string;
  name: string;
  specialty: string;
  photo: string;
  experience: string;
  bio: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
  };
  isActive: boolean;
  order: number;
}

export function TrainersSection() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const trainersRef = collection(db, "trainers");
        const q = query(
          trainersRef,
          where("isActive", "==", true),
          orderBy("order")
        );
        const querySnapshot = await getDocs(q);
        const trainersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Trainer),
        }));
        setTrainers(trainersData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  const getVisibleTrainers = () => {
    if (trainers.length === 0) return [];
    const visible = [];
    // Show 1 card on mobile, 2 cards on tablet, 3 cards on desktop
    const cardsToShow = window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3;
    for (let i = 0; i < Math.min(cardsToShow, trainers.length); i++) {
      const index = (currentIndex + i) % trainers.length;
      visible.push(trainers[index]);
    }
    return visible;
  };

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
        setCurrentIndex((prev) => (prev + 1) % trainers.length);
      } else {
        // Swiped right, go to previous
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + trainers.length) % trainers.length);
      }
    }
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + trainers.length) % trainers.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % trainers.length);
  };

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4 px-4 py-2 bg-orange-100 text-orange-600 rounded-full">
            Our Mentors
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Meet Our Expert <span className="text-orange-500">Trainers</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn from industry veterans with decades of combined experience
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        )}

        {/* Trainers Carousel */}
        {!loading && trainers.length > 0 && (
          <div className="relative">
            {/* Trainers Grid */}
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence>
                {getVisibleTrainers().map((trainer, index) => (
                  <motion.div
                    key={trainer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-gray-100 group hover:scale-105"
                  >
                    <div className="relative overflow-hidden">
                      <ImageWithFallback
                        src={trainer.photo}
                        alt={trainer.name}
                        className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {trainer.name}
                      </h3>
                      <p className="text-orange-500 font-medium mb-2">
                        {trainer.specialty}
                      </p>
                      <p className="text-gray-600 text-sm mb-4">
                        {trainer.experience}
                      </p>

                      <div className="flex gap-3">
                        {trainer.socialLinks?.linkedin && (
                          <a
                            href={trainer.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                          >
                            <Linkedin size={18} />
                          </a>
                        )}
                        {trainer.socialLinks?.github && (
                          <a
                            href={trainer.socialLinks.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                          >
                            <Github size={18} />
                          </a>
                        )}
                        {trainer.socialLinks?.portfolio && (
                          <a
                            href={trainer.socialLinks.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
                          >
                            <Globe size={18} />
                          </a>
                        )}
                      </div>
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
                aria-label="Previous trainer"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Dots Indicator */}
              <div className="flex items-center gap-2 mx-auto">
                {trainers.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={(e) => handleDotClick(index, e)}
                    className={`transition-all ${
                      index === currentIndex
                        ? "w-8 h-3 bg-gray-900"
                        : "w-3 h-3 bg-gray-300 hover:bg-gray-400 hover:scale-110 active:scale-95"
                    } rounded-full`}
                    aria-label={`Go to trainer ${index + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 hover:bg-orange-500 text-gray-700 hover:text-white transition-all shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
                aria-label="Next trainer"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && trainers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No trainers available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}