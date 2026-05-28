import { motion, AnimatePresence } from "motion/react";
import { Calendar, Clock, MapPin, ArrowRight, Users, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { db } from "../../admin/config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { PaymentForm } from "./PaymentForm";

interface WorkshopsSectionProps {
  onOpenContactForm?: () => void;
}

// Declare fbq for Meta Pixel tracking
declare global {
  interface Window {
    fbq: (command: string, action: string) => void;
  }
}

interface Workshop {
  id: string;
  title: string;
  description: string;
  duration: string;
  mode: string;
  startDate: string;
  price: number;
  color: string;
  capacity: number;
  enrolled: number;
  instructorName: string;
  learningOutcomes?: string[];
  requirements?: string[];
}

interface RegistrationData {
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  workshopId: string;
  workshopTitle: string;
  price: number;
}

export function WorkshopsSection({ onOpenContactForm }: WorkshopsSectionProps) {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const workshopsRef = useRef<HTMLDivElement>(null);
  const [hasAutoOpenedForm, setHasAutoOpenedForm] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    workshopId: "",
    workshopTitle: "",
    price: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchWorkshops();
  }, []);

  // Auto-open contact form when user scrolls to workshops section
  useEffect(() => {
    if (!workshopsRef.current || !onOpenContactForm || hasAutoOpenedForm) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Auto-open when section is 40% visible
        if (entry.isIntersecting && !hasAutoOpenedForm) {
          // Add a small delay to make it feel natural
          setTimeout(() => {
            onOpenContactForm?.();
            setHasAutoOpenedForm(true);
          }, 1500);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(workshopsRef.current);

    return () => {
      if (workshopsRef.current) {
        observer.unobserve(workshopsRef.current);
      }
    };
  }, [onOpenContactForm, hasAutoOpenedForm]);

  const fetchWorkshops = async () => {
    try {
      const workshopsRef = collection(db, "workshops");
      const snapshot = await getDocs(workshopsRef);
      const workshopsData: Workshop[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));

      // Fetch actual enrollment count from registrations collection
      const registrationsRef = collection(db, "registrations");
      const updatedWorkshops = await Promise.all(
        workshopsData.map(async (workshop) => {
          const q = query(
            registrationsRef, 
            where("workshopId", "==", workshop.id)
          );
          const registrationSnapshot = await getDocs(q);
          console.log(`Workshop: ${workshop.title} (${workshop.id}), Registrations: ${registrationSnapshot.size}`);
          return {
            ...workshop,
            enrolled: registrationSnapshot.size,
          };
        })
      );

      setWorkshops(updatedWorkshops);
    } catch (error) {
      console.error("Error fetching workshops:", error);
    } finally {
      setLoading(false);
    }
  };

  const openRegistrationModal = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setRegistrationData({
      fullName: "",
      email: "",
      phone: "",
      organization: "",
      workshopId: workshop.id,
      workshopTitle: workshop.title,
      price: workshop.price,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleRegistrationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setRegistrationData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateRegistration = () => {
    const newErrors: Record<string, string> = {};

    if (!registrationData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!registrationData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!registrationData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(registrationData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!registrationData.organization.trim()) {
      newErrors.organization = "College/Company name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getVisibleWorkshops = () => {
    if (workshops.length === 0) return [];
    const visible = [];
    // Show 1 card on mobile, 2 cards on desktop
    const cardsToShow = window.innerWidth < 768 ? 1 : 2;
    for (let i = 0; i < Math.min(cardsToShow, workshops.length); i++) {
      const index = (currentIndex + i) % workshops.length;
      visible.push(workshops[index]);
    }
    return visible;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swiped left, go to next
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % workshops.length);
      } else {
        // Swiped right, go to previous
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + workshops.length) % workshops.length);
      }
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRegistration()) {
      return;
    }

    // Show payment form instead of submitting directly
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = async () => {
    // After payment is successful, the registration is already updated in Firestore by the verify endpoint
    // Just refresh and close
    setIsSubmitting(true);
    try {
      setShowPaymentForm(false);
      setSubmitSuccess(true);

      // Track Lead event with Meta Pixel
      if (window.fbq) {
        window.fbq('track', 'Lead');
      }

      // Refresh workshops to show updated enrollment count
      await fetchWorkshops();

      // Reset form after 3 seconds
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess(false);
        setRegistrationData({
          fullName: "",
          email: "",
          phone: "",
          organization: "",
          workshopId: "",
          workshopTitle: "",
          price: 0,
        });
      }, 3000);
    } catch (error) {
      alert("Error finalizing registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section id="workshops" ref={workshopsRef} className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">Loading workshops...</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="workshops" ref={workshopsRef} className="py-16 md:py-24 bg-white">
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
              Our Workshops
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Upcoming <span className="text-orange-500">Workshops</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from our carefully designed workshops to accelerate your career growth
            </p>
          </motion.div>

          {/* Workshop Cards Grid */}
          {workshops.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No workshops available at the moment.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Workshops Cards */}
              <div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 cursor-grab active:cursor-grabbing"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <AnimatePresence>
                  {getVisibleWorkshops().map((workshop, index) => (
                    <motion.div
                      key={workshop.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -8, transition: { duration: 0.3 } }}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-gray-100"
                    >
                      {/* Color Strip */}
                      <div className={`h-2 ${workshop.color}`}></div>

                      <div className="p-6 md:p-8">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                            {workshop.title}
                          </h3>
                          <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                            ₹{workshop.price}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-6">{workshop.description}</p>

                        {/* Info Grid */}
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-3 text-gray-700">
                            <Clock size={18} className="text-orange-500" />
                            <span>{workshop.duration}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-700">
                            <MapPin size={18} className="text-orange-500" />
                            <span>{workshop.mode}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-700">
                            <Calendar size={18} className="text-orange-500" />
                            <span>{(() => {
                              let d: Date;
                              // Handle both Firestore Timestamp and string dates
                              if (workshop.startDate && typeof workshop.startDate === 'object' && 'toDate' in workshop.startDate) {
                                d = workshop.startDate.toDate();
                              } else {
                                d = new Date(workshop.startDate);
                              }
                              if (isNaN(d.getTime())) return "";
                              const day = String(d.getDate()).padStart(2, "0");
                              const month = String(d.getMonth() + 1).padStart(2, "0");
                              const year = d.getFullYear();
                              return `${day}/${month}/${year}`;
                            })()}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-700">
                            <Users size={18} className="text-orange-500" />
                            <span>{workshop.enrolled} / {workshop.capacity} enrolled</span>
                          </div>
                        </div>

                        {/* Instructor */}
                        <div className="mb-6 pb-6 border-b border-gray-200">
                          <p className="text-sm text-gray-600">
                            <strong>Instructor:</strong> {workshop.instructorName}
                          </p>
                        </div>

                        {/* CTA Button */}
                        <button
                          onClick={() => openRegistrationModal(workshop)}
                          className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors group"
                        >
                          Register Now
                          <ArrowRight
                            size={18}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 md:mt-12">
                <button
                  onClick={() => {
                    setDirection(-1);
                    setCurrentIndex((prev) => (prev - 1 + workshops.length) % workshops.length);
                  }}
                  className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 hover:bg-orange-500 text-gray-700 hover:text-white transition-all shadow-md hover:shadow-lg group"
                  aria-label="Previous workshop"
                >
                  <ChevronLeft size={24} className="group-hover:scale-110 transition-transform" />
                </button>

                {/* Dots Indicator */}
                <div className="flex items-center gap-2 mx-auto">
                  {workshops.map((_, index) => (
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
                      aria-label={`Go to workshop ${index + 1}`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    setDirection(1);
                    setCurrentIndex((prev) => (prev + 1) % workshops.length);
                  }}
                  className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 hover:bg-orange-500 text-gray-700 hover:text-white transition-all shadow-md hover:shadow-lg group"
                  aria-label="Next workshop"
                >
                  <ChevronRight size={24} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            {submitSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">✓</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Registration Successful! 🎉
                </h3>
                <p className="text-gray-600 mb-2">
                  Thank you for registering for <strong>{selectedWorkshop?.title}</strong>
                </p>
                <p className="text-gray-600">
                  A confirmation email will be sent to {registrationData.email}
                </p>
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Register for {selectedWorkshop?.title}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X size={24} className="text-gray-600" />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleRegistrationSubmit} className="p-6 space-y-4">
                  {errors.submit && (
                    <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                      {errors.submit}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={registrationData.fullName}
                      onChange={handleRegistrationChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={registrationData.email}
                      onChange={handleRegistrationChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={registrationData.phone}
                      onChange={handleRegistrationChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                      placeholder="10-digit phone number"
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      College / Company Name *
                    </label>
                    <input
                      type="text"
                      name="organization"
                      value={registrationData.organization}
                      onChange={handleRegistrationChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                      placeholder="Your college or company"
                    />
                    {errors.organization && (
                      <p className="text-red-600 text-sm mt-1">{errors.organization}</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:bg-gray-400"
                    >
                      {isSubmitting ? "Submitting..." : "Register Now"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && selectedWorkshop && (
        <PaymentForm
          registrationData={{
            fullName: registrationData.fullName,
            email: registrationData.email,
            phone: registrationData.phone,
            organization: registrationData.organization,
            workshopId: registrationData.workshopId,
            workshopTitle: registrationData.workshopTitle,
            amount: registrationData.price * 100, // Convert to paise for Razorpay
          }}
          onClose={() => setShowPaymentForm(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
