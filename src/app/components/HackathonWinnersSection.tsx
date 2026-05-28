import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { Trophy, ChevronLeft, ChevronRight, MessageCircle, Award } from "lucide-react";
import { db } from '../../admin/config/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

interface HackathonWinnersSectionProps {
  onOpenContactForm?: () => void;
}

interface HackathonWinner {
  id: string;
  name: string;
  projectTitle: string;
  projectDescription: string;
  position: string;
  prize: string;
  imageUrl: string;
  projectLink?: string;
  hackathonName: string;
  year: number;
  isActive: boolean;
  order: number;
}

export const HackathonWinnersSection: React.FC<HackathonWinnersSectionProps> = ({ onOpenContactForm }) => {
  const [winners, setWinners] = useState<HackathonWinner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    fetchWinners();
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchWinners = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'hackathonWinners'),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const data: HackathonWinner[] = [];
      querySnapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as HackathonWinner);
      });
      setWinners(data);
    } catch (err) {
      console.error('Error fetching hackathon winners:', err);
      setWinners([]);
    } finally {
      setLoading(false);
    }
  };

  const cardsToShow = Math.min(windowWidth < 640 ? 1 : windowWidth < 1024 ? 2 : 3, winners.length);

  const getVisibleWinners = () => {
    const visibleWinners = [];
    for (let i = 0; i < cardsToShow; i++) {
      const index = (currentIndex + i) % winners.length;
      // Only add unique winners - don't duplicate if fewer winners than cards
      if (winners.length > 1 || i === 0) {
        visibleWinners.push(winners[index]);
      }
    }
    return visibleWinners;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
  };

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + winners.length) % winners.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % winners.length);
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const getPositionColor = (position: string) => {
    switch(position.toLowerCase()) {
      case '1st':
      case 'first':
        return 'from-yellow-400 to-yellow-500';
      case '2nd':
      case 'second':
        return 'from-gray-300 to-gray-400';
      case '3rd':
      case 'third':
        return 'from-orange-400 to-orange-500';
      default:
        return 'from-blue-400 to-blue-500';
    }
  };

  if (loading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!winners.length) {
    return null;
  }

  const visibleWinners = getVisibleWinners();

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-600 rounded-full">
            <Trophy size={18} />
            <span className="font-semibold">Hackathon Champions</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Meet Our <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Hackathon Winners</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Celebrating the innovators and creators who've pushed the boundaries of technology through our hackathon competitions
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <AnimatePresence mode="wait">
              {visibleWinners.map((winner, index) => (
                <motion.div
                  key={`${winner.id}-${index}`}
                  initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                  transition={{ duration: 0.5 }}
                  className="h-full"
                >
                  <div className="group relative h-full bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col">
                    {/* Image Container */}
                    <div className="relative h-64 sm:h-72 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      {winner.imageUrl ? (
                        <img
                          src={winner.imageUrl}
                          alt={winner.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Award size={48} className="text-gray-300" />
                        </div>
                      )}

                      {/* Position Badge */}
                      <div className={`absolute top-4 right-4 bg-gradient-to-r ${getPositionColor(winner.position)} px-4 py-2 rounded-full shadow-lg transform`}>
                        <div className="flex items-center gap-1">
                          <Trophy size={18} className="text-white drop-shadow" />
                          <span className="text-white font-bold text-sm drop-shadow">{winner.position}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Container */}
                    <div className="flex-1 flex flex-col p-6 sm:p-8">
                      {/* Winner Info */}
                      <div className="mb-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                          {winner.name}
                        </h3>
                        <p className="text-sm text-orange-600 font-semibold">
                          {winner.hackathonName} {winner.year}
                        </p>
                      </div>

                      {/* Project Info */}
                      <div className="mb-4 flex-1">
                        <p className="text-sm sm:text-base font-semibold text-gray-800 mb-2">
                          {winner.projectTitle}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {winner.projectDescription}
                        </p>
                      </div>

                      {/* Prize Info */}
                      {winner.prize && (
                        <div className="mb-4 pb-4 border-b border-gray-200">
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Prize</p>
                          <p className="text-lg font-bold text-orange-600">
                            {winner.prize}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        {winner.projectLink && (
                          <a
                            href={winner.projectLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all text-sm font-semibold text-center"
                          >
                            View Project
                          </a>
                        )}
                        {onOpenContactForm && (
                          <button
                            onClick={onOpenContactForm}
                            className="flex-1 py-2 px-4 border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                          >
                            <MessageCircle size={16} />
                            <span className="hidden sm:inline">Connect</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          {winners.length > cardsToShow && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-10 bg-white text-orange-600 p-2 sm:p-3 rounded-full shadow-lg hover:bg-orange-600 hover:text-white transition-all duration-300 hover:scale-110"
                aria-label="Previous winners"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={handleNext}
                className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-10 bg-white text-orange-600 p-2 sm:p-3 rounded-full shadow-lg hover:bg-orange-600 hover:text-white transition-all duration-300 hover:scale-110"
                aria-label="Next winners"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        {/* Dots Navigation */}
        {winners.length > cardsToShow && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center gap-2 mt-12"
          >
            {Array.from({ length: Math.ceil(winners.length / cardsToShow) }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index * cardsToShow)}
                className={`transition-all duration-300 rounded-full ${
                  Math.floor(currentIndex / cardsToShow) === index
                    ? 'bg-orange-600 w-8 h-3'
                    : 'bg-gray-300 w-3 h-3 hover:bg-gray-400'
                }`}
                aria-label={`Go to winners group ${index + 1}`}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};
