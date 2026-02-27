import { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    } as any),
  });
}

const auth = admin.auth();
const db = admin.firestore();

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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Use Firebase REST API to sign in with email and password
    const firebaseApiKey = process.env.FIREBASE_API_KEY;
    if (!firebaseApiKey) {
      throw new Error('FIREBASE_API_KEY not set');
    }

    const signInResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });

    const signInData = await signInResponse.json();

    if (!signInResponse.ok) {
      if (signInData.error?.message === 'INVALID_PASSWORD' || signInData.error?.message === 'EMAIL_NOT_FOUND') {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      throw new Error(signInData.error?.message || 'Authentication failed');
    }

    const uid = signInData.localId;
    const idToken = signInData.idToken;

    // Get student data from Firestore
    const studentDoc = await db.collection('students').doc(uid).get();

    if (!studentDoc.exists) {
      return res.status(401).json({ message: 'Student account not found' });
    }

    const studentData = studentDoc.data();

    return res.status(200).json({
      message: 'Login successful',
      token: idToken,
      student: {
        id: uid,
        name: studentData?.name,
        email: studentData?.email,
        phone: studentData?.phone,
        enrolledWorkshops: studentData?.enrolledWorkshops || [],
        certificates: studentData?.certificates || [],
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};
