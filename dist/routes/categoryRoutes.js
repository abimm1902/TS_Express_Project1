"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const categoryController_1 = require("../controllers/categoryController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const categoryRules = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Category name required'),
    (0, express_validator_1.body)('description').optional().trim(),
];
router.get('/', (0, auth_1.authorize)(types_1.Permission.READ_CATEGORY), categoryController_1.getAllCategories);
router.get('/:id', (0, auth_1.authorize)(types_1.Permission.READ_CATEGORY), categoryController_1.getCategoryById);
router.post('/', (0, auth_1.authorize)(types_1.Permission.CREATE_CATEGORY), (0, validate_1.validate)(categoryRules), categoryController_1.createCategory);
router.put('/:id', (0, auth_1.authorize)(types_1.Permission.UPDATE_CATEGORY), categoryController_1.updateCategory);
router.delete('/:id', (0, auth_1.authorize)(types_1.Permission.DELETE_CATEGORY), categoryController_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=categoryRoutes.js.map