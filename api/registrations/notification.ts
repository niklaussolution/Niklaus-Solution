import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const details = req.body;
    // Fetch EmailJS credentials from environment variables
    const serviceID = process.env.VITE_EMAILJS_SERVICE_ID || process.env.EMAILJS_SERVICE_ID;
    const templateID = process.env.VITE_EMAILJS_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.VITE_EMAILJS_PUBLIC_KEY || process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.VITE_EMAILJS_PRIVATE_KEY || process.env.EMAILJS_PRIVATE_KEY;

    if (!serviceID || !templateID || !publicKey || !privateKey) {
      console.error('Missing EmailJS credentials');
      return res.status(500).json({ error: 'Missing EmailJS credentials' });
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

    const response = await axios.post(url, {
      service_id: serviceID,
      template_id: templateID,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: templateParams,
    });

    return res.status(200).json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('EmailJS API error:', error?.response?.data || error.message);
    return res.status(500).json({ error: error?.response?.data || error.message });
  }
}
