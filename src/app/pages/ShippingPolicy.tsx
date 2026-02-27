import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function ShippingPolicy() {
  const navigate = useNavigate();

  // Set SEO meta tags for Shipping Policy page
  useEffect(() => {
    document.title = "Shipping Policy - Niklaus Solutions | Delivery Information";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Shipping Policy for Niklaus Solutions. Learn about our shipping methods, delivery times, and shipping costs for workshop materials and certificates.");
    }
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", "Shipping Policy - Niklaus Solutions");
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute("content", "Shipping Policy - Niklaus Solutions. Learn about delivery and shipping.");
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", "https://theniklaus.com/shipping-policy");
    
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute("content", "Shipping Policy - Niklaus Solutions");
    
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute("content", "Shipping Policy - Niklaus Solutions");
    
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link') as HTMLLinkElement;
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = 'https://theniklaus.com/shipping-policy';
    
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Shipping & Delivery Policy</h1>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed">
              This Shipping Policy outlines the terms and conditions for the delivery of physical materials, 
              including certificates, course materials, merchandise, and other tangible products related to 
              Niklaus Solutions workshops, training programs, and courses (including Ethical Hacking, Full Stack Web Development, 
              UI/UX Design, Generative AI, WordPress Development, and Bug Bounty Hunting courses).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Deliverable Items</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We ship the following items after course/workshop completion:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Industry-recognized Certificates of Completion</li>
              <li>Course materials and workbooks</li>
              <li>Printed project portfolios</li>
              <li>Merchandise and branded items</li>
              <li>Resource DVDs/USBs (where applicable)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>Digital Delivery:</strong> Course materials, certificates, and resources are primarily delivered 
              digitally through our platform upon completion. Physical shipments are provided only for specific materials as requested.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Shipping Costs</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Digital Materials (Certificates & Course Content): FREE - Instantly delivered to your dashboard
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Physical Shipments (Optional): Applicable charges as follows:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Standard Delivery Pan-India: Rs. 99 - Rs. 299 (based on location)</li>
              <li>Express Delivery (Metro Cities): Rs. 399 - Rs. 599</li>
              <li>Certificate/Material packages: May qualify for free shipping above certain order values</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              All applicable shipping charges will be clearly displayed before checkout.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Delivery Timeframes</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Digital Delivery (Certificates & Course Materials): Instant - Available immediately upon completion
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Physical Shipments: The following timeframes are estimates:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Standard Delivery: 7-14 business days from order confirmation</li>
              <li>Express Delivery (Metro): 3-5 business days from order confirmation</li>
              <li>Free Trial Course Materials: Immediate digital access to all resources</li>
              <li>Delivery times do not include weekends and public holidays</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Shipping Restrictions</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We currently provide services to the following regions:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>India (All states and union territories)</li>
              <li>International shipping available for digital courses and materials only</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>For International Participants:</strong> All course materials, certificates, and resources are delivered 
              digitally. For physical material shipments internationally, please contact our support team for custom arrangements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Tracking Your Order</h2>
            <p className="text-gray-700 leading-relaxed">
              Once your order is shipped, you will receive a tracking number via email. You can use this 
              number to track your package in real-time with the courier service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Damaged or Lost Packages</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              In the event that your package arrives damaged or lost:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Report the issue within 48 hours of delivery</li>
              <li>Provide photographic evidence of damage</li>
              <li>Include your order number and tracking details</li>
              <li>We will work with the courier to file a claim or arrange replacement</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Address Changes</h2>
            <p className="text-gray-700 leading-relaxed">
              If you need to change your shipping address, please contact us immediately after placing 
              your order. We will attempt to update the address before the package is dispatched. Once 
              shipped, address changes may not be possible.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              For any questions regarding shipping or delivery of Niklaus Solutions course materials and certificates, 
              please contact our support team at 
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
              We reserve the right to modify this Shipping Policy at any time. Changes will be effective 
              immediately upon posting to this page.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
