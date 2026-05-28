// src/utils/emailForwarder.ts
// Utility to send registration details to team member using emailjs
import emailjs from '@emailjs/browser';

export interface RegistrationDetails {
  name: string;
  email: string;
  phone?: string;
  [key: string]: any;
}

export async function forwardRegistrationToTeam(details: RegistrationDetails) {

  // Fetch EmailJS credentials from environment variables (Vite style)
  const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;


  // Prepare a formatted string with all registration details for the team
  const registrationDetailsString = Object.entries(details)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  const templateParams = {
    ...details,
    registration_details: registrationDetailsString, // For use in the email template
    to_email: 'team_member@example.com', // Change to your team member's email
  };

  try {
    const result = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );
    return result;
  } catch (error) {
    console.error('EmailJS forwarding error:', error);
    throw error;
  }
}
