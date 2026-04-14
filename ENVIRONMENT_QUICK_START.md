================================================================================
ENVIRONMENT VARIABLES - QUICK START FOR DEVELOPERS
================================================================================

New to the project? Try this 5-minute setup guide!

================================================================================
STEP 1: GET YOUR .env.local FILE (1 MIN)
================================================================================

Ask your team lead for the .env.local file.

It should contain all credentials for:
• Email (Gmail)
• EmailJS (sending emails)
• Razorpay (payments)
• Firebase (database)

Place it in the root directory:
d:/LegendaryOne/Websites/Niklaus-Solution-main/.env.local

DO NOT commit this file to Git!

================================================================================
STEP 2: START DEVELOPMENT SERVER (1 MIN)
================================================================================

In VS Code terminal:

npm install # Install dependencies
npm run dev # Start development server

Expected output:

> vite

➜ Local: http://localhost:5173/
➜ press h to show help

✅ Success! Your environment is ready.

================================================================================
STEP 3: TEST YOUR SETUP (3 MIN)
================================================================================

Test 1: Visit the app
• Go to http://localhost:5173/
• Home page should load with no errors
• Check browser console (F12) for any red errors

Test 2: Test seminar registration
• Click "Seminar Section" on home page
• Or go directly to: http://localhost:5173/seminar
• Fill out the registration form
• Click "Register Now"
• Should see success message in 2-3 seconds
• Email should arrive in registrant's inbox

Test 3: Check your environment variables
• Open browser console (F12)
• Type: import.meta.env.VITE_EMAILJS_PUBLIC_KEY
• Should show a value, not "undefined"
• If undefined, restart dev server

Test 4: Visit admin area
• Go to /admin
• Login with credentials
• Navigate to "Seminar Registrations" (🎤 icon)
• Should see data you registered in test 2

✅ If all tests pass, you're good to go!

================================================================================
WHAT TO KNOW ABOUT ENVIRONMENT VARIABLES
================================================================================

What are environment variables?
→ Secure way to store sensitive information (passwords, API keys)
→ Keep credentials out of code
→ Different values for development vs production

Three types of variables in this project:

1. VITE\_ Variables (exposed to browser)
   └─ Safe for public API keys only
   └─ Example: VITE_EMAILJS_PUBLIC_KEY
   └─ You can see them in browser developer tools

2. Regular Variables (server-side only)
   └─ Private secrets that stay on server
   └─ Example: EMAIL_PASSWORD, RAZORPAY_SECRET_KEY
   └─ Never exposed to browser

3. Firebase Variables
   └─ Designed to be public by Google Firebase
   └─ Safe to expose in code

================================================================================
USING ENV VARIABLES IN CODE
================================================================================

In React Components (Client-side):

```typescript
// Only VITE_ variables are available
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;

if (publicKey && serviceId) {
  // Use the variables
  emailjs.init(publicKey);
}
```

Real example from your code:

```typescript
function SeminarRegistrationForm() {
  useEffect(() => {
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (publicKey) {
      emailjs.init(publicKey); // ✅ Works!
    }
  }, []);
}
```

Important:
❌ Don't try to access non-VITE variables in browser
✅ Only VITE\_ prefixed variables are available in React

================================================================================
YOUR CREDENTIALS AT A GLANCE
================================================================================

Email Service:
User: niklaussolution@gmail.com
Password: brzt nrcx ebzv rzpz
Purpose: Gmail account for email sending

EmailJS (Seminar Confirmations):
Service ID: service_js1s0gw
Template ID: template_jpxq18j ← IMPORTANT (updated template)
Public Key: vFx4wFBCV_vNL4Vwp
Purpose: Automated confirmation emails to registrants

Razorpay (Payments):
Key ID: rzp_live_Rvof1bESnec5Iq
Secret: qt9EaQzSgllcD7HgrNHjODKb
Purpose: Payment processing for courses

Firebase (Database):
Project: niklaussolutions
Collections: seminarRegistrations, students, courses, etc.
Purpose: Store all application data

✅ All captured in .env and .env.local files
✅ Code automatically reads them
✅ Don't need to do anything special

================================================================================
COMMON QUESTIONS
================================================================================

Q: I get "undefined" for environment variables
A:

1. Check .env.local file exists in root directory
2. Variable name must start with VITE\_ for client code
3. Restart dev server: npm run dev
4. Clear browser cache: Ctrl+Shift+Delete

Q: Where do I find environment variables in Vercel?
A:

1. Go to vercel.com/dashboard
2. Click your project (Niklaus Solution)
3. Settings → Environment Variables
4. Add all VITE\_ variables there
5. Redeploy after adding

Q: Can I change the EmailJS template ID?
A:

1. Change in .env.local: VITE_EMAILJS_TEMPLATE_ID=new_id
2. Restart dev server
3. Test at /seminar
4. Update Vercel if in production

Q: The app works locally but not on production
A:

1. Verify all variables added to Vercel dashboard
2. Check variable values match .env file
3. Redeploy on Vercel
4. Clear browser cache
5. Wait 3-5 minutes for build to finish

Q: How do I rotate credentials?
A:

1. Generate new credentials from service (EmailJS, Firebase, etc.)
2. Update .env file with new values
3. Update .env.local for local dev
4. Update Vercel Environment Variables
5. Deploy/redeploy
6. Revoke old credentials

Q: Is it safe to show .env file to others?
A:
❌ NO! Never send .env file via email, Slack, etc.
✅ Instead: Meet in person or video call
✅ Or: Create new credentials just for them
✅ Or: Use password manager for safe sharing

================================================================================
TROUBLESHOOTING QUICK FIX
================================================================================

Error: "emailjs is not defined"
Fix: Check VITE_EMAILJS_PUBLIC_KEY in .env.local
Fix: Restart dev server

Error: "Cannot read property 'init' of undefined"
Fix: EmailJS library not loaded
Fix: Check import statement is correct
Fix: Restart npm run dev

Error: Emails not sending
Fix: Service ID or Template ID wrong
Fix: Check: VITE_EMAILJS_SERVICE_ID=service_js1s0gw
Fix: Check: VITE_EMAILJS_TEMPLATE_ID=template_jpxq18j
Fix: Check EmailJS dashboard for quota

Error: Firestore data not saving
Fix: Check VITE_FIREBASE_API_KEY correct
Fix: Check Firestore Security Rules in Firebase console
Fix: Login to Firebase and verify connection

Can't find .env.local
Fix: Ask team lead for copy
Fix: Or check ENVIRONMENT_SETUP_GUIDE.md
Fix: Create one using .env.example as template

Variables show "undefined" in code
Fix: Must use VITE\_ prefix for client-side access
Fix: Restart dev server after creating/editing .env
Fix: Clear browser cache: Ctrl+Shift+Delete

================================================================================
SECURITY REMINDERS
================================================================================

✅ DO:
✓ Keep .env.local file safe
✓ Never commit .env files
✓ Only share .env.local securely with team
✓ Use different credentials for prod vs dev
✓ Report if credentials are leaked
✓ Rotate credentials every 3-6 months

❌ DON'T:
✗ Paste credentials in Slack/Teams/Email
✗ Upload .env to Google Drive/Dropbox
✗ Push .env to GitHub
✗ Hardcode credentials in source code
✗ Log sensitive values to console
✗ Share password via unencrypted channels
✗ Use same credentials for all environments

================================================================================
RELATED DOCUMENTATION
================================================================================

For more details, check these files:

📖 ENVIRONMENT_SETUP_GUIDE.md
├─ Comprehensive setup instructions
├─ Detailed credential reference
├─ Security best practices
└─ Extensive troubleshooting guide

📖 CREDENTIALS_VERIFICATION.md
├─ Verification checklist
├─ Testing procedures
├─ Deployment checklist
└─ Summary table of all files

📖 SEMINAR_QUICK_START.md
├─ How to use seminar registration feature
├─ User guide for registrants
└─ Admin dashboard instructions

📖 COMPLETE_PROJECT_DOCUMENTATION.txt
├─ Full project overview
├─ All features explained
└─ Architecture details

================================================================================
TL;DR - SUPER QUICK
================================================================================

Just want the essentials?

1. Get .env.local file from team
2. Put in root directory
3. npm run dev
4. Visit http://localhost:5173
5. Try /seminar to test registration
6. Everything should work!

If it doesn't work:
→ Check .env.local exists
→ Restart: npm run dev
→ Look at ENVIRONMENT_SETUP_GUIDE.md for help
→ Ask team lead if still stuck

That's it! Happy coding! 🚀

================================================================================
REFERENCE CARD
================================================================================

Most Used Commands:

Start dev server:
npm run dev

Build for production:
npm run build

Deploy to Vercel:
vercel deploy --prod

Check what variables are available:
In browser console: Object.keys(import.meta.env)

Test a specific variable:
import.meta.env.VITE_EMAILJS_PUBLIC_KEY

View all available env vars (at build time):
In browser console: window.**ENV**

Restart dev server:
Stop: Ctrl+C
Start: npm run dev

Clear Node modules (if having issues):
npm ci (clean install)

Most Used Endpoints:

Home page: http://localhost:5173/
Seminar registration: http://localhost:5173/seminar
Admin panel: http://localhost:5173/admin
Admin seminar registrations: http://localhost:5173/admin/seminar-registrations

Most Used Credentials:

EmailJS Service ID: service_js1s0gw
EmailJS Template ID: template_jpxq18j
Firebase Project: niklaussolutions
Email: niklaussolution@gmail.com

Most Used Files:

Configuration: src/config/firebase.ts
Seminar form: src/app/components/SeminarRegistrationForm.tsx
Admin panel: src/admin/pages/SeminarRegistrationsManagement.tsx
Routes: src/main.tsx
App setup: src/app/App.tsx

================================================================================
STILL STUCK?
================================================================================

Check in this order:

1. Read: ENVIRONMENT_SETUP_GUIDE.md (comprehensive guide)
2. Read: CREDENTIALS_VERIFICATION.md (verification checklist)
3. Check: Browser console (F12) for errors
4. Check: Firebase console for data
5. Check: EmailJS dashboard for sent emails
6. Ask: Team lead or senior developer
7. Search: GitHub issues for similar problem

Remember: If stuck for >5 minutes, ask for help!

================================================================================
YOU'RE ALL SET!
================================================================================

✅ Environment configured
✅ Secrets safe in .env files
✅ Code ready to use credentials
✅ Documentation complete
✅ Ready to develop and deploy

Questions? See: ENVIRONMENT_SETUP_GUIDE.md
Need help? Ask your team lead
Happy coding! 🎉

================================================================================
