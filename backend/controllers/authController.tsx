import { Request, Response } from 'express';
import { auth, db } from '../config/database';
import { validationResult } from 'express-validator';
import { IAdmin } from '../models/Admin';

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    // Check if email already exists in Firestore
    const existingAdmin = await db.collection('admins').where('email', '==', email).get();
    if (!existingAdmin.empty) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    // Create Firebase auth user
    const userRecord = await auth.createUser({
      email,
      password,
    });

    // Store admin info in Firestore
    const adminData: IAdmin = {
      name,
      email,
      firebaseUid: userRecord.uid,
      role: role || 'editor',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.collection('admins').doc(userRecord.uid).set(adminData);

    // Get custom claims token
    const customToken = await auth.createCustomToken(userRecord.uid);

    res.status(201).json({
      message: 'Admin registered successfully',
      token: customToken,
      admin: {
        id: userRecord.uid,
        name: adminData.name,
        email: adminData.email,
        role: adminData.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    try {
      const user = await auth.getUserByEmail(email);
      const customToken = await auth.createCustomToken(user.uid);

      const adminDoc = await db.collection('admins').doc(user.uid).get();
      if (!adminDoc.exists) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const adminData = adminDoc.data() as IAdmin;

      res.json({
        message: 'Login successful',
        token: customToken,
        admin: {
          id: user.uid,
          name: adminData.name,
          email: adminData.email,
          role: adminData.role,
        },
      });
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      throw error;
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getAdmins = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('admins').get();
    const admins = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(admins);
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, email } = req.body;

    const updateData: any = {};
    if (role) updateData.role = role;
    if (email) updateData.email = email;
    updateData.updatedAt = Date.now();

    await db.collection('admins').doc(id).update(updateData);

    const adminDoc = await db.collection('admins').doc(id).get();
    const adminData = adminDoc.data();

    res.json({ message: 'Admin updated successfully', admin: { id: adminDoc.id, ...adminData } });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Delete from Firestore
    await db.collection('admins').doc(id).delete();

    // Delete Firebase auth user
    await auth.deleteUser(id);

    res.json({ message: 'Admin deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
