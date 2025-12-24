import express, { Router } from 'express';
import {
  getAllTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  approveTestimonial,
  deleteTestimonial,
  reorderTestimonials,
} from '../controllers/testimonialController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router: Router = express.Router();

// Public routes
router.get('/', getAllTestimonials);
router.post('/', createTestimonial); // Allow public testimonial submission

// Protected routes (Admin only)
router.get('/:id', authMiddleware, getTestimonialById);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['super_admin', 'editor']),
  updateTestimonial
);

router.patch(
  '/:id/approve',
  authMiddleware,
  roleMiddleware(['super_admin', 'editor']),
  approveTestimonial
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['super_admin']),
  deleteTestimonial
);

// Reorder testimonials
router.post(
  '/bulk/reorder',
  authMiddleware,
  roleMiddleware(['super_admin', 'editor']),
  reorderTestimonials
);

export default router;
