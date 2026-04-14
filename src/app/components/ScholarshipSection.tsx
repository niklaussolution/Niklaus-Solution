import { motion } from "motion/react";
import { Award, BookOpen, MessageCircle } from "lucide-react";

interface ScholarshipSectionProps {
  onOpenContactForm?: () => void;
}

export function ScholarshipSection({ onOpenContactForm }: ScholarshipSectionProps) {
  return (
    <section id="scholarship" className="relative py-16 md:py-24 bg-gradient-to-r from-blue-50 to-indigo-50 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative h-96 flex items-center justify-center">
              {/* Decorative background shape */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl blur-2xl opacity-40"></div>

              {/* Main illustration container */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative z-10"
              >
                <div className="relative w-64 h-80">
                  {/* Laptop background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl shadow-2xl transform -rotate-12"></div>

                  {/* Character container */}
                  <div className="absolute inset-0 bg-white rounded-2xl shadow-2xl transform rotate-3 flex flex-col items-center justify-center p-8">
                    {/* Graduation cap */}
                    <motion.div
                      animate={{ rotate: [0, 5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="mb-6"
                    >
                      <div className="relative w-20 h-20">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full"></div>
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-24 h-3 bg-gray-800"></div>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-red-500"></div>
                      </div>
                    </motion.div>

                    {/* Character face */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-20 bg-orange-300 rounded-2xl relative mb-2">
                        {/* Eyes */}
                        <div className="absolute top-6 left-4 flex gap-2">
                          <div className="w-1.5 h-2 bg-black rounded-full"></div>
                          <div className="w-1.5 h-2 bg-black rounded-full"></div>
                        </div>
                        {/* Smile */}
                        <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
                          <svg className="w-4 h-2" viewBox="0 0 20 10" fill="none">
                            <path d="M 2 5 Q 10 8 18 5" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                      </div>
                      {/* Badge/Logo */}
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold mt-4">
                        NIKLAUS
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="space-y-6">
              {/* Label */}
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
                <Award size={18} />
                <span className="font-semibold text-sm">Special Program</span>
              </div>

              {/* Main heading */}
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Introducing Niklaus{" "}
                <span className="text-blue-600 block mt-2">Scholarship</span>
              </h2>

              {/* Description */}
              <p className="text-lg text-gray-700 leading-relaxed">
                Unlock Your Potential: Apply for a Niklaus Scholarship to Overcome Financial Barriers. Gain access to expert-led courses, dedicated support, and valuable certifications. Start your learning journey with us today!
              </p>

              {/* Features list */}
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center h-6 w-6 rounded-md bg-orange-500 text-white">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-gray-700 font-medium">100% Expert-Led Courses</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center h-6 w-6 rounded-md bg-orange-500 text-white">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-gray-700 font-medium">Dedicated Support & Mentoring</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center h-6 w-6 rounded-md bg-orange-500 text-white">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-gray-700 font-medium">Industry Recognized Certifications</span>
                </div>
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold mt-4"
              >
                <BookOpen size={20} />
                Apply Scholarship
              </motion.button>

              {/* Get in Touch Button */}
              <motion.button
                onClick={onOpenContactForm}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl font-semibold mt-4 ml-4"
              >
                <MessageCircle size={20} />
                Get in Touch
              </motion.button>

              {/* Additional info */}
              <p className="text-sm text-gray-600 pt-4">
                Limited scholarships available. Apply now and transform your career!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
