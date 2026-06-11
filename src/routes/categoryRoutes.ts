import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory,
} from '../controllers/categoryController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { Permission } from '../types';

const router = Router();
router.use(authenticate);

const categoryRules = [
  body('name').trim().notEmpty().withMessage('Category name required'),
  body('description').optional().trim(),
];

router.get('/', authorize(Permission.READ_CATEGORY), getAllCategories);
router.get('/:id', authorize(Permission.READ_CATEGORY), getCategoryById);
router.post('/', authorize(Permission.CREATE_CATEGORY), validate(categoryRules), createCategory);
router.put('/:id', authorize(Permission.UPDATE_CATEGORY), updateCategory);
router.delete('/:id', authorize(Permission.DELETE_CATEGORY), deleteCategory);

export default router;
