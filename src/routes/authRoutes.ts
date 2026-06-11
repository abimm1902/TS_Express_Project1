import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refreshToken, getProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { Role } from '../types';

const router = Router();

const registerRules = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(Object.values(Role)).withMessage('Invalid role'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

// POST /api/auth/register
router.post('/register', validate(registerRules), register);

// POST /api/auth/login
router.post('/login', validate(loginRules), login);

// POST /api/auth/refresh
router.post('/refresh', refreshToken);

// GET /api/auth/profile  (protected)
router.get('/profile', authenticate, getProfile);

export default router;
