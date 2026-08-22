import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { MessageSquareText } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "../../admin/config/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

interface FeedbackFormData {
  studentName: string;
  collegeName: string;
  departmentName: string;
  hodName: string;
  programTopic: string;
  review: string;
}

const EMPTY_FORM: FeedbackFormData = {
  studentName: "",
  collegeName: "",
  departmentName: "",
  hodName: "",
  programTopic: "",
  review: "",
};

export function Feedback() {
  useEffect(() => {
    document.title = "Feedback - Niklaus Solutions | Share Your Experience";

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Share your feedback about the Niklaus Solutions workshop or program you attended."
      );
    }

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link") as HTMLLinkElement;
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = "https://theniklaus.com/feedback";

    return () => {
      document.title = "Niklaus Solutions | Industry-Oriented Tech Workshops & Training";
    };
  }, []);

  const [formData, setFormData] = useState<FeedbackFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.studentName.trim()) newErrors.studentName = "Student name is required";
    if (!formData.collegeName.trim()) newErrors.collegeName = "College name is required";
    if (!formData.departmentName.trim()) newErrors.departmentName = "Department name is required";
    if (!formData.hodName.trim()) newErrors.hodName = "HOD name is required";
    if (!formData.programTopic.trim()) newErrors.programTopic = "Program / topic is required";
    if (!formData.review.trim()) {
      newErrors.review = "Review is required";
    } else if (formData.review.trim().length < 10) {
      newErrors.review = "Review should be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await addDoc(collection(db, "programFeedback"), {
        ...formData,
        submittedAt: Timestamp.now(),
        status: "new",
      });

      setSubmitSuccess(true);
      setFormData(EMPTY_FORM);

      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setSubmitError("Failed to submit your feedback. Please try again later.");
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
              Share Your <span className="text-orange-500">Feedback</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Attended one of our workshops or programs? Let us know how it went.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquareText size={20} className="text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Feedback Form
                </h2>
              </div>
              <p className="text-gray-600 mb-8">
                Fill out the form below to share your experience with us.
              </p>

              {submitSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    ✓ Thank you! Your feedback has been submitted successfully.
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
                      Student Name *
                    </label>
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.studentName ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.studentName && (
                      <p className="text-red-600 text-sm mt-1">{errors.studentName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      College Name *
                    </label>
                    <input
                      type="text"
                      name="collegeName"
                      value={formData.collegeName}
                      onChange={handleChange}
                      placeholder="ABC College of Engineering"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.collegeName ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.collegeName && (
                      <p className="text-red-600 text-sm mt-1">{errors.collegeName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Department Name *
                    </label>
                    <input
                      type="text"
                      name="departmentName"
                      value={formData.departmentName}
                      onChange={handleChange}
                      placeholder="Computer Science"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.departmentName ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.departmentName && (
                      <p className="text-red-600 text-sm mt-1">{errors.departmentName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      HOD Name *
                    </label>
                    <input
                      type="text"
                      name="hodName"
                      value={formData.hodName}
                      onChange={handleChange}
                      placeholder="Dr. Jane Smith"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.hodName ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.hodName && (
                      <p className="text-red-600 text-sm mt-1">{errors.hodName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Program / Topic *
                  </label>
                  <input
                    type="text"
                    name="programTopic"
                    value={formData.programTopic}
                    onChange={handleChange}
                    placeholder="Ethical Hacking Workshop"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.programTopic ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.programTopic && (
                    <p className="text-red-600 text-sm mt-1">{errors.programTopic}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Your Review *
                  </label>
                  <textarea
                    name="review"
                    value={formData.review}
                    onChange={handleChange}
                    placeholder="Tell us what you thought of the session..."
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none ${
                      errors.review ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.review && (
                    <p className="text-red-600 text-sm mt-1">{errors.review}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
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
