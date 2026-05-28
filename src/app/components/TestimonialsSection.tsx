import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { Star, Quote, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { db } from '../../admin/config/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

interface TestimonialsSectionProps {
  onOpenContactForm?: () => void;
}

interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  workshop: string;
  testimonial: string;
  rating: number;
  avatar: string;
  order: number;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ onOpenContactForm }) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'testimonials'),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const data: Testimonial[] = [];
      querySnapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as Testimonial);
      });
      setTestimonials(data);
    } catch (err) {
      // Fallback to empty array if Firestore fails
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const getVisibleTestimonials = () => {
    const cardsToShow = window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3;
    const visibleTestimonials = [];
    for (let i = 0; i < cardsToShow; i++) {
      visibleTestimonials.push(testimonials[(currentIndex + i) % testimonials.length]);
    }
    return visibleTestimonials;
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
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
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

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-block mb-4 px-4 py-2 bg-orange-100 text-orange-600 rounded-full">
            Success Stories
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Journey Of Our <span className="text-orange-500">Testimonials</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the success stories of our learners who have transformed their careers through our workshops
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        {testimonials.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No testimonials available yet.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Navigation Buttons */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePrevious();
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 md:-translate-x-16 z-50 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-all"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 md:translate-x-16 z-50 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-all"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button>

            {/* Testimonials Grid with Touch Support */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence>
                {getVisibleTestimonials().map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all p-6 md:p-8 border border-gray-100 relative flex flex-col"
                  >
                    {/* Avatar at Top */}
                    <div className="flex flex-col items-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3">
                        {testimonial.avatar || testimonial.name.substring(0, 2).toUpperCase()}
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                      
                      {/* Role and Company - Differentiated */}
                      <div className="flex flex-col items-center gap-1 mt-2 text-sm">
                        {testimonial.role && (
                          <p className="text-orange-600 font-semibold">{testimonial.role}</p>
                        )}
                        {testimonial.company && (
                          <p className="text-gray-500">@ <span className="text-gray-700 font-medium">{testimonial.company}</span></p>
                        )}
                      </div>
                    </div>

                    {/* Quote Icon */}
                    <div className="absolute top-6 right-6 opacity-10">
                      <Quote size={48} className="text-orange-500" />
                    </div>

                    {/* Rating */}
                    <div className="flex gap-1 mb-4 justify-center">
                      {renderStars(testimonial.rating)}
                    </div>

                    {/* Workshop Tag */}
                    {testimonial.workshop && (
                      <div className="flex justify-center mb-4">
                        <div className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm">
                          {testimonial.workshop}
                        </div>
                      </div>
                    )}

                    {/* Testimonial */}
                    <p className="text-gray-700 flex-grow relative z-10 text-center">
                      "{testimonial.testimonial}"
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Dot Indicators */}
            {testimonials.length > 0 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDotClick(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'bg-orange-500 w-8'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
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
    </section>
  );
};
