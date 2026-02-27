import React, { createContext, useContext, useState } from 'react';

interface ContactFormContextType {
  isContactFormOpen: boolean;
  setIsContactFormOpen: (open: boolean) => void;
  openContactForm: () => void;
  closeContactForm: () => void;
}

const ContactFormContext = createContext<ContactFormContextType | undefined>(undefined);

export function ContactFormProvider({ children }: { children: React.ReactNode }) {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  const openContactForm = () => setIsContactFormOpen(true);
  const closeContactForm = () => setIsContactFormOpen(false);

  return (
    <ContactFormContext.Provider
      value={{
        isContactFormOpen,
        setIsContactFormOpen,
        openContactForm,
        closeContactForm,
      }}
    >
      {children}
    </ContactFormContext.Provider>
  );
}

export function useContactForm() {
  const context = useContext(ContactFormContext);
  if (context === undefined) {
    throw new Error('useContactForm must be used within ContactFormProvider');
  }
  return context;
}
