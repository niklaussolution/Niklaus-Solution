import express, { Router } from 'express';
import {
  getAllWorkshops,
  getWorkshopById,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  updateEnrollment,
  bulkUpdateWorkshops,
} from '../controllers/workshopController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router: Router = express.Router();

// Public routes
router.get('/', getAllWorkshops);
router.get('/:id', getWorkshopById);

// Protected routes (Admin only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['super_admin', 'editor']),
  createWorkshop
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['super_admin', 'editor']),
  updateWorkshop
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['super_admin']),
  deleteWorkshop
);

// Enrollment management
router.patch(
  '/:id/enrollment',
  authMiddleware,
  roleMiddleware(['super_admin', 'editor']),
  updateEnrollment
);

// Bulk operations
router.post(
  '/bulk/update',
  authMiddleware,
  roleMiddleware(['super_admin', 'editor']),
  bulkUpdateWorkshops
);

export default router;
