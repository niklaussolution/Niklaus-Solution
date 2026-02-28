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
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};
