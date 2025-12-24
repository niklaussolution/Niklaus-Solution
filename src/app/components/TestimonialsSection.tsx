import React, { useState, useEffect } from 'react';
import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";
import { db } from '../../admin/config/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

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

export const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

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
      console.error('Error fetching testimonials:', err);
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

        {/* Testimonials Grid */}
        {testimonials.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No testimonials available yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 md:p-8 border border-gray-100 relative flex flex-col"
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
          </div>
        )}
      </div>
    </section>
  );
};
