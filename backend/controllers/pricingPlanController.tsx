import { Request, Response } from 'express';
import { getDatabase } from '../config/database';
import { IPricingPlan, PRICING_PLANS_COLLECTION } from '../models/PricingPlan';

const db = getDatabase();

// Get all pricing plans
export const getAllPricingPlans = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.query;

    let query: any = db.collection(PRICING_PLANS_COLLECTION);

    if (isActive === 'true') {
      query = query.where('isActive', '==', true);
    }

    const snapshot = await query.orderBy('order', 'asc').get();

    const plans = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error: any) {
    console.error('Error fetching pricing plans:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pricing plans',
      error: error.message,
    });
  }
};

// Get pricing plan by ID
export const getPricingPlanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doc = await db.collection(PRICING_PLANS_COLLECTION).doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found',
      });
    }

    res.json({
      success: true,
      data: { id: doc.id, ...doc.data() },
    });
  } catch (error: any) {
    console.error('Error fetching pricing plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pricing plan',
      error: error.message,
    });
  }
};

// Create new pricing plan
export const createPricingPlan = async (req: Request, res: Response) => {
  try {
    const {
      name,
      price,
      duration,
      description,
      features,
      isPopular,
      discountCode,
      discountPercentage,
      validFrom,
      validTo,
      order,
    } = req.body;

    // Validation
    if (!name || !price === undefined || !duration || !description || !Array.isArray(features)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, price, duration, description, features',
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative',
      });
    }

    if (discountPercentage !== undefined && (discountPercentage < 0 || discountPercentage > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Discount percentage must be between 0 and 100',
      });
    }

    const newPlan: IPricingPlan = {
      name,
      price,
      duration,
      description,
      features,
      isPopular: isPopular || false,
      discountCode: discountCode || '',
      discountPercentage: discountPercentage || 0,
      validFrom: validFrom || '',
      validTo: validTo || '',
      order: order || 0,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const docRef = await db.collection(PRICING_PLANS_COLLECTION).add(newPlan);

    res.status(201).json({
      success: true,
      message: 'Pricing plan created successfully',
      data: { id: docRef.id, ...newPlan },
    });
  } catch (error: any) {
    console.error('Error creating pricing plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating pricing plan',
      error: error.message,
    });
  }
};

// Update pricing plan
export const updatePricingPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validation for specific fields
    if (updates.price !== undefined && updates.price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative',
      });
    }

    if (
      updates.discountPercentage !== undefined &&
      (updates.discountPercentage < 0 || updates.discountPercentage > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Discount percentage must be between 0 and 100',
      });
    }

    updates.updatedAt = Date.now();

    await db.collection(PRICING_PLANS_COLLECTION).doc(id).update(updates);

    const updatedDoc = await db.collection(PRICING_PLANS_COLLECTION).doc(id).get();

    res.json({
      success: true,
      message: 'Pricing plan updated successfully',
      data: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error: any) {
    console.error('Error updating pricing plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating pricing plan',
      error: error.message,
    });
  }
};

// Delete pricing plan
export const deletePricingPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if plan exists
    const doc = await db.collection(PRICING_PLANS_COLLECTION).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found',
      });
    }

    await db.collection(PRICING_PLANS_COLLECTION).doc(id).delete();

    res.json({
      success: true,
      message: 'Pricing plan deleted successfully',
      data: { id },
    });
  } catch (error: any) {
    console.error('Error deleting pricing plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting pricing plan',
      error: error.message,
    });
  }
};

// Reorder pricing plans
export const reorderPricingPlans = async (req: Request, res: Response) => {
  try {
    const { updates } = req.body; // Array of { id, order }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates must be a non-empty array',
      });
    }

    const batch = db.batch();

    updates.forEach(({ id, order }: any) => {
      const docRef = db.collection(PRICING_PLANS_COLLECTION).doc(id);
      batch.update(docRef, { order, updatedAt: Date.now() });
    });

    await batch.commit();

    res.json({
      success: true,
      message: `${updates.length} pricing plans reordered successfully`,
    });
  } catch (error: any) {
    console.error('Error reordering pricing plans:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering pricing plans',
      error: error.message,
    });
  }
};
