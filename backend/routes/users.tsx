import express, { Router } from 'express';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../controllers/userController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router: Router = express.Router();

router.get('/', authMiddleware, roleMiddleware(['super_admin', 'editor']), getAllUsers);
router.get('/:id', authMiddleware, roleMiddleware(['super_admin', 'editor']), getUserById);
router.post('/', authMiddleware, roleMiddleware(['super_admin', 'editor']), createUser);
router.put('/:id', authMiddleware, roleMiddleware(['super_admin', 'editor']), updateUser);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin']), deleteUser);

export default router;
