import { Router, Request, Response } from 'express';
import { companyController } from '../controllers/companyController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// Get all companies (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await companyController.getAllCompanies();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get company by ID (public)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await companyController.getCompanyById(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Create company (protected - editor+)
router.post('/', authMiddleware, roleMiddleware(['editor']), async (req: Request, res: Response) => {
  try {
    const result = await companyController.createCompany(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update company (protected - editor+)
router.put('/:id', authMiddleware, roleMiddleware(['editor']), async (req: Request, res: Response) => {
  try {
    const result = await companyController.updateCompany(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Delete company (protected - super_admin)
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin']), async (req: Request, res: Response) => {
  try {
    const result = await companyController.deleteCompany(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Reorder companies (protected - editor+)
router.post('/bulk/reorder', authMiddleware, roleMiddleware(['editor']), async (req: Request, res: Response) => {
  try {
    const { companyIds } = req.body;
    if (!Array.isArray(companyIds)) {
      return res.status(400).json({ success: false, error: 'companyIds must be an array' });
    }
    const result = await companyController.reorderCompanies(companyIds);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get company statistics (protected - editor+)
router.get('/stats/all', authMiddleware, roleMiddleware(['editor']), async (req: Request, res: Response) => {
  try {
    const result = await companyController.getCompanyStats();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
