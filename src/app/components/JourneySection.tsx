import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Learner {
  id: number;
  name: string;
  image: string;
  company: string;
  companyLogo: string;
  role: string;
}

const learners: Learner[] = [
  {
    id: 1,
    name: "Pavinath E",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    company: "Maya Technologies",
    companyLogo: "https://images.unsplash.com/photo-1599927568826-e91a7ce58220?w=100&h=50&fit=crop",
    role: "Network And Security Engineer",
  },
  {
    id: 2,
    name: "Ashwin Kumar S",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    company: "Alcoa AI",
    companyLogo: "https://images.unsplash.com/photo-1599927568826-e91a7ce58220?w=100&h=50&fit=crop",
    role: "Android App Pentester",
  },
  {
    id: 3,
    name: "Prakash Kumar M",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    company: "Hobsy",
    companyLogo: "https://images.unsplash.com/photo-1599927568826-e91a7ce58220?w=100&h=50&fit=crop",
    role: "Flutter Developer",
  },
  {
    id: 4,
    name: "Raj Kumar",
    image: "https://images.unsplash.com/photo-1519085360771-9852ef158dba?w=400&h=400&fit=crop",
    company: "Tech Innovations",
    companyLogo: "https://images.unsplash.com/photo-1599927568826-e91a7ce58220?w=100&h=50&fit=crop",
    role: "Full Stack Developer",
  },
  {
    id: 5,
    name: "Sneha Sharma",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    company: "Design Studios",
    companyLogo: "https://images.unsplash.com/photo-1599927568826-e91a7ce58220?w=100&h=50&fit=crop",
    role: "UI/UX Designer",
  },
];

export function JourneySection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const next = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % learners.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + learners.length) % learners.length);
  };

  const getVisibleLearners = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % learners.length;
      visible.push(learners[index]);
    }
    return visible;
  };

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {getVisibleLearners().map((learner, index) => (
              <motion.div
                key={learner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden bg-gray-200">
                    <img
                      src={learner.image}
                      alt={learner.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {learner.name}
                    </h3>

                    {/* Company Logo */}
                    <div className="mb-4 h-8 flex items-center">
                      {learner.companyLogo && (
                        <img
                          src={learner.companyLogo}
                          alt={learner.company}
                          className="h-full object-contain"
                        />
                      )}
                      {!learner.companyLogo && (
                        <span className="text-sm font-semibold text-gray-600">
                          {learner.company}
                        </span>
                      )}
                    </div>

                    {/* After Nativeva Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-teal-500"></span>
                        <span className="inline-block w-2 h-2 rounded-full bg-teal-300"></span>
                      </div>
                      <span className="text-sm text-gray-600">After Niklaus</span>
                    </div>

                    {/* Role */}
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-teal-500"></span>
                        <span className="inline-block w-2 h-2 rounded-full bg-teal-300"></span>
                      </div>
                      <p className="text-sm font-semibold text-gray-700">
                        {learner.role}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-12">
            <button
              onClick={prev}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 hover:bg-orange-500 text-gray-700 hover:text-white transition-all shadow-md hover:shadow-lg group"
              aria-label="Previous learner"
            >
              <ChevronLeft size={24} className="group-hover:scale-110 transition-transform" />
            </button>

            {/* Dots Indicator */}
            <div className="flex items-center gap-2">
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
              onClick={next}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 hover:bg-orange-500 text-gray-700 hover:text-white transition-all shadow-md hover:shadow-lg group"
              aria-label="Next learner"
            >
              <ChevronRight size={24} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
