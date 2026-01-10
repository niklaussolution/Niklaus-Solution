import express, { Router } from 'express';
import {
  getAllTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  updateTrainerRating,
  reorderTrainers,
} from '../controllers/trainerController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router: Router = express.Router();

// Public routes
router.get('/', getAllTrainers);
router.get('/:id', getTrainerById);

// Protected routes (Admin only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['super_admin', 'editor']),
  createTrainer
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['super_admin', 'editor']),
  updateTrainer
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['super_admin']),
  deleteTrainer
);

// Update rating
router.patch(
  '/:id/rating',
  authMiddleware,
  roleMiddleware(['super_admin', 'editor']),
  updateTrainerRating
);

// Reorder trainers
router.post(
  '/bulk/reorder',
  authMiddleware,
  roleMiddleware(['super_admin', 'editor']),
  reorderTrainers
);

export default router;
