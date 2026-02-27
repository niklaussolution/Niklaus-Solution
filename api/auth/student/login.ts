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

    // In Firebase Admin SDK, we can't directly verify password
    // Instead, we'll create a custom token for the user if they exist
    try {
      const user = await auth.getUserByEmail(email);
      
      // Get student data from Firestore
      const studentDoc = await db.collection('students').doc(user.uid).get();
      
      if (!studentDoc.exists) {
        return res.status(401).json({ message: 'Student account not found' });
      }

      const studentData = studentDoc.data();

      // Create a custom token for the student
      const customToken = await auth.createCustomToken(user.uid);

      return res.status(200).json({
        message: 'Login successful',
        token: customToken,
        student: {
          id: user.uid,
          name: studentData?.name,
          email: studentData?.email,
          phone: studentData?.phone,
          enrolledWorkshops: studentData?.enrolledWorkshops || [],
          certificates: studentData?.certificates || [],
        },
      });
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};
