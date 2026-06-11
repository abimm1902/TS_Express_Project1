import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import {
  getAllProducts, getProductById, createProduct, updateProduct,
  deleteProduct, updateStock, uploadProductsCSV, getCSVTemplate,
} from '../controllers/productController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { uploadCSV } from '../middleware/upload';
import { Permission } from '../types';

const router = Router();
router.use(authenticate);

const productRules = [
  body('name').trim().notEmpty().withMessage('Product name required'),
  body('sku').trim().notEmpty().withMessage('SKU required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('costPrice').isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('category').isMongoId().withMessage('Valid category ID required'),
];

// GET /api/products
router.get('/', authorize(Permission.READ_PRODUCT), getAllProducts);

// GET /api/products/csv-template
router.get('/csv-template', authorize(Permission.UPLOAD_CSV), getCSVTemplate);

// GET /api/products/:id
router.get('/:id', authorize(Permission.READ_PRODUCT), getProductById);

// POST /api/products
router.post('/', authorize(Permission.CREATE_PRODUCT), validate(productRules), createProduct);

// PUT /api/products/:id
router.put('/:id', authorize(Permission.UPDATE_PRODUCT), updateProduct);

// DELETE /api/products/:id
router.delete('/:id', authorize(Permission.DELETE_PRODUCT), deleteProduct);

// PATCH /api/products/:id/stock
router.patch('/:id/stock', authorize(Permission.UPDATE_PRODUCT), [
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('operation').isIn(['add', 'subtract', 'set']).withMessage('Operation must be add|subtract|set'),
], updateStock);

// POST /api/products/upload-csv
router.post(
  '/upload-csv',
  authorize(Permission.UPLOAD_CSV),
  (req: Request, res: Response, next: NextFunction) => {
    uploadCSV(req, res, (err) => {
      if (err) {
        res.status(400).json({ success: false, message: err.message });
        return;
      }
      next();
    });
  },
  uploadProductsCSV
);

export default router;
