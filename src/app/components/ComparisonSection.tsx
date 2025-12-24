import { motion } from "motion/react";
import { Check, X, Zap } from "lucide-react";

interface ComparisonFeature {
  title: string;
  niklaus: boolean;
  free: boolean;
  others: boolean;
}

const features: ComparisonFeature[] = [
  {
    title: "Job Oriented Syllabus + Career Guidance",
    niklaus: true,
    free: false,
    others: false,
  },
  {
    title: "Faster 1:1 Call & Chat Support",
    niklaus: true,
    free: false,
    others: false,
  },
  {
    title: "Lifetime Access + Updates",
    niklaus: true,
    free: false,
    others: false,
  },
  {
    title: "Guaranteed Internship",
    niklaus: true,
    free: false,
    others: false,
  },
  {
    title: "Physical Certificate",
    niklaus: true,
    free: false,
    others: false,
  },
  {
    title: "Hackathons & Competitions",
    niklaus: true,
    free: false,
    others: false,
  },
  {
    title: "Industry Mentorship",
    niklaus: true,
    free: false,
    others: false,
  },
];

export function ComparisonSection() {
  return (
    <section id="comparison" className="relative py-16 md:py-24 bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why Are We The Best
          </h2>
          <p className="text-lg text-blue-200">
            See how Niklaus stands out from the competition
          </p>
        </motion.div>


        {/* Comparison Header - Always on Top */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 px-2 md:px-6">
          <div className="col-span-1 md:col-span-2"></div>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">
              <span className="text-sm">⭐ NIKLAUS</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-slate-400 font-semibold">Others</p>
          </div>
        </div>

        {/* Comparison Features Grid */}
        <div className="space-y-4 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 border border-slate-700 hover:border-blue-500 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  {/* Feature Title */}
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-white font-semibold group-hover:text-blue-300 transition-colors">
                      {feature.title}
                    </p>
                  </div>

                  {/* Niklaus */}
                  <div className="flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        feature.niklaus
                          ? "bg-green-500/20 border border-green-500"
                          : "bg-red-500/20 border border-red-500"
                      }`}
                    >
                      {feature.niklaus ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <X className="w-5 h-5 text-red-400" />
                      )}
                    </motion.div>
                  </div>

                  {/* Others */}
                  <div className="flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        feature.others
                          ? "bg-green-500/20 border border-green-500"
                          : "bg-red-500/20 border border-red-500"
                      }`}
                    >
                      {feature.others ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <X className="w-5 h-5 text-red-400" />
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Superiority Bars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-slate-700"
        >
          <div className="space-y-8">
            {/* Niklaus Bar */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-bold flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                    ⭐
                  </span>
                  NIKLAUS
                </h4>
                <span className="text-green-400 font-semibold">100% Features</span>
              </div>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.6 }}
                viewport={{ once: true }}
                className="h-3 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-lg shadow-blue-500/50"
              ></motion.div>
            </div>

            {/* Others Bar */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-slate-300 font-bold">Others</h4>
                <span className="text-slate-400 font-semibold">Average role, under-confident</span>
              </div>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "60%" }}
                transition={{ duration: 1, delay: 0.8 }}
                viewport={{ once: true }}
                className="h-3 bg-gradient-to-r from-slate-600 to-slate-500 rounded-full"
              ></motion.div>
            </div>
          </div>
        </motion.div>

        {/* Tagline & CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center space-y-6"
        >
          <div className="flex items-center justify-center gap-3">
            <p className="text-xl md:text-2xl text-white font-semibold">
              Your dream role, faster and with confidence!
            </p>
            <Zap className="w-7 h-7 text-yellow-400 animate-pulse" />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            Explore Offerings
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
