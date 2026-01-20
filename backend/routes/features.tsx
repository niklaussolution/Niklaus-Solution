import { Router, Request, Response } from 'express';
import { featureController } from '../controllers/featureController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// Get all features (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const result = await featureController.getAllFeatures({
      category,
      isActive: true,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get feature by ID (public)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await featureController.getFeatureById(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Create feature (protected - editor+)
router.post('/', authMiddleware, roleMiddleware(['editor']), async (req: Request, res: Response) => {
  try {
    const result = await featureController.createFeature(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update feature (protected - editor+)
router.put('/:id', authMiddleware, roleMiddleware(['editor']), async (req: Request, res: Response) => {
  try {
    const result = await featureController.updateFeature(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Delete feature (protected - super_admin)
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin']), async (req: Request, res: Response) => {
  try {
    const result = await featureController.deleteFeature(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Reorder features (protected - editor+)
router.post('/bulk/reorder', authMiddleware, roleMiddleware(['editor']), async (req: Request, res: Response) => {
  try {
    const { featureIds } = req.body;
    if (!Array.isArray(featureIds)) {
      return res.status(400).json({ success: false, error: 'featureIds must be an array' });
    }
    const result = await featureController.reorderFeatures(featureIds);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get feature statistics (protected - editor+)
router.get('/stats/all', authMiddleware, roleMiddleware(['editor']), async (req: Request, res: Response) => {
  try {
    const result = await featureController.getFeatureStats();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
