import { Router, Request, Response } from 'express';
import { scholarshipController } from '../controllers/scholarshipController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// Get all scholarships (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const result = await scholarshipController.getAllScholarships({
      category,
      isActive: true,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get scholarship by ID (public)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await scholarshipController.getScholarshipById(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Create scholarship (protected - editor+)
router.post('/', authMiddleware, roleMiddleware(['editor']), async (req: Request, res: Response) => {
  try {
    const result = await scholarshipController.createScholarship(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update scholarship (protected - editor+)
router.put('/:id', authMiddleware, roleMiddleware(['editor']), async (req: Request, res: Response) => {
  try {
    const result = await scholarshipController.updateScholarship(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Delete scholarship (protected - super_admin)
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin']), async (req: Request, res: Response) => {
  try {
    const result = await scholarshipController.deleteScholarship(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Award scholarship to user (protected - editor+)
router.post('/:id/award', authMiddleware, roleMiddleware(['editor']), async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }
    const result = await scholarshipController.awardScholarship(req.params.id, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Reorder scholarships (protected - editor+)
router.post('/bulk/reorder', authMiddleware, roleMiddleware(['editor']), async (req: Request, res: Response) => {
  try {
    const { scholarshipIds } = req.body;
    if (!Array.isArray(scholarshipIds)) {
      return res.status(400).json({ success: false, error: 'scholarshipIds must be an array' });
    }
    const result = await scholarshipController.reorderScholarships(scholarshipIds);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get scholarship statistics (protected - editor+)
router.get('/stats/all', authMiddleware, roleMiddleware(['editor']), async (req: Request, res: Response) => {
  try {
    const result = await scholarshipController.getScholarshipStats();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
