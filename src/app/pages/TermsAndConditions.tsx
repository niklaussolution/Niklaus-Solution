import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function TermsAndConditions() {
  const navigate = useNavigate();

  // Set SEO meta tags for Terms and Conditions page
  useEffect(() => {
    document.title = "Terms and Conditions - Niklaus Solutions | Legal Terms";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Terms and Conditions for Niklaus Solutions. Read our complete terms of service, usage policies, and legal agreements.");
    }
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", "Terms and Conditions - Niklaus Solutions");
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute("content", "Terms and Conditions for Niklaus Solutions - Read our legal terms.");
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", "https://theniklaus.com/terms-and-conditions");
    
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute("content", "Terms and Conditions - Niklaus Solutions");
    
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute("content", "Terms and Conditions for Niklaus Solutions");
    
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link') as HTMLLinkElement;
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = 'https://theniklaus.com/terms-and-conditions';
    
    return () => {
      document.title = "Niklaus Solutions | Industry-Oriented Tech Workshops & Training";
    };
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors mb-8"
        >
          <ChevronLeft size={20} />
          Back
        </button>

        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms and Conditions - Niklaus Solutions</h1>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using the Niklaus Solutions website (www.niklaussolutions.com) and registering for our workshops, 
              courses, and training programs (including Ethical Hacking/CEH, Full Stack Web Development, UI/UX Design, Generative AI, 
              WordPress Development, Bug Bounty Hunting, and other programs), you accept and agree to be bound by these terms and conditions. 
              Our services include online/offline workshops, free trial courses, internship opportunities, job placement assistance, and 
              industry-recognized certifications. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. Use License</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) 
              on our website for personal, non-commercial transitory viewing only. This is the grant of a license, 
              not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the website</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. Disclaimer of Warranties</h2>
            <p className="text-gray-700 leading-relaxed">
              The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or 
              implied, and hereby disclaim and negate all other warranties including, without limitation, implied 
              warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of 
              intellectual property or other violation of rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">4. Limitations of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              In no event shall our company or its suppliers be liable for any damages (including, without limitation, 
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
              to use the materials on our website, even if we or our authorized representative has been notified orally 
              or in writing of the possibility of such damage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">5. Accuracy of Materials</h2>
            <p className="text-gray-700 leading-relaxed">
              The materials appearing on our website could include technical, typographical, or photographic errors. 
              We do not warrant that any of the materials on our website are accurate, complete, or current. We may 
              make changes to the materials contained on our website at any time without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">6. Materials and Content</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The materials and content on our website, including but not limited to text, graphics, images, and 
              videos are the property of our company or used with permission. You may not:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Reproduce, republish, or display content without our permission</li>
              <li>Use content for commercial purposes</li>
              <li>Modify or adapt content</li>
              <li>Share course materials beyond personal use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">7. User Accounts</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you create an account on our website, you are responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Maintaining the confidentiality of your password</li>
              <li>Accepting responsibility for all activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
              <li>Providing accurate and complete information during registration</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">8. Workshop and Course Participation</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By registering for any Niklaus Solutions workshop or course, you agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Attend live sessions (online/offline) as per the scheduled dates and times</li>
              <li>Abide by Niklaus Solutions code of conduct during the entire program</li>
              <li>Not share course materials, recordings, or resources with third parties without written permission</li>
              <li>Respect intellectual property rights of trainers, mentors, and fellow participants</li>
              <li>Participate actively in hands-on training, projects, and assessments</li>
              <li>Comply with guidelines for free trial courses - materials must be used for personal learning only</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">9. Limitation on Time for Claims</h2>
            <p className="text-gray-700 leading-relaxed">
              Any claim relating to materials on our website must be brought within one (1) year after such 
              material is posted on the website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">10. Governing Law and Jurisdiction</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms and Conditions are governed by and construed in accordance with the laws of India. 
              Both parties irrevocably agree to submit to the exclusive jurisdiction of the courts in India for any disputes 
              arising from your use of Niklaus Solutions services or violation of these terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">11. Modifications to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We may revise these terms of service at any time without notice. By using this website, you are 
              agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">12. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms and Conditions or Niklaus Solutions services, please contact us at 
              <a href="mailto:support@niklaussolutions.com" className="text-orange-500 hover:text-orange-600 ml-1">
                support@niklaussolutions.com
              </a>
            </p>
          </section>

          <section className="mb-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Last Updated:</strong> December 2024
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
