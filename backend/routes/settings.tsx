import express, { Router } from 'express';
import { 
  getSettings, 
  updateSettings, 
  getSettingByKey 
} from '../controllers/settingsController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router: Router = express.Router();

router.get('/', getSettings);
router.get('/:key', getSettingByKey);
router.put('/', authMiddleware, roleMiddleware(['super_admin']), updateSettings);

export default router;
