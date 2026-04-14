================================================================================
ENVIRONMENT VARIABLES SETUP GUIDE
================================================================================

This guide explains how to configure environment variables for the Niklaus
Solution project. Environment variables store sensitive credentials that should
never be committed to version control.

================================================================================
OVERVIEW
================================================================================

Three Environment Files:

1. .env.local (✅ For Local Development)
   Location: Root directory
   Purpose: Development environment on your machine
   Committed to Git: NO (in .gitignore)
   Usage: npm run dev

2. .env (For Production & Deployment)
   Location: Root directory  
   Purpose: Production environment on Vercel/deployment
   Committed to Git: NO (in .gitignore)
   Usage: npm run build & vercel deploy

3. .env.example (✅ For Reference)
   Location: Root directory
   Purpose: Template showing what variables are needed
   Committed to Git: YES
   Usage: Documentation and onboarding

================================================================================
CURRENT CREDENTIALS CONFIGURED
================================================================================

Your .env and .env.local files are configured with the following services:

📧 EMAIL CONFIGURATION
├── EMAIL_USER: niklaussolution@gmail.com
├── EMAIL_PASSWORD: brzt nrcx ebzv rzpz
└── Purpose: Gmail account for sending emails

🚀 EMAILJS CONFIGURATION (for Seminar Registrations)
├── EMAILJS_SERVICE_ID: service_js1s0gw
├── EMAILJS_TEMPLATE_ID: template_jpxq18j
├── EMAILJS_PUBLIC_KEY: vFx4wFBCV_vNL4Vwp
├── EMAILJS_PRIVATE_KEY: vvDrmqIDmcqLNAJLKamw9
└── Purpose: Sending confirmation emails to seminar registrants

💳 RAZORPAY CONFIGURATION (for Payments)
├── RAZORPAY_KEY_ID: rzp_live_Rvof1bESnec5Iq
├── RAZORPAY_SECRET_KEY: qt9EaQzSgllcD7HgrNHjODKb
└── Purpose: Payment gateway for course and service payments

🔥 FIREBASE CONFIGURATION (Database & Authentication)
├── FIREBASE_API_KEY: AIzaSyBTCTJ87IXp7nW1rDj0NLkzo_QLq57WJHU
├── FIREBASE_AUTH_DOMAIN: niklaussolutions.firebaseapp.com
├── FIREBASE_PROJECT_ID: niklaussolutions
├── FIREBASE_STORAGE_BUCKET: niklaussolutions.firebasestorage.app
├── FIREBASE_DATABASE_URL: https://niklaussolutions.firebaseio.com
├── FIREBASE_MESSAGING_SENDER_ID: 564577230644
├── FIREBASE_APP_ID: 1:564577230644:web:5696968f742fc12469cf61
├── FIREBASE_MEASUREMENT_ID: G-8WXBPMRTK2
└── Purpose: Database, authentication, and file storage

================================================================================
VITE\_ PREFIXED VARIABLES (Client-Side)
================================================================================

Variables prefixed with VITE* are exposed to the browser as build-time constants.
Only use VITE* for non-sensitive information or for public API keys.

IMPORTANT SECURITY NOTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ NEVER put secret keys in VITE\_ variables
These are visible to browser users in the built application!

✅ SAFE to use VITE\_ for:

- Public API keys (EmailJS public key, Razorpay key ID)
- Firebase credentials (these are meant to be public)
- Service IDs and Template IDs
- Measurement IDs

❌ NEVER use VITE\_ for:

- Private keys or secret keys
- Admin credentials
- Database passwords
- API secrets

Current VITE* Variables:
• VITE_EMAILJS_SERVICE_ID (public)
• VITE_EMAILJS_TEMPLATE_ID (public)
• VITE_EMAILJS_PUBLIC_KEY (public)
• VITE_RAZORPAY_KEY_ID (public)
• VITE_FIREBASE*\* (all public - Firebase design)

================================================================================
HOW TO USE ENVIRONMENT VARIABLES IN CODE
================================================================================

In React/TypeScript Components:

```typescript
// Access at build time (compile-time constants)
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
```

Example from SeminarRegistrationForm.tsx:

```typescript
useEffect(() => {
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  if (publicKey) {
    emailjs.init(publicKey);
  }
}, []);

// Later in handleSubmit:
const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

if (serviceId && templateId) {
  await emailjs.send(serviceId, templateId, data);
}
```

In Node.js/Backend Code:

```javascript
// Access with process.env (runtime constants)
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET_KEY;
```

================================================================================
STEP-BY-STEP SETUP
================================================================================

For Local Development:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ ALREADY DONE in this project:

1. .env.local file created with all credentials
2. .env file created with all credentials
3. .env.example file created as template
4. SeminarRegistrationForm.tsx updated to use env variables
5. emailForwarder.ts uses env variables
6. .gitignore already protects .env files

✅ WHAT TO DO NEXT:

1. Start development server:
   npm run dev

2. Environment variables automatically loaded from:
   - .env.local (highest priority for local dev)
   - .env (fallback)
   - .env.example (reference only)

3. Test that EmailJS works:
   - Navigate to /seminar
   - Fill out and submit registration form
   - Check browser console for any errors
   - Verify Firestore saves data
   - Check registrant's email for confirmation

4. Test EmailJS initialization:
   - Open browser DevTools console
   - Look for any emailjs.init() errors
   - Should see successful initialization

For Production Deployment:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to Vercel Dashboard:
   https://vercel.com/dashboard

2. Select your project: Niklaus Solution

3. Go to: Settings > Environment Variables

4. Add all variables from .env:
   - EMAILJS_SERVICE_ID
   - EMAILJS_TEMPLATE_ID
   - EMAILJS_PUBLIC_KEY
   - EMAILJS_PRIVATE_KEY
   - RAZORPAY_KEY_ID
   - RAZORPAY_SECRET_KEY
   - FIREBASE_API_KEY
   - FIREBASE_AUTH_DOMAIN
   - FIREBASE_PROJECT_ID
   - Etc. (all from .env file)

5. Set availability: "All" (or specific environments)

6. Click "Save"

7. Redeploy:
   Either push to main branch or manually redeploy on Vercel

8. Verify:
   After deployment, test all features:
   - Seminar registration
   - EmailJS confirmations
   - Razorpay payments
   - Login/Authentication

================================================================================
TROUBLESHOOTING
================================================================================

Issue: "Cannot read property 'init' of undefined" in EmailJS
Solution:
□ Check VITE_EMAILJS_PUBLIC_KEY is set in .env.local
□ Restart dev server: npm run dev
□ Check browser console for import.meta.env values
□ Verify .env.local file exists in root directory

Issue: EmailJS not sending emails
Solution:
□ Check VITE_EMAILJS_SERVICE_ID correct
□ Check VITE_EMAILJS_TEMPLATE_ID correct
□ Verify template exists in EmailJS dashboard
□ Check registrant email address is valid
□ Check EmailJS quota not exceeded

Issue: Firebase not connecting
Solution:
□ Verify FIREBASE_API_KEY is correct
□ Check FIREBASE_PROJECT_ID matches Firebase console
□ Verify Firebase credentials in src/config/firebase.ts
□ Check Firestore rules allow access
□ Test in Firebase console

Issue: Variables undefined in component
Solution:
□ Ensure .env.local or .env exists in root
□ Prefix variables with VITE\_ for client access
□ Restart dev server after changing .env
□ Check variable names match exactly (case-sensitive)
□ Use: import.meta.env.VITE_YOUR_VAR

Issue: Production deployment missing variables
Solution:
□ Add all VITE* prefixed variables to Vercel dashboard
□ Also add non-VITE* variables that backend might use
□ Verify each variable value matches .env file
□ Redeploy after adding variables
□ Wait 2-3 minutes for deployment to complete

================================================================================
KEEPING CREDENTIALS SECURE
================================================================================

DO's:
✅ Store credentials in .env files (local)
✅ Store credentials in Vercel Environment Variables (production)
✅ Use different credentials for dev vs production
✅ Rotate credentials periodically
✅ Keep .env files in .gitignore
✅ Use VITE\_ only for public keys
✅ Document what each credential is for
✅ Limit who has access to credentials
✅ Use secrets management for team

DON'Ts:
❌ Never commit .env files to Git
❌ Never paste credentials in Slack/Email
❌ Never share .env files via cloud storage
❌ Never use same credentials for all environments
❌ Never expose private keys in browser (VITE\_)
❌ Never push config files to public repos
❌ Never log sensitive values in console
❌ Never hardcode credentials in source code
❌ Never show credentials in error messages

Credential Rotation:
When to rotate:
• Every 3-6 months for routine security
• After anyone leaves the team
• If credentials are compromised
• When moving to new deployment platform

Steps:

1. Generate new credentials from service provider
2. Update .env file locally
3. Update Vercel Environment Variables
4. Update .env.local for other developers
5. Revoke old credentials
6. Redeploy application
7. Test all features

================================================================================
CREDENTIAL REFERENCE
================================================================================

Email Configuration:
Service: Gmail (niklaussolution@gmail.com)
Purpose: Email sending account
Credentials: Username + App Password
Where to find: Google Account > Security > App Passwords
Used by: Backend email services, email forwarding
Sensitive: YES (keep private)

EmailJS Configuration:
Service: EmailJS.com (Email sending service)
Purpose: Automated email notifications
Components:
• Service ID: Identifies which email service to use
• Template ID: Which email template to send
• Public Key: Browser can access for client-side sending
• Private Key: Backend only, sensitive
Dashboard: https://www.emailjs.com/
Used by: Seminar registrations, email confirmations
Sensitive: Private Key YES, others relatively safe

Razorpay Configuration:
Service: Razorpay.com (Payment processing)
Purpose: Payment gateway for courses/services
Components:
• Key ID: Public identifier for Razorpay
• Secret Key: Private key for backend transactions
Dashboard: https://dashboard.razorpay.com/
Used by: Course purchases, payment processing
Sensitive: Secret Key YES, Key ID is public

Firebase Configuration:
Service: Firebase by Google (Database, Auth, Storage)
Purpose: Backend database and authentication
Components:
• API Key: Public key for browser access
• Project ID: Identifies your Firebase project
• Auth Domain: Used for authentication
• Storage Bucket: File storage location
• Others: Service identifiers
Dashboard: https://console.firebase.google.com/
Used by: Authentication, Firestore database, file storage
Sensitive: Not critical (design is public), but keep secure

Current Values:
Email: niklaussolution@gmail.com
Firebase Project: niklaussolutions
EmailJS Template: template*jpxq18j (seminar registrations)
Razorpay: Live mode (rzp_live*)

================================================================================
ADDING NEW CREDENTIALS
================================================================================

If you need to add new credentials:

1. Create the service/account
2. Get the credentials/keys
3. Add to .env file:
   YOUR_NEW_VAR=value
4. Add to .env.local:
   YOUR_NEW_VAR=value
5. Add to .env.example:
   YOUR_NEW_VAR=your_value (placeholder)
6. Commit .env.example only (not .env)
7. If client-side needed, prefix with VITE\_:
   VITE_YOUR_NEW_VAR=value
8. Use in code:
   const value = import.meta.env.VITE_YOUR_NEW_VAR;
9. Redeploy to Vercel:
   Add to Settings > Environment Variables
   Then redeploy

================================================================================
DEVELOPMENT WORKFLOW
================================================================================

New Developer Joining:

1. Clone repository
2. Ask team for .env.local file (securely)
3. Place in root directory
4. Run: npm install
5. Run: npm run dev
6. Test features work locally
7. Never commit .env files

Deploying New Feature with New Credentials:

1. Get credentials from service
2. Update .env.local locally
3. Test feature locally (npm run dev)
4. Update .env.example with placeholder
5. Commit code changes (not .env)
6. Push to GitHub
7. During PR review, mention new env vars needed
8. After merge, update Vercel Environment Variables
9. Redeploy on Vercel
10. Test on production

Regular Maintenance:

Daily:
□ Features work with current credentials
□ No security warnings in console

Weekly:
□ EmailJS quota usage reasonable
□ Firebase billing not unexpectedly high
□ No failed authentication attempts

Monthly:
□ Review .env file organization
□ Check for unused credentials
□ Verify all credentials still valid
□ Update documentation if changed

Quarterly:
□ Rotate credentials for freshness
□ Review security of all services
□ Update team access if needed
□ Check for credential leaks

================================================================================
VERCEL ENVIRONMENT VARIABLES
================================================================================

How to Add on Vercel:

1. Login to Vercel Dashboard
   https://vercel.com/dashboard

2. Select Project: Niklaus Solution

3. Click "Settings"

4. Click "Environment Variables" (left sidebar)

5. Add variables:
   ┌─────────────────────────┐
   │ Name: VITE_EMAILJS_SERVICE_ID
   │ Value: service_js1s0gw
   │ Environments: Production, Preview, Development
   │ [Add] button
   └─────────────────────────┘

6. Repeat for each variable

7. After adding, click "Redeploy" to rebuild with new vars

Recommended Setup on Vercel:

Production Only:
• SECRET_KEYS (Razorpay Secret, EmailJS Private Key)
• ADMIN_PASSWORDS

All Environments (Prod + Preview + Dev):
• Public Keys
• IDs and configuration
• VITE\_ prefixed variables

Never on Vercel:
• Hardcode credentials in code
• Sensitive local dev secrets
• Database passwords

================================================================================
TESTING CREDENTIALS
================================================================================

Test EmailJS:

1. In browser console paste:
   emailjs.init('vFx4wFBCV_vNL4Vwp'); // your public key
   console.log('EmailJS initialized');

2. Go to /seminar
3. Fill form with test data
4. Submit
5. Check registrant email for confirmation
6. Check browser console for errors

Test Razorpay:

1. Go to /student or payments page
2. Try to make a test payment
3. Should see Razorpay modal
4. Use test card: 4111 1111 1111 1111
5. Should process successfully

Test Firebase:

1. Go to /admin
2. Login with credentials
3. Navigate to any admin page
4. Should see Firestore data loading
5. Check Firebase console for read/write operations

================================================================================
QUICK REFERENCE TABLE
================================================================================

┌─────────────────────────────┬──────────────────────────┬──────────────┐
│ Credential │ Sensitive? │ VITE\_ Safe? │
├─────────────────────────────┼──────────────────────────┼──────────────┤
│ EmailJS Public Key │ No (public) │ Yes ✅ │
│ EmailJS Private Key │ Yes (keep private) │ No ❌ │
│ EmailJS Service ID │ No (identifier only) │ Yes ✅ │
│ EmailJS Template ID │ No (identifier only) │ Yes ✅ │
│ Razorpay Key ID │ No (public identifier) │ Yes ✅ │
│ Razorpay Secret Key │ Yes (keep private) │ No ❌ │
│ Firebase API Key │ No (public by design) │ Yes ✅ │
│ Firebase Project ID │ No (public identifier) │ Yes ✅ │
│ Email Password │ Yes (always private) │ No ❌ │
│ Admin Credentials │ Yes (keep private) │ No ❌ │
│ Database Password │ Yes (keep private) │ No ❌ │
└─────────────────────────────┴──────────────────────────┴──────────────┘

================================================================================
SUMMARY
================================================================================

✅ Status: Environment variables fully configured
✅ .env file: Created with all credentials
✅ .env.local file: Created for local development
✅ .env.example: Created as template
✅ Code updated: SeminarRegistrationForm uses env variables
✅ Git protection: .env files in .gitignore
✅ Security: Sensitive keys protected

Next Steps:

1. Start dev server: npm run dev
2. Test seminar registration at /seminar
3. Verify EmailJS sends confirmation emails
4. Deploy to Vercel (adds environment variables there)
5. Test all features work in production

For help:

- Check TROUBLESHOOTING section above
- Review credential reference table
- Test in browser console
- Check Firestore/EmailJS dashboards

================================================================================
END OF ENVIRONMENT SETUP GUIDE
================================================================================
