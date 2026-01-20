import { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';

// Initialize Razorpay with credentials from environment variables
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
    const {
      userName,
      email,
      phone,
      workshopId,
      workshopTitle,
      organization,
      amount,
    } = req.body;

    // Validation
    if (!userName || !email || !phone || !workshopId || !workshopTitle || !organization || !amount) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0',
      });
    }

    // Generate registration ID (since we don't have a database)
    const registrationId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create Razorpay order
    const orderData = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `reg_${registrationId}`,
      notes: {
        userName,
        email,
        workshopId,
        workshopTitle,
        organization,
        registrationId,
      },
    };

    const order = await razorpay.orders.create(orderData);

    return res.status(200).json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        registrationId,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating payment order',
      error: error.message,
    });
  }
};
