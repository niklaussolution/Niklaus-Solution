import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { db } from "../../admin/config/firebase";
import { doc, getDoc } from "firebase/firestore";

interface HeaderContent {
  logo: string;
  logoHighlight: string;
  menuItems: Array<{ label: string; id: string }>;
  ctaButton: string;
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [headerContent, setHeaderContent] = useState<HeaderContent | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHeaderContent = async () => {
      try {
        const docRef = doc(db, "content", "header");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHeaderContent(docSnap.data() as HeaderContent);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchHeaderContent();
  }, []);

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    
    // Contact always navigates to contact page
    if (id === "contact") {
      navigate("/contact");
      return;
    }

    // For other sections, try to scroll to element
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading || !headerContent) {
    return (
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 md:w-10 h-8 md:h-10 bg-gray-200 rounded animate-pulse mr-3"></div>
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <img 
              src="/icons/logo.png" 
              alt="Niklaus Solutions Logo" 
              className="h-8 md:h-10 mr-3"
            />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {headerContent.logo} <span className="text-orange-500">{headerContent.logoHighlight}</span>
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {headerContent.menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-gray-700 hover:text-orange-500 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button
              onClick={() => scrollToSection("workshops")}
              className="bg-orange-500 text-white px-6 py-2.5 rounded-lg hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg"
            >
              {headerContent.ctaButton}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-4 py-4 space-y-3">
              {headerContent.menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-lg transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => scrollToSection("workshops")}
                className="block w-full bg-orange-500 text-white px-4 py-2.5 rounded-lg hover:bg-orange-600 transition-colors"
              >
                {headerContent.ctaButton}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
