'use client';

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  Users,
  Briefcase,
  Award,
  BookOpen,
  Zap,
  Target,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import { db } from "../../admin/config/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

interface KeyFeaturesSectionProps {
  onOpenContactForm?: () => void;
}

interface Feature {
  id: string;
  title: string;
  description?: string;
}

interface KeyFeaturesContent {
  heading: string;
  subheading: string;
  features: Feature[];
  updatedAt?: number;
}

// Icon mapping - maps icon names to lucide components
const iconMap: Record<string, React.ReactNode> = {
  'Users': <Users className="w-8 h-8 text-blue-600" />,
  'Briefcase': <Briefcase className="w-8 h-8 text-blue-600" />,
  'Award': <Award className="w-8 h-8 text-blue-600" />,
  'BookOpen': <BookOpen className="w-8 h-8 text-blue-600" />,
  'Zap': <Zap className="w-8 h-8 text-blue-600" />,
  'Target': <Target className="w-8 h-8 text-blue-600" />,
  'Lightbulb': <Lightbulb className="w-8 h-8 text-blue-600" />,
  'CheckCircle': <CheckCircle className="w-8 h-8 text-blue-600" />,
};

const getIconComponent = (index: number) => {
  const iconNames = Object.keys(iconMap);
  const icon = iconNames[index % iconNames.length];
  return iconMap[icon] || <CheckCircle className="w-8 h-8 text-blue-600" />;
};

export function KeyFeaturesSection({ onOpenContactForm }: KeyFeaturesSectionProps) {
  const [content, setContent] = useState<KeyFeaturesContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const contentRef = doc(db, 'content', 'keyFeatures');
        const docSnap = await getDoc(contentRef);
        
        if (docSnap.exists()) {
          setContent(docSnap.data() as KeyFeaturesContent);
        } else {
          setError('Key features content not found');
        }
      } catch (err) {
        setError('Failed to load features');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);
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
            {content?.heading || "Key Features Of Niklaus"}
          </h2>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            {content?.subheading || "Elevate Your Career with Guidance from Top Industry Mentors"}
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-blue-200">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-400 border-t-transparent"></div>
              Loading features...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-8 flex items-center gap-2 text-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && (!content?.features || content.features.length === 0) && !error && (
          <div className="text-center py-12">
            <p className="text-blue-200">No features available at the moment.</p>
          </div>
        )}

        {/* Features Grid */}
        {!loading && content?.features && content.features.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {content.features.map((feature, index) => (
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
                      {getIconComponent(index)}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {feature.title}
                    </h3>
                  </div>
                  {feature.description && (
                    <p className="mt-2 text-sm text-gray-600 ml-16">
                      {feature.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <button 
            onClick={onOpenContactForm}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 md:px-10 py-3 md:py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold text-sm md:text-base"
          >
            <MessageCircle size={20} />
            Get in Touch
          </button>
        </motion.div>
      </div>
    </section>
  );
}
