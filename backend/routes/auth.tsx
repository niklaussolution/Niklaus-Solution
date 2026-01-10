import express, { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getAdmins, updateAdmin, deleteAdmin } from '../controllers/authController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router: Router = express.Router();

router.post('/register', [
  body('username').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
], register);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], login);

router.get('/admins', authMiddleware, roleMiddleware(['super_admin']), getAdmins);
router.put('/admins/:id', authMiddleware, roleMiddleware(['super_admin']), updateAdmin);
router.delete('/admins/:id', authMiddleware, roleMiddleware(['super_admin']), deleteAdmin);

export default router;
