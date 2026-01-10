import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance with credentials from environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || (() => {
    throw new Error('RAZORPAY_KEY_ID environment variable is not set');
  })(),
  key_secret: process.env.RAZORPAY_SECRET_KEY || (() => {
    throw new Error('RAZORPAY_SECRET_KEY environment variable is not set');
  })(),
});

interface PaymentOrderParams {
  amount: number; // in paise (multiply by 100)
  currency?: string;
  receipt: string;
  notes?: {
    userName: string;
    email: string;
    workshopId: string;
    workshopTitle: string;
  };
}

interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

/**
 * Create a Razorpay order for workshop registration
 */
export async function createRazorpayOrder(params: PaymentOrderParams) {
  try {
    const orderData = {
      amount: params.amount * 100, // Convert to paise
      currency: params.currency || 'INR',
      receipt: params.receipt,
      notes: params.notes || {},
    };

    const order = await razorpay.orders.create(orderData);

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    };
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyPaymentSignature(params: VerifyPaymentParams): boolean {
  try {
    const { orderId, paymentId, signature } = params;

    // Create signature hash
    const secretKey = process.env.RAZORPAY_SECRET_KEY;
    if (!secretKey) {
      throw new Error('RAZORPAY_SECRET_KEY environment variable is not set');
    }
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest('hex');

    // Compare signatures
    return generatedSignature === signature;
  } catch (error: any) {
    console.error('Error verifying payment signature:', error);
    return false;
  }
}

/**
 * Fetch payment details from Razorpay
 */
export async function getPaymentDetails(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        created_at: payment.created_at,
      },
    };
  } catch (error: any) {
    console.error('Error fetching payment details:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Capture payment for a particular amount
 */
export async function capturePayment(
  paymentId: string,
  amount: number,
  currency: string = 'INR'
) {
  try {
    const payment = await razorpay.payments.capture(
      paymentId,
      amount * 100, // Convert to paise
      currency
    );
    return {
      success: true,
      payment: payment,
    };
  } catch (error: any) {
    console.error('Error capturing payment:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Refund a payment
 */
export async function refundPayment(
  paymentId: string,
  amount?: number,
  reason?: string
) {
  try {
    const refundData: any = {
      speed: 'normal',
    };

    if (amount) {
      refundData.amount = amount * 100; // Convert to paise
    }

    if (reason) {
      refundData.notes = {
        reason: reason,
      };
    }

    const refund = await razorpay.payments.refund(paymentId, refundData);

    return {
      success: true,
      refund: {
        id: refund.id,
        paymentId: refund.payment_id,
        amount: refund.amount,
        status: refund.status,
        created_at: refund.created_at,
      },
    };
  } catch (error: any) {
    console.error('Error refunding payment:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export default {
  createRazorpayOrder,
  verifyPaymentSignature,
  getPaymentDetails,
  capturePayment,
  refundPayment,
};
