import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader,
  Download,
  Mail,
} from 'lucide-react';

interface PaymentFormProps {
  registrationData: {
    fullName: string;
    email: string;
    phone: string;
    organization: string;
    workshopId: string;
    workshopTitle: string;
    amount: number;
  };
  onClose: () => void;
}

interface PaymentResponse {
  success: boolean;
  data: {
    registrationId: string;
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  };
  message?: string;
}

interface VerificationResponse {
  success: boolean;
  data?: {
    registrationId: string;
    paymentId: string;
    status: string;
    billDownloadUrl: string;
  };
  message?: string;
}

export function PaymentForm({ registrationData, onClose }: PaymentFormProps) {
  const [step, setStep] = useState<'payment' | 'processing' | 'success'>('payment');
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationId, setRegistrationId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentId: string;
    billUrl: string;
  } | null>(null);
  const [error, setError] = useState('');

  // Load Razorpay script on mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      console.log('Initiating payment with data:', registrationData);
      
      // Create payment order
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: registrationData.fullName,
          email: registrationData.email,
          phone: registrationData.phone,
          workshopId: registrationData.workshopId,
          workshopTitle: registrationData.workshopTitle,
          organization: registrationData.organization,
          amount: registrationData.amount,
        }),
      });

      const data: PaymentResponse = await response.json();

      if (!data.success) {
        setError(data.message || 'Failed to create payment order');
        console.error('Payment order error:', data);
        setIsProcessing(false);
        return;
      }

      console.log('Payment order created:', data.data);

      setRegistrationId(data.data.registrationId);
      setOrderId(data.data.orderId);

      // Open Razorpay checkout
      openRazorpayCheckout(
        data.data.keyId,
        data.data.orderId,
        data.data.amount,
        data.data.registrationId
      );

      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment');
      console.error('Payment initiation error:', err);
      setIsProcessing(false);
    }
  };

  const openRazorpayCheckout = (
    keyId: string,
    orderId: string,
    amount: number,
    regId: string
  ) => {
    const options = {
      key: keyId,
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      name: 'Niklaus Solutions',
      description: `Workshop Registration - ${registrationData.workshopTitle}`,
      order_id: orderId,
      prefill: {
        name: registrationData.fullName,
        email: registrationData.email,
        contact: registrationData.phone,
      },
      handler: (response: any) => {
        verifyPayment(
          regId,
          orderId,
          response.razorpay_payment_id,
          response.razorpay_signature
        );
      },
      modal: {
        ondismiss: () => {
          setError('Payment cancelled by user');
        },
      },
      theme: {
        color: '#1e40af',
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  const verifyPayment = async (
    regId: string,
    orderId: string,
    paymentId: string,
    signature: string
  ) => {
    setStep('processing');
    setIsProcessing(true);

    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId: regId,
          orderId,
          paymentId,
          signature,
        }),
      });

      const data: VerificationResponse = await response.json();

      if (!data.success) {
        setError(data.message || 'Payment verification failed');
        setStep('payment');
        setIsProcessing(false);
        return;
      }

      setPaymentDetails({
        paymentId,
        billUrl: data.data?.billDownloadUrl || '',
      });

      setStep('success');
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || 'Payment verification failed');
      setStep('payment');
      setIsProcessing(false);
    }
  };

  const downloadBill = async () => {
    if (!paymentDetails) return;

    try {
      const response = await fetch(`/api/payments${paymentDetails.billUrl}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bill_${registrationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading bill:', err);
    }
  };

  if (step === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="text-green-500" size={40} />
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Payment Successful! 🎉
            </h2>

            <p className="text-gray-600 mb-2">
              Your registration is confirmed for
            </p>
            <p className="text-lg font-semibold text-blue-600 mb-6">
              {registrationData.workshopTitle}
            </p>

            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration ID:</span>
                  <span className="font-semibold">{registrationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-semibold">
                    ₹{registrationData.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-green-600">Confirmed</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-gray-600">
                ✓ A confirmation email has been sent to <strong>{registrationData.email}</strong>
              </p>
              <p className="text-gray-600">
                ✓ Your bill is attached with workshop details
              </p>
              <p className="text-gray-600">
                ✓ You'll receive login credentials within 24 hours
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadBill}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all mb-3"
            >
              <Download size={20} />
              Download Bill (PDF)
            </motion.button>

            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all"
            >
              Close
            </button>

            <p className="text-xs text-gray-500 mt-4">
              For any queries, contact support@theniklaus.com
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (step === 'processing') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Processing Payment
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your payment...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto"
      >
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <CreditCard className="text-blue-600" size={32} />
                Complete Payment
              </h2>
              <p className="text-gray-600 mt-1">
                Secure checkout powered by Razorpay
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3"
            >
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-red-700">{error}</p>
            </motion.div>
          )}

          {/* Order Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Workshop</span>
                <span className="font-semibold text-gray-900">
                  {registrationData.workshopTitle}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Participant Name</span>
                <span className="font-semibold text-gray-900">
                  {registrationData.fullName}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Email</span>
                <span className="font-semibold text-gray-900">
                  {registrationData.email}
                </span>
              </div>

              <div className="border-t border-blue-200 pt-3 mt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{registrationData.amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <Shield className="text-green-600" size={20} />
            <div className="text-sm">
              <p className="font-semibold text-green-900">Secure Payment</p>
              <p className="text-green-700">
                Your payment is encrypted and processed by Razorpay
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleInitiatePayment}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  Proceed to Payment
                </>
              )}
            </motion.button>

            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-full px-8 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-xs text-gray-600 text-center space-y-2">
            <p>💳 Razorpay accepts all major credit and debit cards</p>
            <p>
              For support:{' '}
              <a href="mailto:support@theniklaus.com" className="text-blue-600 hover:underline">
                support@theniklaus.com
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default PaymentForm;
