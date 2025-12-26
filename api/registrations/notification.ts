import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== API Called ===');
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  
  // CORS headers - MUST be set first
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, PATCH, DELETE, POST, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request - returning 200');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const details = req.body;
    console.log('Registration details received:', JSON.stringify(details));
    
    // Fetch EmailJS credentials from environment variables
    const serviceID = process.env.EMAILJS_SERVICE_ID;
    const templateID = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    console.log('=== Environment Variables Check ===');
    console.log('serviceID exists:', !!serviceID, 'value:', serviceID);
    console.log('templateID exists:', !!templateID, 'value:', templateID);
    console.log('publicKey exists:', !!publicKey, 'value:', publicKey);
    console.log('privateKey exists:', !!privateKey, 'value:', privateKey);

    if (!serviceID || !templateID || !publicKey || !privateKey) {
      console.error('❌ Missing EmailJS credentials');
      return res.status(500).json({ 
        error: 'Missing EmailJS credentials',
        provided: {
          serviceID: !!serviceID,
          templateID: !!templateID,
          publicKey: !!publicKey,
          privateKey: !!privateKey,
        }
      });
    }

    console.log('✅ All credentials found');

    // Format registration details for the email
    const registrationDetailsString = Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const templateParams = {
      ...details,
      registration_details: registrationDetailsString,
      to_email: 'niklaussolution@gmail.com',
    };

    console.log('Template params prepared:', JSON.stringify(templateParams));

    // EmailJS REST API endpoint
    const url = `https://api.emailjs.com/api/v1.0/email/send`;

    console.log('🔄 Sending request to EmailJS...');
    console.log('URL:', url);
    console.log('Service ID:', serviceID);
    console.log('Template ID:', templateID);

    const response = await axios.post(url, {
      service_id: serviceID,
      template_id: templateID,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: templateParams,
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('✅ EmailJS Response Status:', response.status);
    console.log('✅ EmailJS Response Data:', JSON.stringify(response.data));
    
    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully', 
      data: response.data 
    });
  } catch (error: any) {
    console.error('❌ ERROR DETAILS:');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data));
      console.error('Response Headers:', JSON.stringify(error.response.headers));
    } else if (error.request) {
      console.error('Request made but no response:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    return res.status(500).json({ 
      error: error?.response?.data?.message || error.message || 'Failed to send email',
      details: error?.response?.data,
      errorType: error.constructor.name
    });
  }
}
