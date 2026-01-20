import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "../../admin/config/firebase";
import { collection, getDocs } from "firebase/firestore";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  order?: number;
  discountCode?: string;
  discountPercentage?: number;
  validFrom?: string;
  validTo?: string;
}

export function PricingSection() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      const plansRef = collection(db, "pricingPlans");
      const snapshot = await getDocs(plansRef);
      const plansData: PricingPlan[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      // Filter only active plans and sort by isPopular first, then by order
      const activePlans = plansData.filter((plan) => plan.isActive !== false);
      activePlans.sort((a, b) => {
        if (a.isPopular !== b.isPopular) {
          return b.isPopular ? 1 : -1;
        }
        return (a.order || 0) - (b.order || 0);
      });
      setPlans(activePlans);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    const element = document.getElementById("workshops");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <section id="pricing" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">Loading pricing plans...</p>
        </div>
      </section>
    );
  }

  if (plans.length === 0) {
    return (
      <section id="pricing" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">No pricing plans available yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-16 md:py-24 bg-white">
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
            Affordable Pricing
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Choose Your <span className="text-orange-500">Plan</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Flexible pricing options designed to fit your learning goals and budget
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 md:p-8 border-2 ${
                plan.isPopular ? "border-orange-500 scale-105 shadow-orange-200" : "border-gray-300"
              } relative`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full flex items-center gap-2 shadow-lg">
                    <Sparkles size={14} />
                    <span className="text-sm">Most Popular</span>
                  </div>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-6">{plan.description}</p>

              {/* Discount Badge */}
              {plan.discountPercentage && (
                <div className="mb-4 inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                  Save {plan.discountPercentage}% {plan.discountCode && `with ${plan.discountCode}`}
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl md:text-5xl font-bold text-gray-900">
                  ₹{plan.price.toLocaleString()}
                </span>
                <span className="text-gray-600 ml-2">/{plan.duration}</span>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {plan.features && plan.features.length > 0 ? (
                  plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                        <Check size={12} className="text-orange-500" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-600">No features listed</li>
                )}
              </ul>

              {/* CTA Button */}
              <button
                onClick={handleGetStarted}
                className={`w-full px-6 py-3 rounded-xl transition-all font-medium ${
                  plan.isPopular
                    ? "bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                Get Started
              </button>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600">
            All plans include lifetime access to course materials and updates.{" "}
            <button 
              onClick={() => navigate("/contact")}
              className="text-orange-500 hover:underline font-medium"
            >
              Contact us
            </button>{" "}
            for custom group pricing.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
