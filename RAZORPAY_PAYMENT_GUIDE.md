# Razorpay Payment Integration - Complete Documentation

## Overview

This document provides complete instructions for implementing Razorpay payment gateway with workshop registration, automatic bill generation in PDF format, and email notifications.

## System Architecture

```
Workshop Registration Flow:
1. User fills registration form
2. User selects workshop and sees price
3. User clicks "Proceed to Payment"
4. PaymentForm component opens
5. Creates Razorpay payment order via API
6. Razorpay checkout opens
7. User completes payment
8. Payment signature verified
9. Bill PDF generated
10. Bill emailed to user
11. Admin notified
12. Success confirmation shown
13. User can download bill
```

## Setup Instructions

### 1. Razorpay Configuration

#### Step 1: Create Razorpay Account
- Visit: https://razorpay.com/
- Sign up for a business account
- Verify your email and phone

#### Step 2: Get API Keys
- Log in to Razorpay Dashboard
- Navigate to Settings → API Keys
- Copy **Key ID** and **Key Secret**
- Keep these safe - never share publicly

#### Step 3: Update Environment Variables
Create `.env` file in project root:
```bash
RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
```

### 2. Email Configuration

#### Step 1: Gmail Setup (Recommended)
- Go to: https://myaccount.google.com/security
- Enable "2-Step Verification" if not already enabled
- Visit: https://myaccount.google.com/apppasswords
- Select "Mail" and "Windows Computer" (or your device)
- Generate app-specific password
- Copy the 16-character password

#### Step 2: Update Email Variables
```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=noreply@theniklaus.com
ADMIN_EMAIL=admin@theniklaus.com
```

### 3. Install Required Dependencies

```bash
npm install razorpay pdfkit nodemailer
npm install --save-dev @types/pdfkit @types/nodemailer
```

### 4. Backend Setup

#### Create Payment Routes
Routes are automatically created in `/backend/routes/payments.tsx`

Add to your main server file:
```typescript
import paymentRoutes from './routes/payments';
app.use('/api/payments', paymentRoutes);
```

#### Workshop Pricing Configuration
Edit `src/app/components/RegistrationForm.tsx`:
```typescript
const WORKSHOP_PRICING: Record<string, number> = {
  "Ethical Hacking": 2999,
  "Full Stack Development": 2499,
  "AI & Machine Learning": 2799,
  "Cyber Security Basics": 1999,
  "Cloud Computing": 2199,
  "Data Science": 2599,
};
```

## API Endpoints

### 1. Create Payment Order
**POST** `/api/payments/create-order`

**Request Body:**
```json
{
  "userName": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "workshopId": "workshop_ethical_hacking",
  "workshopTitle": "Ethical Hacking",
  "organization": "Tech University",
  "amount": 2999
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "registrationId": "reg_xyz123",
    "orderId": "order_abc456",
    "amount": 2999,
    "currency": "INR",
    "keyId": "rzp_live_xxx"
  }
}
```

### 2. Verify Payment
**POST** `/api/payments/verify`

**Request Body:**
```json
{
  "registrationId": "reg_xyz123",
  "orderId": "order_abc456",
  "paymentId": "pay_abc123",
  "signature": "signature_hash"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "registrationId": "reg_xyz123",
    "paymentId": "pay_abc123",
    "status": "Confirmed",
    "billDownloadUrl": "/api/payments/bill/reg_xyz123"
  }
}
```

### 3. Download Bill
**GET** `/api/payments/bill/{registrationId}`

Returns: PDF file

### 4. Handle Payment Failure
**POST** `/api/payments/failure`

**Request Body:**
```json
{
  "registrationId": "reg_xyz123",
  "orderId": "order_abc456",
  "paymentId": "pay_abc123",
  "error": "Payment declined"
}
```

## File Structure

```
backend/
├── services/
│   ├── razorpayService.ts     # Razorpay API integration
│   ├── billService.ts          # PDF bill generation
│   └── emailService.ts         # Email notifications
├── controllers/
│   └── paymentController.ts    # Payment business logic
└── routes/
    └── payments.tsx            # Payment routes

src/app/components/
├── RegistrationForm.tsx        # Registration with payment
├── PaymentForm.tsx             # Payment checkout modal
```

## Features Implemented

### ✅ Razorpay Payment Gateway
- Create payment orders
- Verify payment signatures
- Fetch payment details
- Handle payment failures
- Capture payments
- Process refunds

### ✅ PDF Bill Generation
- Professional invoice design
- Company branding
- Payment details
- GST calculation (18%)
- Transaction ID
- Terms & conditions
- Customizable header/footer

### ✅ Email Notifications
- Bill email to customer with PDF attachment
- Confirmation email with details
- Admin notification with registration data
- HTML formatted emails
- Branded email templates

### ✅ User Interface
- Professional payment modal
- Order summary display
- Payment processing state
- Success confirmation
- Bill download option
- Error handling
- Mobile responsive

### ✅ Data Management
- Registration database tracking
- Payment status updates
- Bill history
- Transaction records
- Customer data storage

## Workflow

### Complete User Journey

1. **Registration Form**
   - User fills: Name, Email, Phone, Organization, Workshop
   - Selects workshop → sees price (includes GST)
   - Clicks "Proceed to Payment"

2. **Payment Modal Opens**
   - Shows order summary
   - Company branding
   - Secure payment badge
   - User can review details

3. **Payment Processing**
   - Razorpay checkout opens
   - User enters card details
   - Razorpay processes payment
   - Signature verification

4. **Post-Payment**
   - Bill PDF generated instantly
   - Email sent to customer with bill
   - Admin notified
   - Success page shown
   - Download bill option available

5. **Email Contents**
   - Customer: Confirmation + Bill (PDF)
   - Admin: Registration details for follow-up

## Bill PDF Specifications

### Bill Components
- Header: Company logo and details
- Invoice number and dates
- Bill-to information
- Item details (workshop name, price)
- GST calculation
- Total amount
- Payment information
- Terms and conditions
- Footer with company contact

### Default Settings
- Currency: INR (Indian Rupees)
- GST: 18% (configurable)
- Format: A4 PDF
- Font: Professional Arial/Helvetica

### Customization
Edit `backend/services/billService.ts`:
```typescript
// Change GST percentage
const gstPercentage = 18; // Change this value

// Change company details
doc.text('Your Company Name', { align: 'center' });
doc.text('Your Contact Details', { align: 'center' });
```

## Testing

### Test Payment
Razorpay provides test credentials:
- Test Key ID: `rzp_test_YOUR_TEST_KEY`
- Test Key Secret: `YOUR_TEST_SECRET`

### Test Cards
Use these for testing (Test Mode):
- **Success:** 4111111111111111 (Any future date, any CVV)
- **Failed:** 4000000000000002 (Any future date, any CVV)

Steps:
1. Update `.env` with test credentials
2. Complete a test registration
3. At checkout, use test card
4. Check email for bill
5. Verify registration in Firestore

## Security Considerations

### ✅ Implemented Security
- Payment signature verification
- SSL/HTTPS enforced
- API key in environment variables
- Never exposed client-side
- Database transaction logging
- Error handling without exposing sensitive data

### ⚠️ Additional Recommendations
1. Implement rate limiting on payment endpoints
2. Add CSRF protection
3. Log all payment transactions
4. Regular security audits
5. Update dependencies regularly
6. Monitor payment anomalies
7. Backup transaction records
8. Use HTTPS in production

## Troubleshooting

### Issue: "Failed to create payment order"
**Solution:**
- Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in `.env`
- Verify Razorpay account is activated
- Check API limits haven't been exceeded

### Issue: "Payment verification failed"
**Solution:**
- Verify payment signature using exact orderId and paymentId
- Check database connection for storing payment details
- Ensure timestamps match

### Issue: "Email not sending"
**Solution:**
- Enable "Less secure app access" if using Gmail
- Use App Passwords (recommended)
- Check EMAIL_USER and EMAIL_PASSWORD are correct
- Verify SMTP settings

### Issue: "Bill PDF not generated"
**Solution:**
- Check pdfkit library is installed
- Verify bill data is complete
- Check server has write permissions
- Review console for specific errors

### Issue: Payment success but no email received
**Solution:**
- Check spam/junk folder
- Verify ADMIN_EMAIL is correct
- Check email service configuration
- Review server logs for email errors

## Production Deployment

### Before Going Live

1. **Switch to Live Keys**
   - Get live Razorpay API keys
   - Update `.env` with live keys
   - Test thoroughly

2. **Email Configuration**
   - Set up production email address
   - Update EMAIL_FROM and ADMIN_EMAIL
   - Test email delivery

3. **Database**
   - Ensure Firebase is properly configured
   - Set up backups
   - Configure security rules

4. **SSL/HTTPS**
   - Ensure site uses HTTPS
   - Update CLIENT_URL in `.env`

5. **Payment URLs**
   - Verify callback URLs are correct
   - Set up webhook if needed
   - Test all payment scenarios

6. **Monitoring**
   - Set up payment transaction logging
   - Monitor failed payments
   - Track email delivery
   - Monitor system errors

### Deployment Checklist
- [ ] Live Razorpay keys configured
- [ ] Email service configured
- [ ] HTTPS enabled
- [ ] Database backups setup
- [ ] Error logging configured
- [ ] Payment testing completed
- [ ] Bill PDF verified
- [ ] Email delivery tested
- [ ] Admin notifications working
- [ ] Security headers added

## FAQ

**Q: How long does payment take to reflect?**
A: Usually instant, but can take up to 5 minutes.

**Q: Can I change workshop prices?**
A: Yes, edit `WORKSHOP_PRICING` in `RegistrationForm.tsx`

**Q: How to handle refunds?**
A: Update registration status to "Refunded" and call `refundPayment` from Razorpay service.

**Q: Can I customize the bill?**
A: Yes, edit `backend/services/billService.ts` to change design.

**Q: How long are bills retained?**
A: Permanently in Firestore. Download endpoint always available.

**Q: What if payment is interrupted?**
A: Registration saved as "Pending" - user can retry payment.

## Support

For issues:
1. Check Razorpay dashboard for transaction status
2. Review console logs for error details
3. Check email service provider logs
4. Verify all environment variables are set
5. Contact Razorpay support for payment issues
6. Contact email provider for delivery issues

## Additional Resources

- Razorpay Docs: https://razorpay.com/docs/
- PDFKit Guide: http://pdfkit.org/
- Nodemailer Guide: https://nodemailer.com/
- Express.js Guide: https://expressjs.com/

---

**Version:** 1.0
**Last Updated:** December 24, 2025
**Status:** Production Ready ✅
