import { Request, Response } from 'express';
import { getDatabase } from '../config/database';
import { ITestimonial, TESTIMONIALS_COLLECTION } from '../models/Testimonial';

const db = getDatabase();

// Get all testimonials
export const getAllTestimonials = async (req: Request, res: Response) => {
  try {
    const { isApproved, isFeatured, isActive } = req.query;

    let query: any = db.collection(TESTIMONIALS_COLLECTION);

    if (isApproved === 'true') {
      query = query.where('isApproved', '==', true);
    }

    if (isFeatured === 'true') {
      query = query.where('isFeatured', '==', true);
    }

    if (isActive === 'true') {
      query = query.where('isActive', '==', true);
    }

    const snapshot = await query.orderBy('order', 'asc').get();

    const testimonials = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      count: testimonials.length,
      data: testimonials,
    });
  } catch (error: any) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching testimonials',
      error: error.message,
    });
  }
};

// Get testimonial by ID
export const getTestimonialById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doc = await db.collection(TESTIMONIALS_COLLECTION).doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
    }

    res.json({
      success: true,
      data: { id: doc.id, ...doc.data() },
    });
  } catch (error: any) {
    console.error('Error fetching testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching testimonial',
      error: error.message,
    });
  }
};

// Create new testimonial
export const createTestimonial = async (req: Request, res: Response) => {
  try {
    const {
      name,
      photo,
      company,
      role,
      review,
      rating,
      workshopId,
      workshopTitle,
      email,
    } = req.body;

    // Validation
    if (!name || !company || !role || !review || !workshopId || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, company, role, review, workshopId, rating',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    if (review.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Review must be at least 10 characters long',
      });
    }

    const newTestimonial: ITestimonial = {
      name,
      photo: photo || '',
      company,
      role,
      review,
      rating,
      workshopId,
      workshopTitle: workshopTitle || '',
      email: email || '',
      isFeatured: false,
      isApproved: false,
      isActive: true,
      order: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const docRef = await db.collection(TESTIMONIALS_COLLECTION).add(newTestimonial);

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: { id: docRef.id, ...newTestimonial },
    });
  } catch (error: any) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating testimonial',
      error: error.message,
    });
  }
};

// Update testimonial
export const updateTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validation for rating
    if (updates.rating !== undefined && (updates.rating < 1 || updates.rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    if (updates.review && updates.review.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Review must be at least 10 characters long',
      });
    }

    updates.updatedAt = Date.now();

    await db.collection(TESTIMONIALS_COLLECTION).doc(id).update(updates);

    const updatedDoc = await db.collection(TESTIMONIALS_COLLECTION).doc(id).get();

    res.json({
      success: true,
      message: 'Testimonial updated successfully',
      data: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error: any) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating testimonial',
      error: error.message,
    });
  }
};

// Approve/Reject testimonial
export const approveTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    await db.collection(TESTIMONIALS_COLLECTION).doc(id).update({
      isApproved,
      updatedAt: Date.now(),
    });

    const updatedDoc = await db.collection(TESTIMONIALS_COLLECTION).doc(id).get();

    res.json({
      success: true,
      message: `Testimonial ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error: any) {
    console.error('Error approving testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving testimonial',
      error: error.message,
    });
  }
};

// Delete testimonial
export const deleteTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doc = await db.collection(TESTIMONIALS_COLLECTION).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
    }

    await db.collection(TESTIMONIALS_COLLECTION).doc(id).delete();

    res.json({
      success: true,
      message: 'Testimonial deleted successfully',
      data: { id },
    });
  } catch (error: any) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting testimonial',
      error: error.message,
    });
  }
};

// Reorder testimonials
export const reorderTestimonials = async (req: Request, res: Response) => {
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
      const docRef = db.collection(TESTIMONIALS_COLLECTION).doc(id);
      batch.update(docRef, { order, updatedAt: Date.now() });
    });

    await batch.commit();

    res.json({
      success: true,
      message: `${updates.length} testimonials reordered successfully`,
    });
  } catch (error: any) {
    console.error('Error reordering testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering testimonials',
      error: error.message,
    });
  }
};
