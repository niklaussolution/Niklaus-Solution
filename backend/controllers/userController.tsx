import { Request, Response } from 'express';
import { db } from '../config/database';
import { IUser, USERS_COLLECTION } from '../models/User';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    let query = db.collection(USERS_COLLECTION);

    if (status) {
      query = query.where('status', '==', status);
    }

    let snapshot = await query.orderBy('createdAt', 'desc').get();
    let users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (search) {
      const searchLower = (search as string).toLowerCase();
      users = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const doc = await db.collection(USERS_COLLECTION).doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, workshop, status, notes } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const existingUser = await db.collection(USERS_COLLECTION).where('email', '==', email).get();
    if (!existingUser.empty) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const newUser: IUser = {
      name,
      email,
      phone: phone || '',
      workshop: workshop || '',
      registeredAt: Date.now(),
      status: status || 'registered',
      notes: notes || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const docRef = await db.collection(USERS_COLLECTION).add(newUser);

    res.status(201).json({
      message: 'User created successfully',
      data: { id: docRef.id, ...newUser },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, workshop, status, notes } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (workshop !== undefined) updateData.workshop = workshop;
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    updateData.updatedAt = Date.now();

    await db.collection(USERS_COLLECTION).doc(id).update(updateData);

    const updatedDoc = await db.collection(USERS_COLLECTION).doc(id).get();

    res.json({
      message: 'User updated successfully',
      data: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await db.collection(USERS_COLLECTION).doc(id).delete();

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};
