import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllUsers, getUserById, createUser, updateUser, deleteUser, changePassword,
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { Permission, Role } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

const createRules = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
  body('role').optional().isIn(Object.values(Role)).withMessage('Invalid role'),
];

const updateRules = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(Object.values(Role)).withMessage('Invalid role'),
  body('isActive').optional().isBoolean(),
];

// GET /api/users
router.get('/', authorize(Permission.READ_USER), getAllUsers);

// GET /api/users/:id
router.get('/:id', authorize(Permission.READ_USER), getUserById);

// POST /api/users
router.post('/', authorize(Permission.CREATE_USER), validate(createRules), createUser);

// PUT /api/users/:id
router.put('/:id', authorize(Permission.UPDATE_USER), validate(updateRules), updateUser);

// DELETE /api/users/:id
router.delete('/:id', authorize(Permission.DELETE_USER), deleteUser);

// PATCH /api/users/change-password
router.patch('/change-password', [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
], changePassword);

export default router;
