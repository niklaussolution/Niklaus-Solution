import { Request, Response } from 'express';
import { getDatabase } from '../config/database';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  getPaymentDetails,
} from '../services/razorpayService';
import { generateBillPDF, getBillAsFile } from '../services/billService';
import { sendBillEmail, sendAdminNotification } from '../services/emailService';
import { IRegistration, REGISTRATIONS_COLLECTION } from '../models/Registration';

const db = getDatabase();

/**
 * Create payment order for workshop registration
 */
export const createPaymentOrder = async (req: Request, res: Response) => {
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
    if (
      !userName ||
      !email ||
      !phone ||
      !workshopId ||
      !workshopTitle ||
      !organization ||
      !amount
    ) {
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

    // Create a temporary registration record
    const tempRegistration: IRegistration = {
      userName,
      email,
      phone,
      workshopId,
      workshopTitle: workshopTitle || '',
      status: 'Pending',
      paymentStatus: 'Pending',
      amount,
      registrationDate: new Date().toISOString(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const docRef = await db
      .collection(REGISTRATIONS_COLLECTION)
      .add(tempRegistration);
    const registrationId = docRef.id;

    // Create Razorpay order
    const orderResponse = await createRazorpayOrder({
      amount,
      currency: 'INR',
      receipt: `reg_${registrationId}`,
      notes: {
        userName,
        email,
        workshopId,
        workshopTitle,
      },
    });

    if (!orderResponse.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
        error: orderResponse.error,
      });
    }

    // Update registration with order ID
    await db
      .collection(REGISTRATIONS_COLLECTION)
      .doc(registrationId)
      .update({
        paymentId: orderResponse.orderId,
        updatedAt: Date.now(),
      });

    res.status(200).json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        registrationId,
        orderId: orderResponse.orderId,
        amount: ((orderResponse.amount as number) ?? 0) / 100, // Convert back to rupees
        currency: orderResponse.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error: any) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment order',
      error: error.message,
    });
  }
};

/**
 * Verify payment and complete registration
 */
export const verifyPayment = async (req: Request, res: Response) => {
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
    const isSignatureValid = verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
    });

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    // Get payment details from Razorpay
    const paymentDetails = await getPaymentDetails(paymentId);

    if (!paymentDetails.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to verify payment',
        error: paymentDetails.error,
      });
    }

    // Update registration with payment details
    const registrationRef = await db
      .collection(REGISTRATIONS_COLLECTION)
      .doc(registrationId)
      .get();

    if (!registrationRef.exists) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    const registration = registrationRef.data() as IRegistration;

    // Update registration status
    await db
      .collection(REGISTRATIONS_COLLECTION)
      .doc(registrationId)
      .update({
        paymentStatus: 'Completed',
        paymentId: paymentId,
        status: 'Confirmed',
        confirmationDate: new Date().toISOString(),
        updatedAt: Date.now(),
      });

    // Generate bill
    const billData = {
      registrationId,
      userName: registration.userName,
      email: registration.email,
      phone: registration.phone,
      organization: registration.userName, // You can add this to the model
      workshopTitle: registration.workshopTitle || '',
      workshopId: registration.workshopId,
      amount: registration.amount,
      paymentId: paymentId,
      paymentDate: new Date().toLocaleString(),
      billDate: new Date().toLocaleDateString(),
      gstPercentage: 18,
    };

    const billFile = await getBillAsFile(billData);

    // Send bill email
    const emailResponse = await sendBillEmail({
      recipientEmail: registration.email,
      recipientName: registration.userName,
      billBuffer: billFile.buffer,
      billFilename: billFile.filename,
      workshopTitle: registration.workshopTitle || '',
      registrationId,
      amount: registration.amount,
    });

    // Send admin notification
    await sendAdminNotification(
      registration.workshopTitle || '',
      registration.userName,
      registration.email,
      registration.phone,
      registration.userName,
      registrationId,
      registration.amount
    );

    res.status(200).json({
      success: true,
      message: 'Payment verified and registration completed successfully',
      data: {
        registrationId,
        paymentId,
        status: 'Confirmed',
        billDownloadUrl: `/api/registrations/${registrationId}/bill`,
      },
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message,
    });
  }
};

/**
 * Download bill as PDF
 */
export const downloadBill = async (req: Request, res: Response) => {
  try {
    const { registrationId } = req.params;

    // Get registration details
    const registrationRef = await db
      .collection(REGISTRATIONS_COLLECTION)
      .doc(registrationId)
      .get();

    if (!registrationRef.exists) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    const registration = registrationRef.data() as IRegistration;

    if (registration.paymentStatus !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Bill is only available for completed payments',
      });
    }

    // Generate bill
    const billData = {
      registrationId,
      userName: registration.userName,
      email: registration.email,
      phone: registration.phone,
      organization: registration.userName,
      workshopTitle: registration.workshopTitle || '',
      workshopId: registration.workshopId,
      amount: registration.amount,
      paymentId: registration.paymentId || '',
      paymentDate: registration.confirmationDate || new Date().toLocaleString(),
      billDate: new Date().toLocaleDateString(),
      gstPercentage: 18,
    };

    const billFile = await getBillAsFile(billData);

    // Send file as download
    res.setHeader('Content-Type', billFile.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${billFile.filename}"`
    );
    res.send(billFile.buffer);
  } catch (error: any) {
    console.error('Error downloading bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading bill',
      error: error.message,
    });
  }
};

/**
 * Handle payment failure
 */
export const handlePaymentFailure = async (req: Request, res: Response) => {
  try {
    const { registrationId, orderId, paymentId, error } = req.body;

    if (!registrationId) {
      return res.status(400).json({
        success: false,
        message: 'Registration ID is required',
      });
    }

    // Update registration with failed payment status
    await db
      .collection(REGISTRATIONS_COLLECTION)
      .doc(registrationId)
      .update({
        paymentStatus: 'Failed',
        status: 'Pending',
        updatedAt: Date.now(),
      });

    res.status(200).json({
      success: true,
      message: 'Payment failure recorded',
    });
  } catch (error: any) {
    console.error('Error handling payment failure:', error);
    res.status(500).json({
      success: false,
      message: 'Error handling payment failure',
      error: error.message,
    });
  }
};

export default {
  createPaymentOrder,
  verifyPayment,
  downloadBill,
  handlePaymentFailure,
};
