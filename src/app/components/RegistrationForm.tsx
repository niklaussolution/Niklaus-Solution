import { useState } from "react";
import { motion } from "motion/react";
import { User, Mail, Phone, Building, BookOpen, CheckCircle, CreditCard } from "lucide-react";
import { PaymentForm } from "./PaymentForm";

interface RegistrationData {
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  workshop: string;
}

const WORKSHOP_PRICING: Record<string, number> = {
  "Ethical Hacking": 2999,
  "Full Stack Development": 2499,
  "AI & Machine Learning": 2799,
  "Cyber Security Basics": 1999,
  "Cloud Computing": 2199,
  "Data Science": 2599,
};

export function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    workshop: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const workshops = Object.keys(WORKSHOP_PRICING);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.organization.trim()) {
      newErrors.organization = "College/Company name is required";
    }

    if (!formData.workshop) {
      newErrors.workshop = "Please select a workshop";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Show payment form instead of success message
      setShowPayment(true);
    }
  };

  const getSelectedWorkshopPrice = (): number => {
    return WORKSHOP_PRICING[formData.workshop] || 0;
  };

  if (showPayment) {
    return (
      <>
        <PaymentForm
          registrationData={{
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            organization: formData.organization,
            workshopId: `workshop_${formData.workshop.toLowerCase().replace(/\s+/g, "_")}`,
            workshopTitle: formData.workshop,
            amount: getSelectedWorkshopPrice(),
          }}
          onClose={() => {
            setShowPayment(false);
            setFormData({
              fullName: "",
              email: "",
              phone: "",
              organization: "",
              workshop: "",
            });
          }}
        />
        <section id="register" className="py-16 md:py-24 bg-gradient-to-b from-white to-orange-50/30">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="text-blue-500" size={40} />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Complete Your Payment
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Complete your payment above to confirm your registration for{" "}
                <strong>{formData.workshop}</strong>
              </p>
              <p className="text-gray-600">
                You'll receive your bill and course details immediately after payment.
              </p>
            </motion.div>
          </div>
        </section>
      </>
    );
  }

  return (
    <section id="register" className="py-16 md:py-24 bg-gradient-to-b from-white to-orange-50/30">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block mb-4 px-4 py-2 bg-orange-100 text-orange-600 rounded-full">
            Get Started
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Workshop <span className="text-orange-500">Registration</span>
          </h2>
          <p className="text-lg text-gray-600">
            Fill out the form below to secure your spot in our upcoming workshops
          </p>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl p-8 md:p-12"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-gray-700 font-medium mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.fullName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-orange-500"
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-orange-500"
                  }`}
                  placeholder="your.email@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-orange-500"
                  }`}
                  placeholder="+91 9876543210"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* College/Company */}
            <div>
              <label htmlFor="organization" className="block text-gray-700 font-medium mb-2">
                College / Company *
              </label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.organization
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-orange-500"
                  }`}
                  placeholder="Your college or company name"
                />
              </div>
              {errors.organization && (
                <p className="mt-1 text-sm text-red-500">{errors.organization}</p>
              )}
            </div>

            {/* Workshop Selection */}
            <div>
              <label htmlFor="workshop" className="block text-gray-700 font-medium mb-2">
                Workshop Interested *
              </label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  id="workshop"
                  name="workshop"
                  value={formData.workshop}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 appearance-none bg-white ${
                    errors.workshop
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-orange-500"
                  }`}
                >
                  <option value="">Select a workshop</option>
                  {workshops.map((workshop) => (
                    <option key={workshop} value={workshop}>
                      {workshop} - ₹{WORKSHOP_PRICING[workshop]}
                    </option>
                  ))}
                </select>
              </div>
              {errors.workshop && (
                <p className="mt-1 text-sm text-red-500">{errors.workshop}</p>
              )}
            </div>

            {/* Price Summary */}
            {formData.workshop && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 text-sm">Workshop Fee</p>
                    <p className="text-gray-900 font-medium">{formData.workshop}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-600 text-sm">Total Amount</p>
                    <p className="text-2xl font-bold text-orange-600">
                      ₹{getSelectedWorkshopPrice()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  (Includes 18% GST)
                </p>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold flex items-center justify-center gap-2"
            >
              <CreditCard size={20} />
              Proceed to Payment
            </button>


            <p className="text-sm text-gray-500 text-center">
              Secure payment powered by Razorpay | Your data is encrypted and safe
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
