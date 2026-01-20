import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../admin/config/firebase";
import { doc, getDoc } from "firebase/firestore";

interface FooterContent {
  company: {
    name: string;
    nameHighlight: string;
    description: string;
  };
  contact: {
    emails: string[];
    phones: string[];
    address: string;
  };
  copyright: string;
}

export function Footer() {
  const [footerContent, setFooterContent] = useState<FooterContent | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFooterContent = async () => {
      try {
        const docRef = doc(db, "content", "footer");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFooterContent(docSnap.data() as FooterContent);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchFooterContent();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading || !footerContent) {
    return (
      <footer id="contact" className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer id="contact" className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {footerContent.company.name} <span className="text-orange-500">{footerContent.company.nameHighlight}</span>
            </h3>
            <p className="text-gray-400 mb-6">
              {footerContent.company.description}
            </p>
            <div className="flex gap-3">
              <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Facebook size={18} />
              </button>
              <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Twitter size={18} />
              </button>
              <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Instagram size={18} />
              </button>
              <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Linkedin size={18} />
              </button>
              <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Youtube size={18} />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection("home")}
                  className="hover:text-orange-500 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("workshops")}
                  className="hover:text-orange-500 transition-colors"
                >
                  Workshops
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("about")}
                  className="hover:text-orange-500 transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="hover:text-orange-500 transition-colors"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("workshops")}
                  className="hover:text-orange-500 transition-colors"
                >
                  Register
                </button>
              </li>
            </ul>
          </div>

          {/* Workshops */}
          <div>
            <h4 className="text-white font-bold mb-4">Popular Workshops</h4>
            <ul className="space-y-3">
              <li className="hover:text-orange-500 transition-colors cursor-pointer">
                Ethical Hacking
              </li>
              <li className="hover:text-orange-500 transition-colors cursor-pointer">
                Full Stack Development
              </li>
              <li className="hover:text-orange-500 transition-colors cursor-pointer">
                AI & Machine Learning
              </li>
              <li className="hover:text-orange-500 transition-colors cursor-pointer">
                Cyber Security
              </li>
              <li className="hover:text-orange-500 transition-colors cursor-pointer">
                Cloud Computing
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail size={20} className="text-orange-500 shrink-0 mt-1" />
                <div>
                  {footerContent.contact.emails.map((email, index) => (
                    <div key={index}>
                      <a
                        href={`mailto:${email}`}
                        className="hover:text-orange-500 transition-colors"
                      >
                        {email}
                      </a>
                      {index < footerContent.contact.emails.length - 1 && <br />}
                    </div>
                  ))}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={20} className="text-orange-500 shrink-0 mt-1" />
                <div>
                  {footerContent.contact.phones.map((phone, index) => (
                    <div key={index}>
                      <a href={`tel:${phone}`} className="hover:text-orange-500 transition-colors">
                        {phone}
                      </a>
                      {index < footerContent.contact.phones.length - 1 && <br />}
                    </div>
                  ))}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-orange-500 flex-shrink-0 mt-1" />
                <span>
                  {footerContent.contact.address}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            {footerContent.copyright}
          </p>
          <div className="flex gap-6 text-sm flex-wrap justify-center md:justify-end">
            <button 
              onClick={() => navigate("/privacy-policy")}
              className="hover:text-orange-500 transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => navigate("/terms-and-conditions")}
              className="hover:text-orange-500 transition-colors"
            >
              Terms of Service
            </button>
            <button 
              onClick={() => navigate("/cancellations-and-refunds")}
              className="hover:text-orange-500 transition-colors"
            >
              Cancellations & Refunds
            </button>
            <button 
              onClick={() => navigate("/shipping-policy")}
              className="hover:text-orange-500 transition-colors"
            >
              Shipping Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
