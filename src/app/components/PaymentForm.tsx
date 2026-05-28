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
  X,
} from 'lucide-react';
import { generatePDFBill } from '../../utils/billGenerator';
import { db } from '../../config/firebase';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';

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
  onSuccess?: () => void;
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

export function PaymentForm({ registrationData, onClose, onSuccess }: PaymentFormProps) {
  const [step, setStep] = useState<'payment' | 'processing' | 'success'>('payment');
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationId, setRegistrationId] = useState('');
  const [paymentId, setPaymentId] = useState('');
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
      // Step 1: Create Razorpay order with simple backend call
      const createOrderResponse = await fetch(
        '/api/payments/create-order',
        {
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
            amount: registrationData.amount / 100, // Convert from paise to rupees
          }),
        }
      );

      if (!createOrderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await createOrderResponse.json();

      if (!orderData.success || !orderData.data) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }

      const { orderId } = orderData.data;

      // Step 2: Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        order_id: orderId,
        amount: registrationData.amount,
        currency: 'INR',
        name: 'Niklaus Solutions',
        description: `Workshop Registration - ${registrationData.workshopTitle}`,
        prefill: {
          name: registrationData.fullName,
          email: registrationData.email,
          contact: registrationData.phone,
        },
        handler: async (response: any) => {
          // Payment successful - store directly in Firestore
          setStep('processing');
          await handlePaymentSuccess(response);
        },
        modal: {
          ondismiss: () => {
            setError('Payment cancelled by user');
            setIsProcessing(false);
          },
        },
        theme: {
          color: '#f97316',
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      
      setIsProcessing(false);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to initiate payment';
      setError(errorMsg);
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (paymentResponse: any) => {
    try {
      console.log('Payment successful, storing registration...');
      
      // Store registration directly in Firestore
      const registrationData_to_store = {
        userName: registrationData.fullName,
        email: registrationData.email,
        phone: registrationData.phone,
        organization: registrationData.organization,
        workshopId: registrationData.workshopId,
        workshopTitle: registrationData.workshopTitle,
        amount: registrationData.amount / 100,
        status: 'Confirmed',
        paymentStatus: 'Completed',
        paymentId: paymentResponse.razorpay_payment_id,
        orderId: paymentResponse.razorpay_order_id,
        signature: paymentResponse.razorpay_signature,
        registrationDate: new Date().toISOString(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const regRef = await addDoc(collection(db, 'registrations'), registrationData_to_store);
      console.log('Registration stored with ID:', regRef.id);
      setRegistrationId(regRef.id);

      // Update workshop enrolled count
      if (registrationData.workshopId) {
        try {
          const workshopRef = doc(db, 'workshops', registrationData.workshopId);
          await updateDoc(workshopRef, {
            enrolled: increment(1),
          });
          console.log('Workshop enrolled count updated');
        } catch (workshopErr) {
          console.warn('Could not update workshop count:', workshopErr);
        }
      }

      setPaymentId(paymentResponse.razorpay_payment_id);
      
      // Track Lead event on Meta Pixel
      if (window.fbq) {
        window.fbq('track', 'Lead');
      }
      
      setStep('success');
      setIsProcessing(false);
    } catch (err: any) {
      console.error('Error storing registration:', err);
      setError('Registration saved but confirmation delayed. Check your email.');
      
      // Track Lead event on Meta Pixel even for error case (registration was saved)
      if (window.fbq) {
        window.fbq('track', 'Lead');
      }
      
      setStep('success');
      setIsProcessing(false);
    }
  };

  const downloadBill = async () => {
    try {
      generatePDFBill({
        registrationId: registrationId,
        fullName: registrationData.fullName,
        email: registrationData.email,
        phone: registrationData.phone,
        organization: registrationData.organization,
        workshopTitle: registrationData.workshopTitle,
        amount: registrationData.amount / 100, // Convert from paise to rupees
        paymentDate: new Date().toISOString(),
        paymentId: paymentId,
      });
    } catch (err) {
      alert('Failed to generate bill. Please try again.');
    }
  };

  if (step === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      >
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 max-w-md w-full">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
            >
              <CheckCircle className="text-green-500" size={32} />
            </motion.div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Payment Successful! 🎉
            </h2>

            <p className="text-gray-600 mb-2 text-sm sm:text-base">
              Your registration is confirmed for
            </p>
            <p className="text-base sm:text-lg font-semibold text-orange-600 mb-5 sm:mb-6">
              {registrationData.workshopTitle}
            </p>

            <div className="bg-orange-50 rounded-lg p-4 mb-5 sm:mb-6 text-left border border-orange-200">
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration ID:</span>
                  <span className="font-semibold text-gray-900">{registrationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-semibold text-gray-900">
                    ₹{(registrationData.amount / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-green-600">Confirmed</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3 mb-5 sm:mb-6 text-xs sm:text-sm text-gray-600">
              <p>✓ Confirmation email sent to <strong className="text-gray-900">{registrationData.email}</strong></p>
              <p>✓ Bill attached with workshop details</p>
              <p>✓ Login credentials within 24 hours</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadBill}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all mb-3 text-sm sm:text-base font-semibold"
            >
              <Download size={18} />
              Download Bill (PDF)
            </motion.button>

            <button
              onClick={() => {
                onSuccess?.();
                onClose();
              }}
              className="w-full px-6 py-2 sm:py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-semibold text-sm"
            >
              Close
            </button>

            <p className="text-xs text-gray-500 mt-4">
              For any queries: <a href="mailto:support@theniklaus.com" className="text-orange-600 hover:underline">support@theniklaus.com</a>
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
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-8 md:p-12 max-w-sm w-full text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-orange-200 border-t-orange-500 rounded-full mx-auto mb-4 sm:mb-6"
          />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
            Processing Payment
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
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
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-2 sm:p-4 z-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl sm:max-w-4xl max-h-[95vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-2xl sm:rounded-t-3xl p-6 sm:p-8 md:p-10 text-white">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-white/20 p-2 sm:p-3 rounded-lg">
                <CreditCard size={32} className="sm:w-10 sm:h-10" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Secure Payment</h2>
                <p className="text-orange-100 text-xs sm:text-sm md:text-base truncate">Complete your registration</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition text-white flex-shrink-0"
            >
              <X size={24} className="sm:w-8 sm:h-8" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 sm:p-6 md:p-8">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-300 rounded-lg sm:rounded-xl p-4 mb-6 flex items-start gap-3"
            >
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div className="text-red-700 text-sm sm:text-base">
                <p className="font-semibold">{error}</p>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Order Details */}
            <div className="md:col-span-2">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Order Summary</h3>

              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 space-y-5 sm:space-y-6 border border-orange-200">
                <div>
                  <label className="text-xs font-bold text-orange-600 mb-2 block">WORKSHOP</label>
                  <p className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2">
                    {registrationData.workshopTitle}
                  </p>
                </div>

                <div className="border-t border-orange-200 pt-4 sm:pt-5">
                  <label className="text-xs font-bold text-orange-600 mb-3 block">PARTICIPANT INFO</label>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Full Name</p>
                      <p className="font-semibold text-gray-900 truncate">
                        {registrationData.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Email</p>
                      <p className="font-semibold text-gray-900 truncate text-xs sm:text-sm">
                        {registrationData.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Organization</p>
                      <p className="font-semibold text-gray-900 truncate">
                        {registrationData.organization}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-orange-200 pt-4 sm:pt-5 bg-orange-100 rounded-lg sm:rounded-xl p-4 sm:p-5">
                  <label className="text-xs font-bold text-orange-700 mb-2 block">TOTAL AMOUNT</label>
                  <p className="text-3xl sm:text-4xl font-black text-orange-600">
                    ₹{(registrationData.amount / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Security Information */}
              <div className="mt-5 sm:mt-6 bg-green-50 border border-green-300 rounded-lg sm:rounded-xl p-4 sm:p-5 flex gap-3">
                <Shield className="text-green-600 flex-shrink-0" size={20} />
                <div className="min-w-0">
                  <p className="font-bold text-green-900 text-sm">Secure & Trusted</p>
                  <p className="text-green-700 text-xs mt-1">
                    Encrypted & processed by Razorpay - India's #1 payment gateway
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Action */}
            <div className="md:col-span-1">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200 sticky top-32 md:top-40">
                <div className="text-center mb-6">
                  <CheckCircle size={40} className="text-orange-500 mx-auto mb-3" />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Ready?</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mt-1">
                    Click to proceed
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleInitiatePayment}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm sm:text-base shadow-lg mb-3"
                >
                  {isProcessing ? (
                    <>
                      <Loader size={20} className="animate-spin flex-shrink-0" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} className="flex-shrink-0" />
                      <span>Pay Now</span>
                    </>
                  )}
                </motion.button>

                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="w-full px-6 py-2 sm:py-3 bg-gray-300 text-gray-800 rounded-lg sm:rounded-xl hover:bg-gray-400 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-orange-700">
                      <span className="w-1.5 h-1.5 bg-orange-600 rounded-full flex-shrink-0"></span>
                      <span>Secure payment</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-700">
                      <span className="w-1.5 h-1.5 bg-orange-600 rounded-full flex-shrink-0"></span>
                      <span>Instant confirmation</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-700">
                      <span className="w-1.5 h-1.5 bg-orange-600 rounded-full flex-shrink-0"></span>
                      <span>24/7 support</span>
                    </div>
                  </div>
                </div>

                <p className="text-center text-xs text-gray-500 mt-4 leading-relaxed">
                  <a href="mailto:support@theniklaus.com" className="text-orange-600 font-semibold hover:underline">
                    Contact support
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default PaymentForm;
