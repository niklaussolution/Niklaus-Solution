import express, { Router } from 'express';
import {
  getAllRegistrations,
  getRegistrationById,
  createRegistration,
  updateRegistration,
  updateRegistrationStatus,
  deleteRegistration,
  getRegistrationStats,
  bulkUpdateRegistrations,
} from '../controllers/registrationController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router: Router = express.Router();

// Public routes
router.post('/', createRegistration);

// Protected routes (Admin only)
router.get('/', authMiddleware, getAllRegistrations);
router.get('/stats', authMiddleware, getRegistrationStats);
router.get('/:id', authMiddleware, getRegistrationById);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['super_admin', 'editor']),
  updateRegistration
);

router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware(['super_admin', 'editor']),
  updateRegistrationStatus
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['super_admin']),
  deleteRegistration
);

// Bulk operations
router.post(
  '/bulk/update',
  authMiddleware,
  roleMiddleware(['super_admin', 'editor']),
  bulkUpdateRegistrations
);

export default router;
