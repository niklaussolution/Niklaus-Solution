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
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // Check if email already exists
    const existingStudent = await db.collection('students').where('email', '==', email).limit(1).get();
    if (!existingStudent.empty) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create Firebase auth user
    const userRecord = await auth.createUser({
      email,
      password,
    });

    // Store student info in Firestore
    const studentData = {
      firebaseUid: userRecord.uid,
      name,
      email,
      phone: phone || '',
      enrolledWorkshops: [],
      certificates: [],
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('students').doc(userRecord.uid).set(studentData);

    // Create custom token
    const customToken = await auth.createCustomToken(userRecord.uid);

    return res.status(201).json({
      message: 'Student registered successfully',
      token: customToken,
      student: {
        id: userRecord.uid,
        name: studentData.name,
        email: studentData.email,
        phone: studentData.phone,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Handle specific Firebase auth errors
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ message: 'Email already registered' });
    }
    if (error.code === 'auth/weak-password') {
      return res.status(400).json({ message: 'Password is too weak' });
    }
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};
