import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_SECRET_KEY || '',
});

export default async (req: VercelRequest, res: VercelResponse) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { registrationId, orderId, paymentId, signature } = req.body;

    // Validation
    if (!registrationId || !orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification data',
      });
    }

    // Verify signature
    const secretKey = process.env.RAZORPAY_SECRET_KEY;
    if (!secretKey) {
      throw new Error('RAZORPAY_SECRET_KEY environment variable is not set');
    }

    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    // Get payment details from Razorpay to verify it was captured
    const payment = await razorpay.payments.fetch(paymentId);

    // Check if payment is captured or authorized
    if (payment.status !== 'captured' && payment.status !== 'authorized') {
      return res.status(400).json({
        success: false,
        message: `Payment status is ${payment.status}, not captured or authorized`,
      });
    }

    // Return success - payment verified
    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        registrationId,
        paymentId,
        status: 'Confirmed',
        paymentStatus: payment.status,
        amount: payment.amount,
        email: payment.email,
      },
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message,
    });
  }
};
