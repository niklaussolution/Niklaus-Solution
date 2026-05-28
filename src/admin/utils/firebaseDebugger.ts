/**
 * Firebase Connection Tester
 * Run this to diagnose Firebase authentication issues
 * 
 * Usage: 
 * 1. Add this file to your src/admin folder
 * 2. Import and call testFirebaseConnection() in your LoginPage
 * 3. Check browser console for detailed diagnostic report
 */

interface FirebaseTestResult {
  apiKeyValid: boolean;
  apiReachable: boolean;
  configComplete: boolean;
  errorDetails: string[];
  warnings: string[];
  recommendations: string[];
}

export async function testFirebaseConnection(): Promise<FirebaseTestResult> {
  const result: FirebaseTestResult = {
    apiKeyValid: false,
    apiReachable: false,
    configComplete: false,
    errorDetails: [],
    warnings: [],
    recommendations: []
  };

  console.log('🔍 Starting Firebase Connection Diagnostic...\n');

  // Test 1: Check environment variables
  console.log('📋 TEST 1: Environment Variables');
  console.log('================================');
  
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;

  if (!apiKey) {
    result.errorDetails.push('❌ VITE_FIREBASE_API_KEY is missing or empty');
  } else {
    console.log(`✅ API Key present: ${apiKey.substring(0, 10)}...`);
    result.apiKeyValid = true;
  }

  if (!authDomain) {
    result.errorDetails.push('❌ VITE_FIREBASE_AUTH_DOMAIN is missing');
  } else {
    console.log(`✅ Auth Domain: ${authDomain}`);
  }

  if (!projectId) {
    result.errorDetails.push('❌ VITE_FIREBASE_PROJECT_ID is missing');
  } else {
    console.log(`✅ Project ID: ${projectId}`);
  }

  if (!storageBucket) {
    result.warnings.push('⚠️ VITE_FIREBASE_STORAGE_BUCKET is missing (may not be needed for auth)');
  } else {
    console.log(`✅ Storage Bucket: ${storageBucket}`);
  }

  if (!appId) {
    result.warnings.push('⚠️ VITE_FIREBASE_APP_ID is missing');
  } else {
    console.log(`✅ App ID: ${appId}`);
  }

  result.configComplete = !!apiKey && !!authDomain && !!projectId;
  console.log(result.configComplete ? '✅ Configuration: COMPLETE\n' : '❌ Configuration: INCOMPLETE\n');

  // Test 2: Check Firebase API reachability
  console.log('🌐 TEST 2: Firebase API Reachability');
  console.log('====================================');

  if (!apiKey) {
    console.log('⏭️  Skipping API test (no API key)');
  } else {
    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: 'test-invalid-token' })
        }
      );

      console.log(`Response Status: ${response.status}`);

      if (response.status === 400 || response.status === 401) {
        console.log('✅ Firebase API is reachable (400/401 expected for invalid token)');
        result.apiReachable = true;
      } else if (response.status === 403) {
        console.log('❌ Firebase API returned 403 (Forbidden)');
        console.log('   This usually means API Key is restricted to other domains');
        result.errorDetails.push('❌ API Key appears to be domain-restricted');
        result.recommendations.push('Add your domain to Firebase API Key restrictions');
      } else if (response.status === 200) {
        console.log('⚠️  Unexpected 200 response - may indicate issue');
      } else {
        console.log(`❓ Unexpected status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Response data:', responseData);
    } catch (error: any) {
      console.log('❌ Could not reach Firebase API');
      console.log('Error:', error.message);
      result.errorDetails.push(`Cannot reach Firebase API: ${error.message}`);
      result.recommendations.push('Check internet connection');
      result.recommendations.push('Check firewall/VPN settings');
    }
  }

  console.log();

  // Test 3: Domain check
  console.log('🌍 TEST 3: Current Domain');
  console.log('==========================');
  const currentDomain = window.location.hostname;
  console.log(`Current domain: ${currentDomain}`);
  console.log(`Protocol: ${window.location.protocol}`);
  
  // Warn if localhost but using production credentials
  if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
    result.warnings.push('⚠️  Running on localhost - check if using production Firebase credentials');
  }
  console.log();

  // Print summary
  console.log('\n📊 DIAGNOSTIC SUMMARY');
  console.log('=====================');
  console.log(`Configuration Complete: ${result.configComplete ? '✅' : '❌'}`);
  console.log(`API Key Valid: ${result.apiKeyValid ? '✅' : '❌'}`);
  console.log(`API Reachable: ${result.apiReachable ? '✅' : '❌'}`);

  if (result.errorDetails.length > 0) {
    console.log('\n🚨 ERRORS:');
    result.errorDetails.forEach(error => console.log(`  ${error}`));
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    result.warnings.forEach(warning => console.log(`  ${warning}`));
  }

  if (result.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    result.recommendations.forEach((rec, i) => console.log(`  ${i + 1}. ${rec}`));
  }

  console.log('\n');

  return result;
}

/**
 * Test actual login with provided credentials
 * Run this if basic connection test passes
 */
export async function testLoginWithCredentials(email: string, password: string) {
  console.log('🔐 TEST: Login with Credentials');
  console.log('================================');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password.substring(0, 1)}${'*'.repeat(password.length - 1)}`);

  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  
  if (!apiKey) {
    console.log('❌ API Key missing - cannot test login');
    return;
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true
        })
      }
    );

    console.log(`Response Status: ${response.status}`);

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('Token:', data.idToken?.substring(0, 20) + '...');
    } else {
      console.log('❌ Login failed');
      console.log('Error:', data.error?.message || 'Unknown error');
      
      // Parse specific error messages
      const errorMsg = data.error?.message || '';
      if (errorMsg.includes('EMAIL_NOT_FOUND')) {
        console.log('💡 Hint: Email not found in Firebase. Check if user exists.');
      } else if (errorMsg.includes('INVALID_PASSWORD')) {
        console.log('💡 Hint: Invalid password. Check credentials.');
      } else if (errorMsg.includes('USER_DISABLED')) {
        console.log('💡 Hint: User account is disabled.');
      }
    }
  } catch (error: any) {
    console.log('❌ Network error:', error.message);
  }
}

/**
 * Export complete diagnostic report as JSON
 */
export async function exportDiagnosticReport(): Promise<string> {
  const result = await testFirebaseConnection();
  
  const report = {
    timestamp: new Date().toISOString(),
    domain: window.location.hostname,
    protocol: window.location.protocol,
    ...result
  };

  return JSON.stringify(report, null, 2);
}
