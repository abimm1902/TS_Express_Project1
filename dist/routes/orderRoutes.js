"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const orderRules = [
    (0, express_validator_1.body)('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
    (0, express_validator_1.body)('items.*.productId').isMongoId().withMessage('Valid product ID required'),
    (0, express_validator_1.body)('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    (0, express_validator_1.body)('paymentMethod').isIn(['cash', 'card', 'digital']).withMessage('Invalid payment method'),
];
router.get('/', (0, auth_1.authorize)(types_1.Permission.READ_ORDER), orderController_1.getAllOrders);
router.get('/summary', (0, auth_1.authorize)(types_1.Permission.VIEW_REPORTS), orderController_1.getSalesSummary);
router.get('/:id', (0, auth_1.authorize)(types_1.Permission.READ_ORDER), orderController_1.getOrderById);
router.post('/', (0, auth_1.authorize)(types_1.Permission.CREATE_ORDER), (0, validate_1.validate)(orderRules), orderController_1.createOrder);
router.patch('/:id/status', (0, auth_1.authorize)(types_1.Permission.UPDATE_ORDER), orderController_1.updateOrderStatus);
router.patch('/:id/cancel', (0, auth_1.authorize)(types_1.Permission.UPDATE_ORDER), orderController_1.cancelOrder);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map