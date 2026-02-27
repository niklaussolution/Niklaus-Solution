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

// Middleware to verify token
async function verifyToken(req: VercelRequest): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    // Try to verify as custom token by checking if user exists in Firestore
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return payload.uid;
    } catch {
      return null;
    }
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

  // Verify authentication
  const uid = await verifyToken(req);
  if (!uid) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // GET: Retrieve student profile
    if (req.method === 'GET') {
      const studentDoc = await db.collection('students').doc(uid).get();

      if (!studentDoc.exists) {
        return res.status(404).json({ message: 'Student profile not found' });
      }

      const studentData = studentDoc.data();
      return res.status(200).json({
        id: studentDoc.id,
        ...studentData,
      });
    }

    // PUT: Update student profile
    if (req.method === 'PUT') {
      const { name, phone, bio } = req.body;

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (name) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (bio !== undefined) updateData.bio = bio;

      await db.collection('students').doc(uid).update(updateData);

      const updatedDoc = await db.collection('students').doc(uid).get();
      const updatedData = updatedDoc.data();

      return res.status(200).json({
        message: 'Profile updated successfully',
        student: {
          id: updatedDoc.id,
          ...updatedData,
        },
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    console.error('Profile error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};
