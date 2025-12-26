import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers - MUST be set first
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, PATCH, DELETE, POST, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const details = req.body;
    // Fetch EmailJS credentials from environment variables
    const serviceID = process.env.EMAILJS_SERVICE_ID;
    const templateID = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

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
      to_email: 'niklaussolution@gmail.com',
    };

    // EmailJS REST API endpoint - using server-side authentication
    const url = `https://api.emailjs.com/api/v1.0/email/send/`;

    const response = await axios.post(url, 
      {
        service_id: serviceID,
        template_id: templateID,
        user_id: publicKey,
        template_params: templateParams,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        auth: {
          username: publicKey,
          password: privateKey,
        }
      }
    );

    return res.status(200).json({ success: true, message: 'Email sent successfully', data: response.data });
  } catch (error: any) {
    console.error('EmailJS API error:', error?.response?.data || error.message);
    return res.status(500).json({ error: error?.response?.data?.message || error.message || 'Failed to send email' });
  }
}
