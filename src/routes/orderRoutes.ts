import { Router } from 'express';
import { body } from 'express-validator';
import {
  createOrder, getAllOrders, getOrderById, updateOrderStatus, cancelOrder, getSalesSummary,
} from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { Permission } from '../types';

const router = Router();
router.use(authenticate);

const orderRules = [
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('items.*.productId').isMongoId().withMessage('Valid product ID required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('paymentMethod').isIn(['cash', 'card', 'digital']).withMessage('Invalid payment method'),
];

// GET  /api/orders
router.get('/', authorize(Permission.READ_ORDER), getAllOrders);

// GET  /api/orders/summary
router.get('/summary', authorize(Permission.VIEW_REPORTS), getSalesSummary);

// GET  /api/orders/:id
router.get('/:id', authorize(Permission.READ_ORDER), getOrderById);

// POST /api/orders
router.post('/', authorize(Permission.CREATE_ORDER), validate(orderRules), createOrder);

// PATCH /api/orders/:id/status
router.patch('/:id/status', authorize(Permission.UPDATE_ORDER), updateOrderStatus);

// PATCH /api/orders/:id/cancel
router.patch('/:id/cancel', authorize(Permission.UPDATE_ORDER), cancelOrder);

export default router;
