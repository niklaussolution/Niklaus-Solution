import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";
import emailjs from "@emailjs/browser";

export const SeminarRegistrationForm = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Initialize EmailJS on component mount
  useEffect(() => {
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (publicKey) {
      emailjs.init(publicKey);
    }
  }, []);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Student",
    organization: "",
    city: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate form data
      if (
        !formData.name ||
        !formData.email ||
        !formData.phone ||
        !formData.organization ||
        !formData.city
      ) {
        throw new Error("Please fill in all fields");
      }

      // Store in Firestore
      await addDoc(collection(db, "seminarRegistrations"), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        organization: formData.organization,
        city: formData.city,
        registeredAt: serverTimestamp(),
        status: "registered",
      });

      // Send confirmation email via EmailJS
      try {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

        if (serviceId && templateId) {
          await emailjs.send(serviceId, templateId, {
            name: formData.name,
            email: formData.email,
            mobile: formData.phone,
            role: formData.role,
            organization: formData.organization,
            city: formData.city,
          });
        }
      } catch (emailError) {
        console.warn(
          "Email sending failed, but registration saved:",
          emailError,
        );
        // Don't throw - registration was successful even if email fails
      }

      // Success!
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "Student",
        organization: "",
        city: "",
      });

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-8">
        <h3 className="text-2xl font-bold mb-2">Register Now</h3>
        <p className="text-orange-100">All fields are required</p>
      </div>

      {/* Card Body */}
      <div className="p-8">
        {success ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-3">
              Registration Successful! 🎉
            </h4>
            <p className="text-gray-600 mb-4">
              Thank you for registering for the{" "}
              <strong>Cyber Awareness & Ethical Hacking Seminar</strong>. A
              confirmation email has been sent to you.
            </p>
            <p className="text-sm text-gray-500">
              Check your email for further details and keep an eye on your inbox
              for seminar updates.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-colors disabled:bg-gray-50"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-colors disabled:bg-gray-50"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Mobile Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-colors disabled:bg-gray-50"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Role *
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="Student"
                    checked={formData.role === "Student"}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">Student</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="Employee"
                    checked={formData.role === "Employee"}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">Employee</span>
                </label>
              </div>
            </div>

            {/* Organization */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Organization / College Name *
              </label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="Enter your organization or college name"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-colors disabled:bg-gray-50"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                City / Location *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your city"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-colors disabled:bg-gray-50"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 rounded-lg font-bold mt-8 hover:from-orange-700 hover:to-orange-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Complete Registration"
              )}
            </button>

            {/* Info Text */}
            <p className="text-center text-xs text-gray-600 mt-4">
              Your information is secure and will be used only for seminar
              registration purposes.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
