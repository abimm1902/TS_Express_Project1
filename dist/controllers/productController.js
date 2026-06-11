"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCSVTemplate = exports.uploadProductsCSV = exports.updateStock = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const path_1 = __importDefault(require("path"));
const worker_threads_1 = require("worker_threads");
const Product_1 = __importDefault(require("../models/Product"));
const getAllProducts = async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const category = req.query.category;
    const lowStock = req.query.lowStock === 'true';
    const filter = { isActive: true };
    if (search)
        filter['$text'] = { $search: search };
    if (category)
        filter['category'] = category;
    if (lowStock)
        filter['$expr'] = { $lte: ['$stock', '$minStock'] };
    const [products, total] = await Promise.all([
        Product_1.default.find(filter).populate('category', 'name').populate('createdBy', 'name email')
            .skip(skip).limit(limit).sort({ createdAt: -1 }),
        Product_1.default.countDocuments(filter),
    ]);
    res.json({
        success: true, message: 'Products fetched', data: { products },
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res) => {
    const product = await Product_1.default.findById(req.params.id)
        .populate('category', 'name').populate('createdBy', 'name email');
    if (!product) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
    }
    res.json({ success: true, message: 'Product fetched', data: { product } });
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    const product = await Product_1.default.create({ ...req.body, createdBy: req.user.userId });
    res.status(201).json({ success: true, message: 'Product created', data: { product } });
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    const product = await Product_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
    }
    res.json({ success: true, message: 'Product updated', data: { product } });
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    const product = await Product_1.default.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
    }
    res.json({ success: true, message: 'Product deleted' });
};
exports.deleteProduct = deleteProduct;
const updateStock = async (req, res) => {
    const { quantity, operation } = req.body;
    const product = await Product_1.default.findById(req.params.id);
    if (!product) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
    }
    if (operation === 'set')
        product.stock = quantity;
    else if (operation === 'add')
        product.stock += quantity;
    else if (operation === 'subtract') {
        if (product.stock < quantity) {
            res.status(400).json({ success: false, message: 'Insufficient stock' });
            return;
        }
        product.stock -= quantity;
    }
    await product.save();
    res.json({ success: true, message: 'Stock updated', data: { product } });
};
exports.updateStock = updateStock;
const uploadProductsCSV = async (req, res) => {
    if (!req.file) {
        res.status(400).json({ success: false, message: 'No CSV file uploaded' });
        return;
    }
    const filePath = path_1.default.resolve(req.file.path);
    const mongoUri = process.env.MONGODB_URI;
    const isTs = __filename.endsWith('.ts');
    const workerFile = isTs
        ? path_1.default.resolve(__dirname, '../workers/csvWorker.ts')
        : path_1.default.resolve(__dirname, '../workers/csvWorker.js');
    const workerOptions = isTs
        ? { workerData: { filePath, mongoUri }, execArgv: ['--require', 'ts-node/register'] }
        : { workerData: { filePath, mongoUri } };
    res.status(202).json({
        success: true,
        message: 'CSV upload started. Processing in background.',
        data: { fileName: req.file.originalname },
    });
    const worker = new worker_threads_1.Worker(workerFile, workerOptions);
    worker.on('message', (result) => {
        console.log('📦  CSV Worker completed:', result);
    });
    worker.on('error', (err) => {
        console.error('❌  CSV Worker error:', err);
    });
    worker.on('exit', (code) => {
        if (code !== 0)
            console.error(`❌  CSV Worker exited with code ${code}`);
    });
};
exports.uploadProductsCSV = uploadProductsCSV;
const getCSVTemplate = (_req, res) => {
    const headers = 'name,sku,barcode,description,price,costPrice,stock,minStock,categoryId,createdBy\n';
    const example = 'Sample Product,SKU-001,1234567890,A sample product,99.99,60.00,100,10,<categoryObjectId>,<userObjectId>\n';
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="products_template.csv"');
    res.send(headers + example);
};
exports.getCSVTemplate = getCSVTemplate;
//# sourceMappingURL=productController.js.map