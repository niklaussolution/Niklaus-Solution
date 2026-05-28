import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== API Called ===');
  console.log('Method:', req.method);
  console.log('Body:', JSON.stringify(req.body));
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, PATCH, DELETE, POST, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

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
    
    // Get email credentials from environment
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASSWORD;
    const emailTo = 'niklaussolution@gmail.com';

    console.log('=== Email Service Setup ===');
    console.log('emailUser exists:', !!emailUser);
    console.log('emailPass exists:', !!emailPass);

    if (!emailUser || !emailPass) {
      console.error('❌ Missing email credentials');
      return res.status(500).json({ 
        error: 'Email service not configured',
        details: 'Missing EMAIL_USER or EMAIL_PASSWORD environment variables'
      });
    }

    // Create transporter using Gmail SMTP
    console.log('Creating nodemailer transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Verify transporter connection
    console.log('Verifying transporter connection...');
    try {
      await transporter.verify();
      console.log('✅ Transporter verified successfully');
    } catch (verifyError: any) {
      console.error('❌ Transporter verification failed:', verifyError.message);
      throw verifyError;
    }

    // Format email content
    const registrationDetailsString = Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const mailOptions = {
      from: emailUser,
      to: emailTo,
      subject: `New Workshop Registration - ${details.workshop || 'Workshop'}`,
      html: `
        <h2>New Registration Received</h2>
        <p><strong>Registration Details:</strong></p>
        <pre>${registrationDetailsString}</pre>
        <hr>
        <p><small>This email was sent from your workshop registration system.</small></p>
      `,
      text: `New Registration:\n\n${registrationDetailsString}`,
    };

    console.log('📧 Sending email to:', emailTo);
    console.log('Email subject:', mailOptions.subject);

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);

    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: info.messageId
    });

  } catch (error: any) {
    console.error('❌ ERROR DETAILS:');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Full Error:', JSON.stringify(error, null, 2));
    
    return res.status(500).json({ 
      error: error.message || 'Failed to send email',
      errorType: error.constructor.name,
      code: error.code
    });
  }
}
