import { Request, Response } from 'express';
import { getDatabase } from '../config/database';
import { ITrainer, TRAINERS_COLLECTION } from '../models/Trainer';

const db = getDatabase();

// Get all trainers
export const getAllTrainers = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.query;

    let query: any = db.collection(TRAINERS_COLLECTION);

    if (isActive === 'true') {
      query = query.where('isActive', '==', true);
    }

    const snapshot = await query.orderBy('order', 'asc').get();

    const trainers = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      count: trainers.length,
      data: trainers,
    });
  } catch (error: any) {
    console.error('Error fetching trainers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trainers',
      error: error.message,
    });
  }
};

// Get trainer by ID
export const getTrainerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doc = await db.collection(TRAINERS_COLLECTION).doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found',
      });
    }

    res.json({
      success: true,
      data: { id: doc.id, ...doc.data() },
    });
  } catch (error: any) {
    console.error('Error fetching trainer:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trainer',
      error: error.message,
    });
  }
};

// Create new trainer
export const createTrainer = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      photo,
      bio,
      expertise,
      experience,
      qualifications,
      socialLinks,
      order,
    } = req.body;

    // Validation
    if (!name || !email || !phone || !bio || !Array.isArray(expertise) || expertise.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, phone, bio, expertise (non-empty array)',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address',
      });
    }

    const newTrainer: ITrainer = {
      name,
      email,
      phone,
      photo: photo || '',
      bio,
      expertise,
      experience: experience || '',
      qualifications: qualifications || [],
      workshopIds: [],
      socialLinks: socialLinks || {},
      rating: 0,
      reviewCount: 0,
      isActive: true,
      order: order || 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const docRef = await db.collection(TRAINERS_COLLECTION).add(newTrainer);

    res.status(201).json({
      success: true,
      message: 'Trainer created successfully',
      data: { id: docRef.id, ...newTrainer },
    });
  } catch (error: any) {
    console.error('Error creating trainer:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating trainer',
      error: error.message,
    });
  }
};

// Update trainer
export const updateTrainer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validation for email if provided
    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email address',
        });
      }
    }

    // Validation for expertise
    if (updates.expertise && (!Array.isArray(updates.expertise) || updates.expertise.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Expertise must be a non-empty array',
      });
    }

    updates.updatedAt = Date.now();

    await db.collection(TRAINERS_COLLECTION).doc(id).update(updates);

    const updatedDoc = await db.collection(TRAINERS_COLLECTION).doc(id).get();

    res.json({
      success: true,
      message: 'Trainer updated successfully',
      data: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error: any) {
    console.error('Error updating trainer:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating trainer',
      error: error.message,
    });
  }
};

// Delete trainer
export const deleteTrainer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doc = await db.collection(TRAINERS_COLLECTION).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found',
      });
    }

    await db.collection(TRAINERS_COLLECTION).doc(id).delete();

    res.json({
      success: true,
      message: 'Trainer deleted successfully',
      data: { id },
    });
  } catch (error: any) {
    console.error('Error deleting trainer:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting trainer',
      error: error.message,
    });
  }
};

// Update trainer rating
export const updateTrainerRating = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, reviewCount } = req.body;

    if (rating === undefined || rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 0 and 5',
      });
    }

    await db.collection(TRAINERS_COLLECTION).doc(id).update({
      rating,
      reviewCount: reviewCount || 0,
      updatedAt: Date.now(),
    });

    const updatedDoc = await db.collection(TRAINERS_COLLECTION).doc(id).get();

    res.json({
      success: true,
      message: 'Trainer rating updated successfully',
      data: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error: any) {
    console.error('Error updating trainer rating:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating trainer rating',
      error: error.message,
    });
  }
};

// Reorder trainers
export const reorderTrainers = async (req: Request, res: Response) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates must be a non-empty array',
      });
    }

    const batch = db.batch();

    updates.forEach(({ id, order }: any) => {
      const docRef = db.collection(TRAINERS_COLLECTION).doc(id);
      batch.update(docRef, { order, updatedAt: Date.now() });
    });

    await batch.commit();

    res.json({
      success: true,
      message: `${updates.length} trainers reordered successfully`,
    });
  } catch (error: any) {
    console.error('Error reordering trainers:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering trainers',
      error: error.message,
    });
  }
};
