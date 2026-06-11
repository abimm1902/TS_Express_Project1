"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const upload_1 = require("../middleware/upload");
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const productRules = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Product name required'),
    (0, express_validator_1.body)('sku').trim().notEmpty().withMessage('SKU required'),
    (0, express_validator_1.body)('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    (0, express_validator_1.body)('costPrice').isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
    (0, express_validator_1.body)('category').isMongoId().withMessage('Valid category ID required'),
];
router.get('/', (0, auth_1.authorize)(types_1.Permission.READ_PRODUCT), productController_1.getAllProducts);
router.get('/csv-template', (0, auth_1.authorize)(types_1.Permission.UPLOAD_CSV), productController_1.getCSVTemplate);
router.get('/:id', (0, auth_1.authorize)(types_1.Permission.READ_PRODUCT), productController_1.getProductById);
router.post('/', (0, auth_1.authorize)(types_1.Permission.CREATE_PRODUCT), (0, validate_1.validate)(productRules), productController_1.createProduct);
router.put('/:id', (0, auth_1.authorize)(types_1.Permission.UPDATE_PRODUCT), productController_1.updateProduct);
router.delete('/:id', (0, auth_1.authorize)(types_1.Permission.DELETE_PRODUCT), productController_1.deleteProduct);
router.patch('/:id/stock', (0, auth_1.authorize)(types_1.Permission.UPDATE_PRODUCT), [
    (0, express_validator_1.body)('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    (0, express_validator_1.body)('operation').isIn(['add', 'subtract', 'set']).withMessage('Operation must be add|subtract|set'),
], productController_1.updateStock);
router.post('/upload-csv', (0, auth_1.authorize)(types_1.Permission.UPLOAD_CSV), (req, res, next) => {
    (0, upload_1.uploadCSV)(req, res, (err) => {
        if (err) {
            res.status(400).json({ success: false, message: err.message });
            return;
        }
        next();
    });
}, productController_1.uploadProductsCSV);
exports.default = router;
//# sourceMappingURL=productRoutes.js.map