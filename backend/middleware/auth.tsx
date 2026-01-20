import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/database';
import { db } from '../config/database';

export interface AuthRequest extends Request {
  admin?: any;
  uid?: string;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.uid = decodedToken.uid;

    // Get admin info from Firestore
    const adminDoc = await db.collection('admins').doc(decodedToken.uid).get();
    if (!adminDoc.exists) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    req.admin = { id: adminDoc.id, ...adminDoc.data() };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
};

