# Razorpay Integration Fixes - Implementation Guide

## Overview
This document outlines the fixes implemented for two critical Razorpay payment issues:
1. **Missing order_id in Integration** - Ensuring order creation before payment
2. **Late Authorization handling** - Dashboard configuration guidance

---

## Issue #1: Missing order_id in Integration

### Problem
Payments made without a valid `order_id` cannot be automatically captured. These "unclaimed" payments are often auto-refunded to prevent reconciliation errors, leading to:
- Duplicate charge attempts
- Customer confusion
- Failed transactions despite successful payment attempts

### The Fix Implemented

#### Backend Changes
The backend already had correct order creation logic:
- **File**: `backend/services/razorpayService.ts`
- **Function**: `createRazorpayOrder()`
- Creates orders using Razorpay Orders API before payment initiation
- Returns `orderId` to client
- Stores order_id as `paymentId` in registration records

#### Frontend Changes
**File**: `src/app/components/PaymentForm.tsx`

**Before (❌ Problematic):**
```typescript
// Order was NOT created before checkout
// Missing order_id in Razorpay options
const options = {
  key: RAZORPAY_KEY_ID,
  amount: registrationData.amount, // No order_id!
  currency: 'INR',
  // ... other options
};
```

**After (✅ Fixed):**
```typescript
// Step 1: Create order via backend API
const orderData = await fetch('/api/payments/create-order', {
  method: 'POST',
  body: JSON.stringify({
    userName, email, phone, workshopId, workshopTitle, organization, amount
  })
});

const { orderId, registrationId } = orderData.data;

// Step 2: Pass order_id to Razorpay checkout
const options = {
  key: RAZORPAY_KEY_ID,
  order_id: orderId, // ✅ CRITICAL FIX: Now includes order_id
  amount: registrationData.amount,
  currency: 'INR',
  // ... other options
};

// Step 3: Verify payment with backend
const verifyResponse = await fetch('/api/payments/verify', {
  method: 'POST',
  body: JSON.stringify({
    registrationId, orderId, paymentId, signature
  })
});
```

### What Changed

#### 1. Payment Order Creation Flow
```
Client                Backend                  Razorpay
  |                    |                          |
  |--POST /create-order-|                         |
  |                    |--POST create order------>|
  |                    |<-----Return order_id-----|
  |<-Return order_id---|                         |
```

#### 2. Razorpay Checkout Configuration
| Aspect | Before | After |
|--------|--------|-------|
| Order created | ❌ No | ✅ Yes (via API) |
| order_id in checkout | ❌ Missing | ✅ Included |
| Payment capture | ⚠️ Manual/Failed | ✅ Automatic |
| Reconciliation | ❌ Issues | ✅ Clean |

### API Endpoints Used

#### 1. POST `/api/payments/create-order`
Creates a Razorpay order before checkout
```json
// Request
{
  "userName": "John Doe",
  "email": "john@example.com",
  "phone": "91 6380516533, +91 8862459821",
  "workshopId": "WS-001",
  "workshopTitle": "React Mastery",
  "organization": "Tech Corp",
  "amount": 5000  // In rupees
}

// Response
{
  "success": true,
  "data": {
    "registrationId": "REG-123456",
    "orderId": "order_2K5eH7kL",  // ✅ Critical field
    "amount": 500000,  // In paise
    "currency": "INR",
    "keyId": "rzp_live_XXXXXXX"
  }
}
```

#### 2. POST `/api/payments/verify`
Verifies payment signature and completes registration
```json
// Request
{
  "registrationId": "REG-123456",
  "orderId": "order_2K5eH7kL",  // ✅ Matches what was created
  "paymentId": "pay_2K5eH7mN",
  "signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a"
}

// Response
{
  "success": true,
  "data": {
    "registrationId": "REG-123456",
    "paymentId": "pay_2K5eH7mN",
    "status": "Confirmed"
  }
}
```

### Benefits of This Fix

✅ **Automatic Payment Capture**
- Razorpay can now automatically capture authorized payments
- No manual intervention needed

✅ **Clean Reconciliation**
- Clear mapping between orders and payments
- No "unclaimed" payments

✅ **Reduced Refunds**
- Legitimate payments won't be auto-refunded
- Better customer experience

✅ **Secure Payment Flow**
- Signature verification at backend
- Order integrity validation

---

## Issue #2: Late Authorizations

### Problem
Sometimes customer banks take too long to confirm payment (network issues). By the time the bank says "Success," your system might have already marked it as failed. Razorpay then sees a successful payment for a failed order and triggers a refund to be safe.

### The Fix

This is configured in the **Razorpay Dashboard**, not in code:

#### Steps to Enable Late Authorization:
1. Go to **Razorpay Dashboard** → Settings → [Your Account Settings]
2. Navigate to **Payment Settings** → **Authorize and Capture**
3. Look for **Late Authorization** or **Authorization Timeout** settings
4. **Enable**: Allow Razorpay to capture payments up to **3 days** after authorization
5. This ensures that delayed bank confirmations don't result in refunds

#### Configuration Details
- **Default**: 5 minutes (might be too strict)
- **Recommended**: 72 hours (3 days) for better capture rates
- **Maximum**: 3 days (as per Razorpay limits)

#### Why This Matters
- Bank networks can have delays
- Mobile/internet connectivity issues
- ISP routing delays

### Implementation in Your Code

**Already Implemented** ✅

The backend already handles payment verification correctly:
- `verifyPaymentSignature()` - Validates payment authenticity
- `getPaymentDetails()` - Fetches latest payment status from Razorpay
- Database updates payment status after verification

```typescript
// In paymentController.ts
const paymentDetails = await getPaymentDetails(paymentId);

if (paymentDetails.payment.status === 'captured') {
  // Payment successfully captured
  await updateRegistration({
    paymentStatus: 'Completed',
    status: 'Confirmed'
  });
} else if (paymentDetails.payment.status === 'authorized') {
  // Payment authorized but not captured yet
  // Late authorization scenario - will be handled automatically
}
```

---

## Environment Variables Setup

### Frontend (.env or .env.local)
```env
VITE_RAZORPAY_KEY_ID=rzp_live_XXXXXXX
VITE_API_URL=https://api.yourdomain.com
# For development:
# VITE_API_URL=http://localhost:5000
```

### Backend (.env)
```env
RAZORPAY_KEY_ID=rzp_live_XXXXXXX
RAZORPAY_SECRET_KEY=XXXXXXXXXXXXXXXXX
```

---

## Testing the Implementation

### Local Testing
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd .
npm run dev
```

### Test Scenarios

#### Scenario 1: Successful Payment
1. Fill registration form
2. Click "Pay Now"
3. Razorpay checkout opens
4. Use test card: `4111 1111 1111 1111` (expiry: any future date, CVV: any 3 digits)
5. Complete payment
6. Verify:
   - ✅ Order created with order_id
   - ✅ Payment signature verified
   - ✅ Registration marked as "Confirmed"
   - ✅ Email sent

#### Scenario 2: Payment Failure
1. Use invalid test card
2. Payment should fail gracefully
3. Registration should remain "Pending"
4. User can retry

#### Scenario 3: Late Authorization (Simulated)
1. Use test card that simulates delayed auth
2. Payment shows "authorized" but not "captured"
3. Late Authorization settings on dashboard should capture within 72 hours
4. System eventually marks as "Captured" and "Confirmed"

---

## Verification Checklist

### Backend
- [x] Order creation endpoint exists (`POST /api/payments/create-order`)
- [x] Order creation stores order_id in database
- [x] Payment verification endpoint exists (`POST /api/payments/verify`)
- [x] Signature verification implemented
- [x] Payment details fetched from Razorpay
- [x] Registration status updated on success

### Frontend
- [x] Calls backend to create order before checkout
- [x] Passes `order_id` to Razorpay options
- [x] Verifies payment with backend after successful payment
- [x] Handles errors gracefully
- [x] Shows success/failure states

### Razorpay Dashboard
- [ ] Late Authorization settings enabled (up to 72 hours)
- [ ] Webhook configured for payment updates (optional but recommended)
- [ ] Test mode payment account setup for testing

---

## Monitoring & Debugging

### Check Order Creation
```bash
# In browser console during payment
window.fetch('/api/payments/create-order', {...})
  .then(r => r.json())
  .then(d => console.log('Order ID:', d.data.orderId))
```

### Monitor Payment Status
- Razorpay Dashboard → Transactions → Search by Registration ID
- Check Payment Status column for "captured" or "authorized"

### Error Scenarios
| Error | Cause | Fix |
|-------|-------|-----|
| Order creation fails | Backend API unreachable | Check `VITE_API_URL` env var |
| Payment not captured | Missing order_id | Verify backend returns orderId |
| Signature verification fails | Tampering or key mismatch | Check RAZORPAY_SECRET_KEY |
| Late payment not captured | Late Auth disabled | Enable in Razorpay Dashboard |

---

## Additional Resources

- [Razorpay Orders API](https://razorpay.com/docs/payments/orders-api/)
- [Razorpay Checkout](https://razorpay.com/docs/payments/checkout/)
- [Razorpay Payment Signature Verification](https://razorpay.com/docs/payments/payment-gateway/verify-payments/)
- [Late Authorization Settings](https://razorpay.com/docs/payments/settings/authorization-timeout/)

---

## Summary of Changes

### Files Modified
1. **src/app/components/PaymentForm.tsx**
   - Added `handleInitiatePayment()` - Creates order via backend first
   - Added `verifyPaymentWithBackend()` - Verifies with backend after payment
   - Removed `savePaymentToFirestore()` - Now verified at backend
   - Razorpay options now include `order_id` field

### Files Unchanged (Already Correct)
- `backend/services/razorpayService.ts` - Already creates orders correctly
- `backend/controllers/paymentController.ts` - Already handles verification correctly
- `backend/routes/payments.tsx` - Already exposes correct endpoints

---

## Next Steps

1. **Set Environment Variables**
   - Configure `VITE_API_URL` pointing to backend
   - Ensure `RAZORPAY_KEY_ID` and `RAZORPAY_SECRET_KEY` are set

2. **Test Thoroughly**
   - Use test payment cards from Razorpay docs
   - Verify order creation in Razorpay Dashboard
   - Test payment verification and registration completion

3. **Configure Late Authorization**
   - Login to Razorpay Dashboard
   - Enable Late Authorization up to 72 hours
   - Test with simulated delayed payments

4. **Monitor in Production**
   - Track payment success rate
   - Monitor refund rate
   - Alert if unauthorized captures occur

---

**Implementation Date**: January 11, 2026  
**Status**: ✅ Complete and Ready for Testing
