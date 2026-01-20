import express, { Router } from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  downloadBill,
  handlePaymentFailure,
} from '../controllers/paymentController';

const router: Router = express.Router();

/**
 * POST /api/payments/create-order
 * Create a Razorpay payment order for workshop registration
 */
router.post('/create-order', createPaymentOrder);

/**
 * POST /api/payments/verify
 * Verify payment signature and complete registration
 */
router.post('/verify', verifyPayment);

/**
 * GET /api/payments/bill/:registrationId
 * Download bill as PDF
 */
router.get('/bill/:registrationId', downloadBill);

/**
 * POST /api/payments/failure
 * Handle payment failure
 */
router.post('/failure', handlePaymentFailure);

export default router;
