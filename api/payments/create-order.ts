import { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';

// Initialize Razorpay with credentials from environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_SECRET_KEY || '',
});

// Helper function to create registration in Firestore using REST API
async function createFirestoreRegistration(registrationData: any) {
  try {
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
    
    if (!projectId || !apiKey) {
      console.error('Firebase configuration missing');
      return null;
    }

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/registrations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          fields: {
            userName: { stringValue: registrationData.userName },
            email: { stringValue: registrationData.email },
            phone: { stringValue: registrationData.phone },
            workshopId: { stringValue: registrationData.workshopId },
            workshopTitle: { stringValue: registrationData.workshopTitle },
            organization: { stringValue: registrationData.organization },
            amount: { doubleValue: registrationData.amount },
            status: { stringValue: 'Pending' },
            paymentStatus: { stringValue: 'Pending' },
            registrationDate: { stringValue: new Date().toISOString() },
            createdAt: { integerValue: Date.now().toString() },
            updatedAt: { integerValue: Date.now().toString() },
          },
        }),
      }
    );

    if (response.ok) {
      const result = await response.json();
      // Extract document ID from the response
      const docId = result.name?.split('/').pop();
      return docId;
    } else {
      console.error('Firestore API error:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error creating Firestore registration:', error);
    return null;
  }
}

// Helper function to update registration with order ID
async function updateFirestoreRegistrationWithOrderId(registrationId: string, orderId: string) {
  try {
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
    
    if (!projectId || !apiKey) {
      return false;
    }

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/registrations/${registrationId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          fields: {
            paymentId: { stringValue: orderId },
            updatedAt: { integerValue: Date.now().toString() },
          },
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error updating Firestore registration:', error);
    return false;
  }
}

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

    // Create initial registration in Firestore
    const registrationData = {
      userName,
      email,
      phone,
      workshopId,
      workshopTitle,
      organization,
      amount,
    };

    let registrationId = await createFirestoreRegistration(registrationData);
    
    // Fallback if Firestore creation fails
    if (!registrationId) {
      registrationId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

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

    // Update registration with order ID
    if (registrationId && !registrationId.startsWith('REG-')) {
      await updateFirestoreRegistrationWithOrderId(registrationId, order.id);
    }

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
