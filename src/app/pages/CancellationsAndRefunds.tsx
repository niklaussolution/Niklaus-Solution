import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function CancellationsAndRefunds() {
  const navigate = useNavigate();

  // Set SEO meta tags for Cancellations and Refunds page
  useEffect(() => {
    document.title = "Cancellations & Refunds Policy - Niklaus Solutions";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Cancellations and Refunds Policy for Niklaus Solutions. Learn about our refund process, cancellation procedures, and policies.");
    }
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", "Cancellations & Refunds Policy - Niklaus Solutions");
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute("content", "Cancellations and Refunds Policy - Niklaus Solutions");
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", "https://theniklaus.com/cancellations-and-refunds");
    
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute("content", "Cancellations & Refunds Policy - Niklaus Solutions");
    
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute("content", "Cancellations and Refunds Policy - Niklaus Solutions");
    
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link') as HTMLLinkElement;
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = 'https://theniklaus.com/cancellations-and-refunds';
    
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Cancellations and Refunds Policy - Niklaus Solutions</h1>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">1. Cancellation Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Niklaus Solutions offers a flexible cancellation policy for workshop and course registrations:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Full Refund (100%):</strong> If cancelled more than 30 days before workshop/course start date</li>
              <li><strong>75% Refund:</strong> If cancelled 15-30 days before workshop/course start date</li>
              <li><strong>50% Refund:</strong> If cancelled 7-15 days before workshop/course start date</li>
              <li><strong>No Refund (0%):</strong> If cancelled less than 7 days before workshop/course start date</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>Free Trial Courses:</strong> Free trial registrations cannot be cancelled as they offer zero fees and full access. 
              Simply discontinue accessing the trial course.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. How to Request Cancellation</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To cancel your Niklaus Solutions workshop or course registration:
            </p>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li>Log into your Niklaus Solutions account dashboard</li>
              <li>Go to "My Registrations" or "My Courses"</li>
              <li>Select the workshop/course you wish to cancel</li>
              <li>Click "Request Cancellation"</li>
              <li>Provide a reason for cancellation (optional)</li>
              <li>Confirm your cancellation request</li>
            </ol>
            <p className="text-gray-700 leading-relaxed mt-4">
              Alternatively, email us at 
              <a href="mailto:support@niklaussolutions.com" className="text-orange-500 hover:text-orange-600 ml-1">
                support@niklaussolutions.com
              </a> with your order ID and workshop/course name.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. Processing Time</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cancellation requests are processed within 2-3 business days. Once approved:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Refunds are initiated to the original payment method</li>
              <li>It may take 5-7 business days for the refund to reflect in your account</li>
              <li>You will receive a confirmation email once the refund is processed</li>
              <li>Bank processing times may vary depending on your financial institution</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">4. Non-Refundable Items</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The following are non-refundable:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Administrative fees or processing fees</li>
              <li>Payment gateway transaction charges</li>
              <li>Scholarships or promotional discounts already applied</li>
              <li>Any value added services beyond the core workshop</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">5. Workshop Rescheduling</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Instead of cancelling, you may reschedule to a different batch:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Free rescheduling is available for any future date/batch</li>
              <li>Submit reschedule requests at least 7 days before the workshop</li>
              <li>Subject to availability of the desired batch</li>
              <li>No additional charges for rescheduling</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">6. Special Circumstances</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              In case of special circumstances such as:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Medical emergencies</li>
              <li>Bereavement</li>
              <li>Job displacement</li>
              <li>Other exceptional situations</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              We may offer full refunds or future credits. Please contact our support team with documentation 
              of the circumstances.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">7. No-Show Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you register for a workshop but do not attend:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>No refund will be issued</li>
              <li>You may use your registration for a future batch (subject to availability)</li>
              <li>Contact us within 7 days of the workshop date if you were unable to attend</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">8. Cancellation by Company</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              In rare cases, we may need to cancel a workshop due to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Insufficient registrations</li>
              <li>Unforeseen circumstances or natural disasters</li>
              <li>Trainer unavailability</li>
              <li>Other compelling reasons beyond our control</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              In such cases, we will provide full refunds or transfer to another workshop batch of equal value.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">9. Refund Methods</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Refunds are processed using the following methods:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Credit/Debit Cards:</strong> Refunded to the same card</li>
              <li><strong>Digital Wallets:</strong> Refunded to the original wallet</li>
              <li><strong>Bank Transfer:</strong> Refunded to the registered bank account</li>
              <li><strong>In case of issues:</strong> Contact our support team</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">10. Disputes and Grievances</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have a dispute regarding a cancellation or refund, please:
            </p>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li>Contact our support team within 30 days of the transaction</li>
              <li>Provide relevant order details and documentation</li>
              <li>We will investigate and respond within 7 business days</li>
              <li>If unsatisfied, you may escalate to our management team</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              For cancellation or refund inquiries related to Niklaus Solutions courses and workshops, please contact our support team at 
              <a href="mailto:support@niklaussolutions.com" className="text-orange-500 hover:text-orange-600 ml-1">
                support@niklaussolutions.com
              </a>
            </p>
          </section>

          <section className="mb-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Last Updated:</strong> December 2024
            </p>
            <p className="text-sm text-gray-600 mt-2">
              We reserve the right to modify this policy at any time. Changes will be effective immediately.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
