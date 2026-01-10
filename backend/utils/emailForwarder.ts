// backend/utils/emailForwarder.ts
import axios from 'axios';

interface RegistrationDetails {
  [key: string]: any;
}

export async function forwardRegistrationToTeam(details: RegistrationDetails) {
  const serviceID = process.env.VITE_EMAILJS_SERVICE_ID || process.env.EMAILJS_SERVICE_ID;
  const templateID = process.env.VITE_EMAILJS_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.VITE_EMAILJS_PUBLIC_KEY || process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.VITE_EMAILJS_PRIVATE_KEY || process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceID || !templateID || !publicKey || !privateKey) {
    throw new Error('Missing EmailJS credentials in environment variables');
  }

  // Format registration details for the email
  const registrationDetailsString = Object.entries(details)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  const templateParams = {
    ...details,
    registration_details: registrationDetailsString,
    to_email: 'niklaussolution@gmail.com', // Change to your team member's email
  };

  // EmailJS REST API endpoint
  const url = `https://api.emailjs.com/api/v1.0/email/send`;

  try {
    const response = await axios.post(url, {
      service_id: serviceID,
      template_id: templateID,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: templateParams,
    });
    return response.data;
  } catch (error: any) {
    console.error('EmailJS API error:', error?.response?.data || error.message);
    throw error;
  }
}
