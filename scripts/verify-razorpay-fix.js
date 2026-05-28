#!/usr/bin/env node
/**
 * Razorpay Integration Verification Script
 * 
 * This script verifies that the Razorpay integration fixes are properly implemented.
 * Run this from the project root directory: node scripts/verify-razorpay-fix.js
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, type = 'info') {
  const prefix = {
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    warning: `${colors.yellow}⚠${colors.reset}`,
    info: `${colors.blue}ℹ${colors.reset}`,
  }[type] || '•';

  console.log(`${prefix} ${message}`);
}

function checkFileContains(filePath, searchStrings) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = searchStrings.map(str => ({
      search: str,
      found: content.includes(str),
    }));
    return { found: true, content, results };
  } catch (e) {
    return { found: false, error: e.message };
  }
}

console.log(`\n${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.blue}  Razorpay Integration Fix Verification${colors.reset}`);
console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

let passCount = 0;
let failCount = 0;

// Check 1: PaymentForm.tsx has order_id in Razorpay options
console.log(`${colors.blue}[1] Frontend Implementation${colors.reset}`);
const paymentFormPath = path.join(__dirname, '../src/app/components/PaymentForm.tsx');
const check1 = checkFileContains(paymentFormPath, [
  'order_id: orderId',
  'handleInitiatePayment',
  'verifyPaymentWithBackend',
  '/api/payments/create-order',
  '/api/payments/verify',
]);

if (check1.found && check1.results.every(r => r.found)) {
  log('PaymentForm.tsx implements proper order_id flow', 'success');
  passCount++;
} else {
  log('PaymentForm.tsx missing required implementation', 'error');
  failCount++;
}

// Check 2: Backend creates orders with Orders API
console.log(`\n${colors.blue}[2] Backend Order Creation${colors.reset}`);
const razorpayServicePath = path.join(__dirname, '../backend/services/razorpayService.ts');
const check2 = checkFileContains(razorpayServicePath, [
  'createRazorpayOrder',
  'razorpay.orders.create',
  'orderId',
]);

if (check2.found && check2.results.every(r => r.found)) {
  log('razorpayService.ts implements order creation', 'success');
  passCount++;
} else {
  log('razorpayService.ts missing order creation', 'error');
  failCount++;
}

// Check 3: Backend controller stores order_id
console.log(`\n${colors.blue}[3] Backend Order Storage${colors.reset}`);
const paymentControllerPath = path.join(__dirname, '../backend/controllers/paymentController.ts');
const check3 = checkFileContains(paymentControllerPath, [
  'createPaymentOrder',
  'createRazorpayOrder',
  'paymentId: orderResponse.orderId',
  'verifyPayment',
  'verifyPaymentSignature',
]);

if (check3.found && check3.results.every(r => r.found)) {
  log('paymentController.ts implements proper order handling', 'success');
  passCount++;
} else {
  log('paymentController.ts missing required implementation', 'error');
  failCount++;
}

// Check 4: Verify signature implementation
console.log(`\n${colors.blue}[4] Payment Verification${colors.reset}`);
const check4 = checkFileContains(razorpayServicePath, [
  'verifyPaymentSignature',
  'crypto.createHmac',
  'sha256',
]);

if (check4.found && check4.results.every(r => r.found)) {
  log('Signature verification properly implemented', 'success');
  passCount++;
} else {
  log('Signature verification missing or incomplete', 'error');
  failCount++;
}

// Check 5: Environment variables documentation
console.log(`\n${colors.blue}[5] Environment Configuration${colors.reset}`);
const envExamplePath = path.join(__dirname, '../backend/.env.example');
const check5 = checkFileContains(envExamplePath, [
  'RAZORPAY_KEY_ID',
  'RAZORPAY_SECRET_KEY',
]);

if (check5.found && check5.results.every(r => r.found)) {
  log('.env.example has Razorpay keys configured', 'success');
  passCount++;
} else {
  log('.env.example missing Razorpay configuration', 'error');
  failCount++;
}

// Check 6: Implementation guide exists
console.log(`\n${colors.blue}[6] Documentation${colors.reset}`);
const guideExists = fs.existsSync(path.join(__dirname, '../RAZORPAY_FIX_IMPLEMENTATION.md'));
const quickRefExists = fs.existsSync(path.join(__dirname, '../RAZORPAY_QUICK_REFERENCE.md'));

if (guideExists) {
  log('RAZORPAY_FIX_IMPLEMENTATION.md exists', 'success');
  passCount++;
} else {
  log('RAZORPAY_FIX_IMPLEMENTATION.md missing', 'warning');
}

if (quickRefExists) {
  log('RAZORPAY_QUICK_REFERENCE.md exists', 'success');
  passCount++;
} else {
  log('RAZORPAY_QUICK_REFERENCE.md missing', 'warning');
}

// Check 7: API endpoints exist
console.log(`\n${colors.blue}[7] API Routes${colors.reset}`);
const paymentsRoutePath = path.join(__dirname, '../backend/routes/payments.tsx');
const check7 = checkFileContains(paymentsRoutePath, [
  'createPaymentOrder',
  'verifyPayment',
  '/create-order',
  '/verify',
]);

if (check7.found && check7.results.every(r => r.found)) {
  log('Payment routes properly configured', 'success');
  passCount++;
} else {
  log('Payment routes missing or incomplete', 'error');
  failCount++;
}

// Summary
console.log(`\n${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.blue}  Summary${colors.reset}`);
console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.green}Passed: ${passCount}${colors.reset}`);
console.log(`${colors.red}Failed: ${failCount}${colors.reset}`);

if (failCount === 0) {
  console.log(`\n${colors.green}✓ All checks passed! Razorpay fix is properly implemented.${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`\n${colors.red}✗ Some checks failed. Please review the implementation.${colors.reset}\n`);
  process.exit(1);
}
