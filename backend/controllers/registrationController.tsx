import { Request, Response } from 'express';
import { getDatabase } from '../config/database.js';
import { IRegistration, REGISTRATIONS_COLLECTION } from '../models/Registration.js';
import { WORKSHOPS_COLLECTION } from '../models/Workshop.js';

const db = getDatabase();

// Get all registrations (with optional filtering)
export const getAllRegistrations = async (req: Request, res: Response) => {
  try {
    const { workshopId, status, paymentStatus, sortBy = 'registrationDate' } = req.query;

    let query: any = db.collection(REGISTRATIONS_COLLECTION);

    if (workshopId) {
      query = query.where('workshopId', '==', workshopId);
    }

    if (status) {
      query = query.where('status', '==', status);
    }

    if (paymentStatus) {
      query = query.where('paymentStatus', '==', paymentStatus);
    }

    const snapshot = await query.orderBy(sortBy as string, 'desc').get();

    const registrations = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error: any) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registrations',
      error: error.message,
    });
  }
};

// Get registration by ID
export const getRegistrationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doc = await db.collection(REGISTRATIONS_COLLECTION).doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    res.json({
      success: true,
      data: { id: doc.id, ...doc.data() },
    });
  } catch (error: any) {
    console.error('Error fetching registration:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registration',
      error: error.message,
    });
  }
};

// Create new registration
export const createRegistration = async (req: Request, res: Response) => {
  try {
    const {
      userName,
      email,
      phone,
      workshopId,
      workshopTitle,
      amount,
      status,
      paymentStatus,
      notes,
    } = req.body;

    // Validation
    if (!userName || !email || !phone || !workshopId || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userName, email, phone, workshopId, amount',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address',
      });
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number',
      });
    }

    if (amount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount cannot be negative',
      });
    }

    const newRegistration: IRegistration = {
      userName,
      email,
      phone,
      workshopId,
      workshopTitle: workshopTitle || '',
      status: (status as any) || 'Pending',
      paymentStatus: (paymentStatus as any) || 'Pending',
      amount,
      registrationDate: new Date().toISOString(),
      notes: notes || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const docRef = await db.collection(REGISTRATIONS_COLLECTION).add(newRegistration);

    // Increment the workshop's enrolled count
    try {
      const workshopRef = db.collection(WORKSHOPS_COLLECTION).doc(workshopId);
      const workshopDoc = await workshopRef.get();
      
      if (workshopDoc.exists) {
        const currentEnrolled = workshopDoc.data()?.enrolled || 0;
        await workshopRef.update({
          enrolled: currentEnrolled + 1,
          updatedAt: Date.now(),
        });
      }
    } catch (enrollmentError) {
      console.error('Failed to update workshop enrollment count:', enrollmentError);
      // Continue even if enrollment count update fails
    }

    // Forward registration details to team member using backend emailjs utility
    try {
      const { forwardRegistrationToTeam } = await import('../utils/emailForwarder.js');
      await forwardRegistrationToTeam({
        ...newRegistration,
        id: docRef.id,
      });
    } catch (emailError) {
      console.error('Failed to forward registration to team:', emailError);
      // Optionally, you can still proceed even if email fails
    }
    res.status(201).json({
      success: true,
      message: 'Registration created successfully',
      data: { id: docRef.id, ...newRegistration },
    });
  } catch (error: any) {
    console.error('Error creating registration:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating registration',
      error: error.message,
    });
  }
};

// Update registration
export const updateRegistration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validation for specific fields
    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email address',
        });
      }
    }

    if (updates.phone) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(updates.phone.replace(/\D/g, ''))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number',
        });
      }
    }

    if (updates.amount !== undefined && updates.amount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount cannot be negative',
      });
    }

    updates.updatedAt = Date.now();

    await db.collection(REGISTRATIONS_COLLECTION).doc(id).update(updates);

    const updatedDoc = await db.collection(REGISTRATIONS_COLLECTION).doc(id).get();

    res.json({
      success: true,
      message: 'Registration updated successfully',
      data: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error: any) {
    console.error('Error updating registration:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating registration',
      error: error.message,
    });
  }
};

// Update registration status
export const updateRegistrationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, cancellationReason } = req.body;

    if (!status && !paymentStatus) {
      return res.status(400).json({
        success: false,
        message: 'At least one of status or paymentStatus is required',
      });
    }

    const updateData: any = {
      updatedAt: Date.now(),
    };

    if (status) {
      updateData.status = status;
      if (status === 'Confirmed') {
        updateData.confirmationDate = new Date().toISOString();
      }
      if (status === 'Cancelled') {
        updateData.cancellationReason = cancellationReason || '';
      }
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    await db.collection(REGISTRATIONS_COLLECTION).doc(id).update(updateData);

    const updatedDoc = await db.collection(REGISTRATIONS_COLLECTION).doc(id).get();

    res.json({
      success: true,
      message: 'Registration status updated successfully',
      data: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error: any) {
    console.error('Error updating registration status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating registration status',
      error: error.message,
    });
  }
};

// Delete registration
export const deleteRegistration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doc = await db.collection(REGISTRATIONS_COLLECTION).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    const registrationData = doc.data() as IRegistration;
    await db.collection(REGISTRATIONS_COLLECTION).doc(id).delete();

    // Decrement the workshop's enrolled count
    try {
      const workshopRef = db.collection(WORKSHOPS_COLLECTION).doc(registrationData.workshopId);
      const workshopDoc = await workshopRef.get();
      
      if (workshopDoc.exists) {
        const currentEnrolled = workshopDoc.data()?.enrolled || 0;
        await workshopRef.update({
          enrolled: Math.max(0, currentEnrolled - 1), // Ensure it doesn't go below 0
          updatedAt: Date.now(),
        });
      }
    } catch (enrollmentError) {
      console.error('Failed to update workshop enrollment count:', enrollmentError);
      // Continue even if enrollment count update fails
    }

    res.json({
      success: true,
      message: 'Registration deleted successfully',
      data: { id },
    });
  } catch (error: any) {
    console.error('Error deleting registration:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting registration',
      error: error.message,
    });
  }
};

// Get registration statistics
export const getRegistrationStats = async (req: Request, res: Response) => {
  try {
    const { workshopId } = req.query;

    let query: any = db.collection(REGISTRATIONS_COLLECTION);

    if (workshopId) {
      query = query.where('workshopId', '==', workshopId);
    }

    const snapshot = await query.get();
    const registrations = snapshot.docs.map((doc: any) => doc.data());

    const stats = {
      total: registrations.length,
      pending: registrations.filter((r: any) => r.status === 'Pending').length,
      confirmed: registrations.filter((r: any) => r.status === 'Confirmed').length,
      cancelled: registrations.filter((r: any) => r.status === 'Cancelled').length,
      paymentCompleted: registrations.filter((r: any) => r.paymentStatus === 'Completed').length,
      paymentPending: registrations.filter((r: any) => r.paymentStatus === 'Pending').length,
      totalRevenue: registrations.reduce((sum: number, r: any) => sum + (r.amount || 0), 0),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching registration stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registration stats',
      error: error.message,
    });
  }
};

// Bulk update registrations
export const bulkUpdateRegistrations = async (req: Request, res: Response) => {
  try {
    const { registrationIds, status, paymentStatus } = req.body;

    if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'registrationIds must be a non-empty array',
      });
    }

    if (!status && !paymentStatus) {
      return res.status(400).json({
        success: false,
        message: 'At least one of status or paymentStatus is required',
      });
    }

    const batch = db.batch();
    const updateData: any = { updatedAt: Date.now() };

    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    registrationIds.forEach((id: string) => {
      const docRef = db.collection(REGISTRATIONS_COLLECTION).doc(id);
      batch.update(docRef, updateData);
    });

    await batch.commit();

    res.json({
      success: true,
      message: `${registrationIds.length} registrations updated successfully`,
    });
  } catch (error: any) {
    console.error('Error bulk updating registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk updating registrations',
      error: error.message,
    });
  }
};
