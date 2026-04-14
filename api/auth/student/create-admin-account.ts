import { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let auth: any;
let db: any;

function initializeFirebase() {
  try {
    // Check if Firebase is already initialized
    if (admin.apps && admin.apps.length > 0) {
      auth = admin.auth();
      db = admin.firestore();
      return;
    }

    // Validate environment variables
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error('Missing required Firebase environment variables: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, or FIREBASE_CLIENT_EMAIL');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      } as any),
    });

    auth = admin.auth();
    db = admin.firestore();
  } catch (initError: any) {
    console.error('Firebase initialization error:', initError);
    throw initError;
  }
}

export default async (req: VercelRequest, res: VercelResponse) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Initialize Firebase within try-catch
    initializeFirebase();

    const { email, name, phone, organization, workshopTitle } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required' });
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!';

    // Create Firebase Auth user
    let uid: string;
    try {
      const userRecord = await auth.createUser({
        email: email,
        password: tempPassword,
        displayName: name,
      });
      uid = userRecord.uid;
    } catch (err: any) {
      // User might already exist
      if (err.code === 'auth/email-already-exists') {
        try {
          const userRecord = await auth.getUserByEmail(email);
          uid = userRecord.uid;
        } catch (getUserErr) {
          throw new Error('Failed to handle existing user');
        }
      } else {
        throw err;
      }
    }

    // Update or create student document in Firestore
    const studentRef = admin.firestore().collection('students').doc(uid);
    const studentDoc = await studentRef.get();

    if (!studentDoc.exists) {
      await studentRef.set({
        firebaseUid: uid,
        name: name,
        email: email,
        phone: phone || '',
        organization: organization || '',
        enrolledWorkshops: workshopTitle ? [workshopTitle] : [],
        certificates: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        manuallyRegistered: true,
        tempPasswordSet: true,
      });
    } else {
      // Update existing student
      const currentData = studentDoc.data();
      await studentRef.update({
        name: name,
        phone: phone || currentData?.phone,
        organization: organization || currentData?.organization,
        enrolledWorkshops: workshopTitle
          ? Array.from(new Set([...(currentData?.enrolledWorkshops || []), workshopTitle]))
          : currentData?.enrolledWorkshops || [],
        updatedAt: new Date(),
        manuallyRegistered: true,
      });
    }

    return res.status(200).json({
      message: 'Account created successfully',
      uid: uid,
      email: email,
      tempPassword: tempPassword,
      requiresPasswordChange: true,
    });
  } catch (error: any) {
    console.error('Error creating admin account:', error);
    
    // Determine error message
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error.message?.includes('Missing required Firebase')) {
      errorMessage = error.message;
      statusCode = 503; // Service Unavailable
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
      statusCode = 400;
    } else if (error.code === 'auth/email-already-exists') {
      errorMessage = 'Email already exists';
      statusCode = 409;
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak';
      statusCode = 400;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return res.status(statusCode).json({
      message: errorMessage,
      error: error.message || 'Unknown error',
      code: error.code || 'UNKNOWN_ERROR',
    });
  }
};
