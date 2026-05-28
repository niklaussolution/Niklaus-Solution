import { CalendarDays, Users, Award, ArrowRight } from "lucide-react";

export const SeminarSection = () => {
  return (
    <section className="relative py-20 bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full mb-4">
            <CalendarDays className="w-4 h-4" />
            <span className="text-sm font-semibold">Free Seminar</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Cyber Awareness <span className="text-orange-600">&</span> Ethical
            Hacking Seminar
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our comprehensive free seminar to master cybersecurity
            awareness, ethical hacking, and digital safety. Learn from industry
            experts!
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Card 1 */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Free Certificate
            </h3>
            <p className="text-gray-600">
              Receive a professional certificate of attendance upon successful
              completion.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Expert Instructors
            </h3>
            <p className="text-gray-600">
              Learn directly from industry professionals with years of
              experience.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
              <CalendarDays className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Limited Seats
            </h3>
            <p className="text-gray-600">
              Register now to secure your spot. Limited seats are available.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Master Cybersecurity?
          </h3>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Register now for our free Cyber Awareness & Ethical Hacking seminar
            and take your digital safety to the next level.
          </p>
          <a
            href="/seminar"
            className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-50 transition-colors"
          >
            Register Now <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};
