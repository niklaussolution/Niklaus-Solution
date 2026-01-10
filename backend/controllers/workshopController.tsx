import { Request, Response } from 'express';
import { getDatabase } from '../config/database';
import { IWorkshop, WORKSHOPS_COLLECTION } from '../models/Workshop';

const db = getDatabase();

// Get all workshops (with optional filtering)
export const getAllWorkshops = async (req: Request, res: Response) => {
  try {
    const { isActive, isFeatured } = req.query;
    
    let query: any = db.collection(WORKSHOPS_COLLECTION);
    
    if (isActive === 'true') {
      query = query.where('isActive', '==', true);
    }
    
    if (isFeatured === 'true') {
      query = query.where('isFeatured', '==', true);
    }
    
    const snapshot = await query.orderBy('startDate', 'asc').get();
    
    const workshops = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    res.json({
      success: true,
      count: workshops.length,
      data: workshops,
    });
  } catch (error: any) {
    console.error('Error fetching workshops:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching workshops',
      error: error.message,
    });
  }
};

// Get workshop by ID
export const getWorkshopById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const doc = await db.collection(WORKSHOPS_COLLECTION).doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Workshop not found',
      });
    }
    
    res.json({
      success: true,
      data: { id: doc.id, ...doc.data() },
    });
  } catch (error: any) {
    console.error('Error fetching workshop:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching workshop',
      error: error.message,
    });
  }
};

// Create new workshop
export const createWorkshop = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      duration,
      mode,
      startDate,
      price,
      instructorId,
      instructorName,
      capacity,
      color,
      learningOutcomes,
      requirements,
      image,
      certificateTemplate,
    } = req.body;

    // Validation
    if (!title || !description || !duration || !mode || !startDate || price === undefined || !instructorId || !capacity || !color) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, duration, mode, startDate, price, instructorId, capacity, color',
      });
    }

    if (!['Online', 'Offline', 'Hybrid'].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: 'Mode must be one of: Online, Offline, Hybrid',
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative',
      });
    }

    if (capacity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be greater than 0',
      });
    }

    const newWorkshop: IWorkshop = {
      title,
      description,
      duration,
      mode,
      startDate,
      price,
      instructorId,
      instructorName: instructorName || '',
      capacity,
      enrolled: 0,
      color,
      isFeatured: false,
      isActive: true,
      learningOutcomes: learningOutcomes || [],
      requirements: requirements || [],
      image: image || '',
      certificateTemplate: certificateTemplate || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const docRef = await db.collection(WORKSHOPS_COLLECTION).add(newWorkshop);

    res.status(201).json({
      success: true,
      message: 'Workshop created successfully',
      data: { id: docRef.id, ...newWorkshop },
    });
  } catch (error: any) {
    console.error('Error creating workshop:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating workshop',
      error: error.message,
    });
  }
};

// Update workshop
export const updateWorkshop = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validation for specific fields
    if (updates.mode && !['Online', 'Offline', 'Hybrid'].includes(updates.mode)) {
      return res.status(400).json({
        success: false,
        message: 'Mode must be one of: Online, Offline, Hybrid',
      });
    }

    if (updates.price !== undefined && updates.price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative',
      });
    }

    if (updates.capacity !== undefined && updates.capacity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be greater than 0',
      });
    }

    updates.updatedAt = Date.now();

    await db.collection(WORKSHOPS_COLLECTION).doc(id).update(updates);

    const updatedDoc = await db.collection(WORKSHOPS_COLLECTION).doc(id).get();

    res.json({
      success: true,
      message: 'Workshop updated successfully',
      data: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error: any) {
    console.error('Error updating workshop:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating workshop',
      error: error.message,
    });
  }
};

// Delete workshop
export const deleteWorkshop = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if workshop exists
    const doc = await db.collection(WORKSHOPS_COLLECTION).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Workshop not found',
      });
    }

    await db.collection(WORKSHOPS_COLLECTION).doc(id).delete();

    res.json({
      success: true,
      message: 'Workshop deleted successfully',
      data: { id },
    });
  } catch (error: any) {
    console.error('Error deleting workshop:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting workshop',
      error: error.message,
    });
  }
};

// Update enrollment count
export const updateEnrollment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { increment = 1 } = req.body;

    const doc = await db.collection(WORKSHOPS_COLLECTION).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Workshop not found',
      });
    }

    const currentEnrolled = (doc.data() as any).enrolled || 0;
    const newEnrolled = Math.max(0, currentEnrolled + increment);

    await db.collection(WORKSHOPS_COLLECTION).doc(id).update({
      enrolled: newEnrolled,
      updatedAt: Date.now(),
    });

    const updatedDoc = await db.collection(WORKSHOPS_COLLECTION).doc(id).get();

    res.json({
      success: true,
      message: 'Enrollment updated successfully',
      data: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error: any) {
    console.error('Error updating enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating enrollment',
      error: error.message,
    });
  }
};

// Bulk update workshops (for reordering, activating/deactivating)
export const bulkUpdateWorkshops = async (req: Request, res: Response) => {
  try {
    const { updates } = req.body; // Array of { id, updates }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates must be a non-empty array',
      });
    }

    const batch = db.batch();
    
    updates.forEach(({ id, data }: any) => {
      const docRef = db.collection(WORKSHOPS_COLLECTION).doc(id);
      batch.update(docRef, { ...data, updatedAt: Date.now() });
    });

    await batch.commit();

    res.json({
      success: true,
      message: `${updates.length} workshops updated successfully`,
    });
  } catch (error: any) {
    console.error('Error bulk updating workshops:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk updating workshops',
      error: error.message,
    });
  }
};
