import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Send } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "../../admin/config/firebase";
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";

interface CourseOption {
  id: string;
  title: string;
}

interface EnquiryFormData {
  name: string;
  email: string;
  mobileNumber: string;
  whatsappNumber: string;
  sameAsMobile: boolean;
  course: string;
  message: string;
}

const EMPTY_FORM: EnquiryFormData = {
  name: "",
  email: "",
  mobileNumber: "",
  whatsappNumber: "",
  sameAsMobile: true,
  course: "",
  message: "",
};

export function Enquiry() {
  useEffect(() => {
    document.title = "Enquiry - Niklaus Solutions | Apply Now";

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Interested in a Niklaus Solutions workshop or course? Send us your details and we'll get in touch."
      );
    }

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link") as HTMLLinkElement;
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = "https://theniklaus.com/enquiry";

    return () => {
      document.title = "Niklaus Solutions | Industry-Oriented Tech Workshops & Training";
    };
  }, []);

  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [formData, setFormData] = useState<EnquiryFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const fetchCourseOptions = async () => {
      try {
        const q = query(collection(db, "enquiryCourses"), orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        const data: CourseOption[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          title: (doc.data() as any).title,
        }));
        setCourseOptions(data);
      } catch (error) {
        // Non-fatal - the field just won't show any autocomplete suggestions
      }
    };
    fetchCourseOptions();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "mobileNumber" && prev.sameAsMobile) {
        next.whatsappNumber = value;
      }
      return next;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSameAsMobileToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      sameAsMobile: checked,
      whatsappNumber: checked ? prev.mobileNumber : prev.whatsappNumber,
    }));
    if (checked && errors.whatsappNumber) {
      setErrors((prev) => ({ ...prev, whatsappNumber: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNumber.replace(/\D/g, ""))) {
      newErrors.mobileNumber = "Please enter a valid 10-digit mobile number";
    }

    if (!formData.sameAsMobile) {
      if (!formData.whatsappNumber.trim()) {
        newErrors.whatsappNumber = "WhatsApp number is required";
      } else if (!/^\d{10}$/.test(formData.whatsappNumber.replace(/\D/g, ""))) {
        newErrors.whatsappNumber = "Please enter a valid 10-digit WhatsApp number";
      }
    }

    if (!formData.course.trim()) newErrors.course = "Please enter the course you're interested in";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await addDoc(collection(db, "courseEnquiries"), {
        name: formData.name,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        whatsappNumber: formData.sameAsMobile ? formData.mobileNumber : formData.whatsappNumber,
        course: formData.course,
        message: formData.message,
        submittedAt: Timestamp.now(),
        status: "new",
      });

      setSubmitSuccess(true);
      setFormData(EMPTY_FORM);

      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setSubmitError("Failed to submit your enquiry. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        <section className="bg-gradient-to-r from-orange-50 to-yellow-50 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Apply <span className="text-orange-500">Now</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Interested in one of our workshops or courses? Fill in your details below and our
              team will reach out to you.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Enquiry Form
              </h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              {submitSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    ✓ Thank you! Your enquiry has been submitted successfully. We'll be in touch soon!
                  </p>
                </div>
              )}

              {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">✕ {submitError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.mobileNumber ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.mobileNumber && (
                      <p className="text-red-600 text-sm mt-1">{errors.mobileNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={formData.sameAsMobile ? formData.mobileNumber : formData.whatsappNumber}
                      onChange={handleChange}
                      disabled={formData.sameAsMobile}
                      placeholder="9876543210"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-500 ${
                        errors.whatsappNumber ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.whatsappNumber && (
                      <p className="text-red-600 text-sm mt-1">{errors.whatsappNumber}</p>
                    )}
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sameAsMobile}
                        onChange={(e) => handleSameAsMobileToggle(e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-gray-600">Same as mobile number</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Which Course? *
                  </label>
                  <input
                    type="text"
                    name="course"
                    list="course-suggestions"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="Type the course you're interested in"
                    autoComplete="off"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.course ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <datalist id="course-suggestions">
                    {courseOptions.map((c) => (
                      <option key={c.id} value={c.title} />
                    ))}
                  </datalist>
                  {errors.course && (
                    <p className="text-red-600 text-sm mt-1">{errors.course}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Extra Information <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Anything else you'd like us to know..."
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                  {isSubmitting ? "Submitting..." : "Submit Enquiry"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
