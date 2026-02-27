import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { db } from "../../admin/config/firebase";
import { collection, getDocs } from "firebase/firestore";

interface WhatsAppSettings {
  phoneNumber: string;
  message: string;
}

export function WhatsAppButton() {
  const [settings, setSettings] = useState<WhatsAppSettings>({
    phoneNumber: "919999999999",
    message: "Hi! I'm interested in learning more about your workshops.",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWhatsAppSettings();
    
    // Refresh settings every 5 seconds to catch updates
    const interval = setInterval(fetchWhatsAppSettings, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchWhatsAppSettings = async () => {
    try {
      const settingsRef = collection(db, "settings");
      const querySnapshot = await getDocs(settingsRef);
      const settingsObj: any = {};
      
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        settingsObj[data.key] = data.value;
      });

      // Use default values if settings don't exist
      const phoneNumber = settingsObj.whatsapp_phone || "919999999999";
      const message = settingsObj.whatsapp_message || "Hi! I'm interested in learning more about your workshops.";
      
      setSettings({
        phoneNumber,
        message,
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://wa.me/${settings.phoneNumber}?text=${encodeURIComponent(settings.message)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (loading) return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 md:w-16 md:h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-colors group"
      aria-label="Chat on WhatsApp"
    >
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
        alt="WhatsApp"
        className="w-6 h-6 md:w-8 md:h-8"
      />
      
      {/* Tooltip */}
      <div className="absolute right-full mr-3 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Chat with us on WhatsApp!
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full border-8 border-transparent border-l-gray-900"></div>
      </div>

      {/* Pulse Animation */}
      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
    </motion.button>
  );
}
