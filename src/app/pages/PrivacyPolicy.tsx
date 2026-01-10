import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function PrivacyPolicy() {
  const navigate = useNavigate();

  // Set SEO meta tags for Privacy Policy page
  useEffect(() => {
    document.title = "Privacy Policy - Niklaus Solutions | Your Data Privacy";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Privacy Policy for Niklaus Solutions. Learn how we collect, use, and protect your personal data. Read our complete privacy practices.");
    }
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", "Privacy Policy - Niklaus Solutions");
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute("content", "Privacy Policy for Niklaus Solutions - Learn how we protect your data.");
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", "https://theniklaus.com/privacy-policy");
    
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute("content", "Privacy Policy - Niklaus Solutions");
    
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute("content", "Privacy Policy for Niklaus Solutions");
    
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link') as HTMLLinkElement;
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = 'https://theniklaus.com/privacy-policy';
    
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy - Niklaus Solutions</h1>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Niklaus Solutions is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you visit our website (www.niklaussolutions.com) and use our services, including our 
              online and offline workshops, courses (Ethical Hacking/CEH, Full Stack Web Development, UI/UX Design, Generative AI, 
              WordPress Development, Bug Bounty Hunting, and more), free trial programs, internship programs, and job placement services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may collect information about you in a variety of ways. The information we may collect on the site includes:
            </p>
            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">Personal Data</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Name and email address</li>
              <li>Phone number</li>
              <li>Date of birth</li>
              <li>Address and postal code</li>
              <li>Educational background and qualifications</li>
              <li>Professional experience and current occupation</li>
              <li>Payment information (processed securely through payment gateways)</li>
              <li>Course/workshop enrollment information and performance data</li>
              <li>Free trial course access and progress tracking</li>
            </ul>
            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">Automatically Collected Information</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website information</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. Use of Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Niklaus Solutions uses the information collected to provide superior training experiences and services. Specifically, 
              we may use information collected about you to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Process your workshop and course registration and payments</li>
              <li>Track your progress and performance in courses and free trials</li>
              <li>Send course materials, certificates, and educational resources</li>
              <li>Provide internship opportunities and job placement assistance</li>
              <li>Send promotional communications about new courses and workshops</li>
              <li>Improve and personalize our website and training services</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Administer contests, scholarships (Niklaus Scholarship program), and promotions</li>
              <li>Generate analytics and research about our training programs</li>
              <li>Comply with legal and regulatory requirements</li>
              <li>Prevent fraudulent transactions and enhance security</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">4. Disclosure of Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Service Providers:</strong> With third-party vendors who assist us in operating our website and conducting our business</li>
              <li><strong>Payment Processors:</strong> With secure payment gateways to process transactions</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our legal rights</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> With your explicit permission for specific purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">5. Security of Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use administrative, technical, and physical security measures to protect your personal information. 
              These include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>SSL encryption for data transmission</li>
              <li>Secure password protocols</li>
              <li>Limited access to personal information</li>
              <li>Regular security audits and updates</li>
              <li>Confidentiality agreements with service providers</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. 
              While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">6. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our website uses cookies and similar tracking technologies to enhance your experience. Cookies are small files 
              that store information on your device. You can control cookies through your browser settings:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>We use session cookies for login and security</li>
              <li>We use persistent cookies for user preferences</li>
              <li>We use analytics cookies to understand usage patterns</li>
              <li>You may opt-out of non-essential cookies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">7. Third-Party Links</h2>
            <p className="text-gray-700 leading-relaxed">
              Our website may contain links to third-party websites. This Privacy Policy does not apply to these external sites. 
              We are not responsible for the privacy practices of third-party websites. We encourage you to review their privacy 
              policies before providing any personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">8. Your Privacy Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Access:</strong> You can request access to your personal data</li>
              <li><strong>Correction:</strong> You can request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> You can request deletion of your data (subject to legal obligations)</li>
              <li><strong>Opt-out:</strong> You can opt-out of marketing communications</li>
              <li><strong>Data Portability:</strong> You can request your data in a portable format</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise these rights, please contact us at 
              <a href="mailto:privacy@example.com" className="text-orange-500 hover:text-orange-600 ml-1">
                privacy@example.com
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our website is not intended for children under 13 years of age. We do not knowingly collect personal information 
              from children under 13. If we discover that a child under 13 has provided us with personal information, we will 
              delete such information immediately. If you believe we have collected information from a child under 13, please 
              contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">10. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes 
              outlined in this policy. You may request deletion of your data at any time, subject to legal and contractual obligations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">11. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              If you are accessing our website from outside of India, please be aware that your information may be transferred to, 
              stored in, and processed in India and other countries. These countries may have data protection laws that differ from 
              your country of origin.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about this Privacy Policy or Niklaus Solutions privacy practices, please contact us at:
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Email: <a href="mailto:privacy@niklaussolutions.com" className="text-orange-500 hover:text-orange-600">privacy@niklaussolutions.com</a>
            </p>
          </section>

          <section className="mb-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Last Updated:</strong> December 2024
            </p>
            <p className="text-sm text-gray-600 mt-2">
              We reserve the right to modify this Privacy Policy at any time. Changes will be effective immediately upon posting. 
              Your continued use of our website constitutes your acceptance of the updated Privacy Policy.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
