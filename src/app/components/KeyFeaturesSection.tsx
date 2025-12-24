import { motion } from "motion/react";
import {
  Users,
  Briefcase,
  Award,
  BookOpen,
  Zap,
  Target,
  Lightbulb,
  CheckCircle,
} from "lucide-react";

interface Feature {
  id: number;
  title: string;
  icon: React.ReactNode;
  description?: string;
}

const features: Feature[] = [
  {
    id: 1,
    title: "Industry Expert",
    icon: <Users className="w-8 h-8 text-blue-600" />,
  },
  {
    id: 2,
    title: "Guaranteed Internship",
    icon: <Briefcase className="w-8 h-8 text-blue-600" />,
  },
  {
    id: 3,
    title: "Job Placement Assistance",
    icon: <Target className="w-8 h-8 text-blue-600" />,
  },
  {
    id: 4,
    title: "Resume Building",
    icon: <Award className="w-8 h-8 text-blue-600" />,
  },
  {
    id: 5,
    title: "Career Guidance",
    icon: <Lightbulb className="w-8 h-8 text-blue-600" />,
  },
  {
    id: 6,
    title: "Hackathons & Events",
    icon: <Zap className="w-8 h-8 text-blue-600" />,
  },
  {
    id: 7,
    title: "Lifetime Access",
    icon: <BookOpen className="w-8 h-8 text-blue-600" />,
  },
  {
    id: 8,
    title: "Certification",
    icon: <CheckCircle className="w-8 h-8 text-blue-600" />,
  },
];

export function KeyFeaturesSection() {
  return (
    <section id="features" className="relative py-16 md:py-24 bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Key Features Of Nikclaus
          </h2>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            Elevate Your Career with Guidance from Top Industry Mentors
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white rounded-3xl px-6 md:px-8 py-6 md:py-7 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer border border-white/80 hover:border-orange-500/50">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 p-3 bg-blue-50 rounded-2xl group-hover:bg-orange-50 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {feature.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <button className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 md:px-10 py-3 md:py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold text-sm md:text-base">
            Explore All Features
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
