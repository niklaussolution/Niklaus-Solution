import { Router, Request, Response } from 'express';
import { faqController } from '../controllers/faqController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// Get all FAQs (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const workshopId = req.query.workshopId as string | undefined;
    const result = await faqController.getAllFAQs({ category, workshopId });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get FAQ by ID (public)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await faqController.getFAQById(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Create FAQ (protected - editor+)
router.post('/', authMiddleware, roleMiddleware(['editor']), async (req: Request, res: Response) => {
  try {
    const result = await faqController.createFAQ(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update FAQ (protected - editor+)
router.put('/:id', authMiddleware, roleMiddleware(['editor']), async (req: Request, res: Response) => {
  try {
    const result = await faqController.updateFAQ(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Delete FAQ (protected - super_admin)
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin']), async (req: Request, res: Response) => {
  try {
    const result = await faqController.deleteFAQ(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Record helpful vote (public)
router.post('/:id/helpful', async (req: Request, res: Response) => {
  try {
    const { isHelpful } = req.body;
    if (typeof isHelpful !== 'boolean') {
      return res.status(400).json({ success: false, error: 'isHelpful must be boolean' });
    }
    const result = await faqController.recordHelpful(req.params.id, isHelpful);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Reorder FAQs (protected - editor+)
router.post('/bulk/reorder', authMiddleware, roleMiddleware(['editor']), async (req: Request, res: Response) => {
  try {
    const { faqIds } = req.body;
    if (!Array.isArray(faqIds)) {
      return res.status(400).json({ success: false, error: 'faqIds must be an array' });
    }
    const result = await faqController.reorderFAQs(faqIds);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get FAQ statistics (protected - editor+)
router.get('/stats/all', authMiddleware, roleMiddleware(['editor']), async (req: Request, res: Response) => {
  try {
    const result = await faqController.getFAQStats();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
