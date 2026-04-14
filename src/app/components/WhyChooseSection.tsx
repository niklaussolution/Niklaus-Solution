import { motion } from "motion/react";
import { Users, Target, Award, Briefcase, MessageCircle } from "lucide-react";

interface WhyChooseSectionProps {
  onOpenContactForm?: () => void;
}

const features = [
  {
    icon: Users,
    title: "Industry Experts",
    description: "Learn from professionals with 10+ years of real-world experience in top tech companies",
    color: "bg-blue-100 text-blue-500",
  },
  {
    icon: Target,
    title: "Hands-on Training",
    description: "Practice with real projects, live coding sessions, and industry-standard tools",
    color: "bg-green-100 text-green-500",
  },
  {
    icon: Award,
    title: "Certificate Provided",
    description: "Receive industry-recognized certification upon successful completion of the workshop",
    color: "bg-purple-100 text-purple-500",
  },
  {
    icon: Briefcase,
    title: "Internship Opportunities",
    description: "Get access to exclusive internship programs and job placement assistance",
    color: "bg-orange-100 text-orange-500",
  },
];

export function WhyChooseSection({ onOpenContactForm }: WhyChooseSectionProps) {
  return (
    <section id="about" className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
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
            Why Choose Us
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why Choose <span className="text-orange-500">Niklaus Solutions</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Empowering Skills. Building Careers. Your success is our mission.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 md:p-8 text-center border border-gray-100"
              >
                <div className="inline-flex items-center justify-center mb-4">
                  <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center`}>
                    <Icon size={32} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">50+</div>
            <div className="text-gray-600">Workshops Conducted</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">1000+</div>
            <div className="text-gray-600">Students Trained</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">95%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">200+</div>
            <div className="text-gray-600">Industry Partners</div>
          </div>
        </motion.div>

        {/* Get in Touch Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <motion.button
            onClick={onOpenContactForm}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl font-medium"
          >
            <MessageCircle size={20} />
            Get in Touch
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
