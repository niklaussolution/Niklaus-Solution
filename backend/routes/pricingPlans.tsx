import express, { Router } from 'express';
import {
  getAllPricingPlans,
  getPricingPlanById,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  reorderPricingPlans,
} from '../controllers/pricingPlanController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router: Router = express.Router();

// Public routes
router.get('/', getAllPricingPlans);
router.get('/:id', getPricingPlanById);

// Protected routes (Admin only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['super_admin', 'editor']),
  createPricingPlan
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['super_admin', 'editor']),
  updatePricingPlan
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['super_admin']),
  deletePricingPlan
);

// Reorder pricing plans
router.post(
  '/bulk/reorder',
  authMiddleware,
  roleMiddleware(['super_admin', 'editor']),
  reorderPricingPlans
);

export default router;
