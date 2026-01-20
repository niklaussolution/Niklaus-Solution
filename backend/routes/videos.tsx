import express, { Router } from 'express';
import { 
  getAllVideos, 
  getVideoById, 
  createVideo, 
  updateVideo, 
  deleteVideo 
} from '../controllers/videoController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router: Router = express.Router();

router.get('/', getAllVideos);
router.get('/:id', getVideoById);
router.post('/', authMiddleware, roleMiddleware(['super_admin', 'editor']), createVideo);
router.put('/:id', authMiddleware, roleMiddleware(['super_admin', 'editor']), updateVideo);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin']), deleteVideo);

export default router;
