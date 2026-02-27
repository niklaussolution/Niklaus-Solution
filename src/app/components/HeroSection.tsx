import { motion } from "motion/react";
import { Download, PlayCircle, Users, Award } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useEffect, useState } from "react";
import { db } from "../../admin/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ContactFormPopup } from "./ContactFormPopup";

interface HeroContent {
  badge: string;
  mainHeading: string;
  mainHeadingHighlight: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  heroImage: string;
  brochureUrl?: string;
  stats: {
    students: string;
    studentsLabel: string;
    rating: string;
    ratingLabel: string;
  };
}

export function HeroSection() {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const docRef = doc(db, "content", "hero");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHeroContent(docSnap.data() as HeroContent);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchHeroContent();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const downloadBrochure = () => {
    if (heroContent?.brochureUrl) {
      const link = document.createElement("a");
      link.href = heroContent.brochureUrl;
      link.download = "brochure.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Pamphlet is not available yet. Please try again later.");
    }
  };

  if (loading || !heroContent) {
    return (
      <section id="home" className="relative pt-24 md:pt-32 pb-16 md:pb-24 bg-gradient-to-b from-orange-50/30 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="home" className="relative pt-24 md:pt-32 pb-16 md:pb-24 bg-gradient-to-b from-orange-50/30 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <div className="inline-block mb-4 px-4 py-2 bg-orange-100 text-orange-600 rounded-full">
              <span className="flex items-center gap-2">
                <Award size={16} />
                {heroContent.badge}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {heroContent.mainHeading} <br />
              <span className="text-orange-500">{heroContent.mainHeadingHighlight}</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl">
              {heroContent.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => scrollToSection("workshops")}
                className="flex items-center justify-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <PlayCircle size={20} />
                {heroContent.primaryButtonText}
              </button>
              <button
                onClick={downloadBrochure}
                className="flex items-center justify-center gap-2 bg-white text-orange-500 px-8 py-4 rounded-xl border-2 border-orange-500 hover:bg-orange-50 transition-all shadow-md hover:shadow-lg font-semibold"
              >
                <Download size={20} />
                Download Pamphlet
              </button>
              <button
                onClick={() => setIsContactFormOpen(true)}
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-8 py-4 rounded-xl border-2 border-gray-300 hover:bg-gray-200 transition-all shadow-md hover:shadow-lg font-semibold"
              >
                Get in Touch
              </button>
            </div>

            <div className="flex items-center gap-8 text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Users className="text-orange-500" size={24} />
                </div>
                <span>{heroContent.stats.students} {heroContent.stats.studentsLabel}</span>
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <div>{heroContent.stats.rating}</div>
                <span className="text-sm">{heroContent.stats.ratingLabel}</span>
              </div>
            </div>
          </motion.div>

          {/* Right Image with Floating Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              <div className="overflow-hidden rounded-3xl">
                <ImageWithFallback
                  src={heroContent.heroImage}
                  alt="Smart Learning"
                  className="shadow-2xl w-full hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Floating Card 1 - Top Left */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -top-6 -left-6 bg-white rounded-2xl shadow-xl p-4 md:p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <PlayCircle className="text-white" size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">50+</div>
                    <div className="text-sm text-gray-600">Workshops</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card 2 - Bottom Right */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-4 md:p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Users className="text-white" size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{heroContent.stats.students}</div>
                    <div className="text-sm text-gray-600">{heroContent.stats.studentsLabel}</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Certificate Badge - Hidden on mobile */}
              <motion.div
                initial={{ opacity: 0, rotate: -10 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute top-1/2 -left-8 hidden lg:block"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-xl">
                  <Award className="text-white" size={32} />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      {/* Contact Form Popup */}
      <ContactFormPopup isOpen={isContactFormOpen} onClose={() => setIsContactFormOpen(false)} />
    </section>
  );
}