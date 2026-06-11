"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const types_1 = require("../types");
const router = (0, express_1.Router)();
const registerRules = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    (0, express_validator_1.body)('role').optional().isIn(Object.values(types_1.Role)).withMessage('Invalid role'),
];
const loginRules = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password required'),
];
router.post('/register', (0, validate_1.validate)(registerRules), authController_1.register);
router.post('/login', (0, validate_1.validate)(loginRules), authController_1.login);
router.post('/refresh', authController_1.refreshToken);
router.get('/profile', auth_1.authenticate, authController_1.getProfile);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map