import { useState } from "react";
import { ArrowLeft, Shield, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SeminarRegistrationForm } from "../components/SeminarRegistrationForm";

export const SeminarPage = () => {
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Branding */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-bold text-orange-600 hover:text-orange-700 transition-colors"
          >
            Niklaus Solutions
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500 bg-opacity-20 text-orange-300 px-4 py-2 rounded-full mb-6 border border-orange-500 border-opacity-30">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-semibold">
              Free Cyber Awareness Seminar
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Master <br />
            <span className="text-orange-500">Cyber Security Awareness</span>
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Join our comprehensive seminar on Cyber Security, Ethical Hacking,
            and Digital Safety. Learn from industry experts and protect yourself
            in the digital world.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
              onClick={() =>
                document
                  .querySelector(".registration-form")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Register Now <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowMore(!showMore)}
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold border-2 border-orange-600 hover:bg-orange-50 transition-colors"
            >
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div>
              <h3 className="text-4xl font-bold text-orange-500">100%</h3>
              <p className="text-gray-400">Free Event</p>
            </div>
            <div className="bg-gray-700 w-px"></div>
            <div>
              <h3 className="text-4xl font-bold text-orange-500">Free</h3>
              <p className="text-gray-400">Certificate</p>
            </div>
            <div className="bg-gray-700 w-px"></div>
            <div>
              <h3 className="text-4xl font-bold text-orange-500">Limited</h3>
              <p className="text-gray-400">Seats Available</p>
            </div>
          </div>

          {/* Learn More Details */}
          {showMore && (
            <div className="bg-orange-100 border-l-4 border-orange-600 p-6 rounded-r-lg mb-12 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-orange-900 mb-3">
                Seminar Highlights
              </h3>
              <ul className="text-orange-800 space-y-2">
                <li>
                  ✓ Learn current cybersecurity threats and defense strategies
                </li>
                <li>
                  ✓ Understand ethical hacking from a defensive perspective
                </li>
                <li>
                  ✓ Practical tips to secure your personal and professional
                  accounts
                </li>
                <li>
                  ✓ Network with cybersecurity professionals and fellow learners
                </li>
                <li>
                  ✓ Receive industry-recognized certificate of participation
                </li>
                <li>
                  ✓ Access to seminar materials and resources after the event
                </li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Content & Form Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12">
          {/* Left: Information */}
          <div>
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                About the Seminar
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                A comprehensive program designed to enhance your understanding
                of cybersecurity threats and best practices for digital
                protection in today's digital age.
              </p>

              {/* Features */}
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">
                    🛡️
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      Cyber Awareness
                    </h3>
                    <p className="text-gray-600">
                      Learn to identify and prevent cyber threats, phishing
                      attacks, and social engineering techniques.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">
                    🔒
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      Ethical Hacking
                    </h3>
                    <p className="text-gray-600">
                      Understand hacking techniques from a defensive perspective
                      to better protect systems and data.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">
                    🎯
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      Digital Safety
                    </h3>
                    <p className="text-gray-600">
                      Practical guidance to secure your personal and
                      professional digital presence online.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Attend */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Attend?
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Gain valuable insights and practical knowledge that you can
                apply immediately.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="text-2xl mb-2">✅</div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    Free Entry
                  </h4>
                  <p className="text-gray-600 text-sm">
                    No cost to attend this valuable seminar
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="text-2xl mb-2">🎓</div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    Free Certificate
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Receive a certificate of attendance
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="text-2xl mb-2">👨‍🏫</div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    Expert Instructors
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Learn directly from industry professionals
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="text-2xl mb-2">🛠️</div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    Practical Sessions
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Hands-on learning with real-world examples
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="text-2xl mb-2">📚</div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    Comprehensive Content
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Cover all essential cybersecurity topics
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="text-2xl mb-2">♾️</div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    Lifetime Access
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Access seminar materials even after the event
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Registration Form */}
          <div className="registration-form">
            <SeminarRegistrationForm />
          </div>
        </div>
      </section>

      {/* Who Can Attend */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Who Can Attend?
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="border-2 border-orange-600 rounded-2xl p-12 text-center bg-white">
              <div className="flex justify-center mb-6">
                <div className="text-6xl">👨‍🎓</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Students
              </h3>
              <p className="text-gray-600 leading-relaxed">
                College and university students interested in cybersecurity and
                digital safety.
              </p>
            </div>

            <div className="border-2 border-orange-600 rounded-2xl p-12 text-center bg-white">
              <div className="flex justify-center mb-6">
                <div className="text-6xl">💼</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Employees
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Working professionals looking to enhance their cybersecurity
                awareness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Join CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Join Us?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Register now and secure your spot. Limited seats available!
          </p>
          <button
            onClick={() =>
              document
                .querySelector(".registration-form")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="inline-flex items-center gap-2 bg-white text-orange-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-50 transition-colors"
          >
            Register for Free <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Niklaus Solutions
              </h3>
              <p className="text-gray-400">
                Empowering individuals with cybersecurity knowledge
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-gray-500">
              © 2026 Niklaus Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
