import express, { Router } from 'express';
import { 
  getAllContent, 
  getContentById, 
  createContent, 
  updateContent, 
  deleteContent 
} from '../controllers/contentController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router: Router = express.Router();

router.get('/', getAllContent);
router.get('/:id', getContentById);
router.post('/', authMiddleware, roleMiddleware(['super_admin', 'editor']), createContent);
router.put('/:id', authMiddleware, roleMiddleware(['super_admin', 'editor']), updateContent);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin']), deleteContent);

export default router;
