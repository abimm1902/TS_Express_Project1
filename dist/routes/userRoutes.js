"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const createRules = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name required'),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
    (0, express_validator_1.body)('role').optional().isIn(Object.values(types_1.Role)).withMessage('Invalid role'),
];
const updateRules = [
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 2, max: 100 }),
    (0, express_validator_1.body)('email').optional().isEmail().normalizeEmail(),
    (0, express_validator_1.body)('role').optional().isIn(Object.values(types_1.Role)).withMessage('Invalid role'),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
];
router.get('/', (0, auth_1.authorize)(types_1.Permission.READ_USER), userController_1.getAllUsers);
router.get('/:id', (0, auth_1.authorize)(types_1.Permission.READ_USER), userController_1.getUserById);
router.post('/', (0, auth_1.authorize)(types_1.Permission.CREATE_USER), (0, validate_1.validate)(createRules), userController_1.createUser);
router.put('/:id', (0, auth_1.authorize)(types_1.Permission.UPDATE_USER), (0, validate_1.validate)(updateRules), userController_1.updateUser);
router.delete('/:id', (0, auth_1.authorize)(types_1.Permission.DELETE_USER), userController_1.deleteUser);
router.patch('/change-password', [
    (0, express_validator_1.body)('currentPassword').notEmpty(),
    (0, express_validator_1.body)('newPassword').isLength({ min: 8 }),
], userController_1.changePassword);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map