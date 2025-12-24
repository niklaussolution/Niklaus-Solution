import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

interface CourseCard {
  title: string;
  code: string;
  description: string;
}

const courses: CourseCard[] = [
  { title: "CEH", code: "Certified Ethical Hacker", description: "" },
  { title: "BBH", code: "Bug Bounty Hunting", description: "" },
  { title: "FSWD", code: "Full Stack Web Development", description: "" },
  { title: "UI/UX", code: "UI/UX Designing", description: "" },
  { title: "GenAI", code: "Generative AI", description: "" },
  { title: "WD", code: "WordPress Development", description: "" },
];

export function FreeTrialSection() {
  return (
    <section id="free-trial" className="relative py-16 md:py-24 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Introducing Niklaus <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Free Trial For Courses
              </span>
            </h2>

            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl leading-relaxed">
              Niklaus Free Trial is now live! Enjoy absolutely no fees during the trial period, with zero limits, zero barriers, and 100% full access. Stop waiting—start your free trial today!
            </p>

            <button className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold">
              Get Free Trial Courses
              <ArrowRight size={20} />
            </button>
          </motion.div>

          {/* Right Content - Free Trial Badge & Courses Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Free Trial Badge */}
            <div className="relative h-40 mb-8 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-20"
              >
                <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-full"></div>
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative">
                  {/* Orange ribbon banner */}
                  <div className="absolute -top-4 -right-12 w-48 h-20 bg-orange-500 transform -rotate-12 flex items-center justify-center shadow-xl">
                    <span className="text-3xl font-black text-white tracking-wider">FREE</span>
                  </div>

                  {/* Teal box with TRIAL */}
                  <div className="relative bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg p-8 shadow-2xl border border-teal-500/50">
                    <div className="text-center">
                      <p className="text-white text-4xl font-black tracking-wider">TRIAL</p>
                    </div>

                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/30"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/30"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/30"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/30"></div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {courses.map((course, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="bg-white rounded-lg p-4 md:p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105 cursor-pointer border border-gray-100 hover:border-orange-500">
                    <div className="text-center">
                      <p className="text-lg md:text-2xl font-bold text-orange-500 mb-2">
                        {course.title}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600 font-medium">
                        {course.code}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
