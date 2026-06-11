import { Response } from 'express';
import path from 'path';
import { Worker } from 'worker_threads';
import Product from '../models/Product';
import { AuthRequest, CsvWorkerResult } from '../types';

// ─── Get All Products ─────────────────────────────────────────────────────────
export const getAllProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  const page      = Math.max(1, Number(req.query.page) || 1);
  const limit     = Math.min(100, Number(req.query.limit) || 10);
  const skip      = (page - 1) * limit;
  const search    = req.query.search as string;
  const category  = req.query.category as string;
  const lowStock  = req.query.lowStock === 'true';

  const filter: Record<string, unknown> = { isActive: true };
  if (search)   filter['$text'] = { $search: search };
  if (category) filter['category'] = category;
  if (lowStock) filter['$expr']  = { $lte: ['$stock', '$minStock'] };

  const [products, total] = await Promise.all([
    Product.find(filter).populate('category', 'name').populate('createdBy', 'name email')
      .skip(skip).limit(limit).sort({ createdAt: -1 }),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true, message: 'Products fetched', data: { products },
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
};

// ─── Get Product By ID ────────────────────────────────────────────────────────
export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name').populate('createdBy', 'name email');
  if (!product) { res.status(404).json({ success: false, message: 'Product not found' }); return; }
  res.json({ success: true, message: 'Product fetched', data: { product } });
};

// ─── Create Product ───────────────────────────────────────────────────────────
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const product = await Product.create({ ...req.body, createdBy: req.user!.userId });
  res.status(201).json({ success: true, message: 'Product created', data: { product } });
};

// ─── Update Product ───────────────────────────────────────────────────────────
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) { res.status(404).json({ success: false, message: 'Product not found' }); return; }
  res.json({ success: true, message: 'Product updated', data: { product } });
};

// ─── Delete Product ───────────────────────────────────────────────────────────
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) { res.status(404).json({ success: false, message: 'Product not found' }); return; }
  res.json({ success: true, message: 'Product deleted' });
};

// ─── Update Stock ─────────────────────────────────────────────────────────────
export const updateStock = async (req: AuthRequest, res: Response): Promise<void> => {
  const { quantity, operation } = req.body; // operation: 'add' | 'subtract' | 'set'
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404).json({ success: false, message: 'Product not found' }); return; }

  if (operation === 'set')      product.stock  = quantity;
  else if (operation === 'add') product.stock += quantity;
  else if (operation === 'subtract') {
    if (product.stock < quantity) {
      res.status(400).json({ success: false, message: 'Insufficient stock' }); return;
    }
    product.stock -= quantity;
  }

  await product.save();
  res.json({ success: true, message: 'Stock updated', data: { product } });
};

// ─── CSV Upload via Worker Thread ─────────────────────────────────────────────
export const uploadProductsCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No CSV file uploaded' });
    return;
  }

  const filePath = path.resolve(req.file.path);
  const mongoUri = process.env.MONGODB_URI!;

  // Determine worker script path (ts-node or compiled)
  const isTs  = __filename.endsWith('.ts');
  const workerFile = isTs
    ? path.resolve(__dirname, '../workers/csvWorker.ts')
    : path.resolve(__dirname, '../workers/csvWorker.js');

  const workerOptions = isTs
    ? { workerData: { filePath, mongoUri }, execArgv: ['--require', 'ts-node/register'] }
    : { workerData: { filePath, mongoUri } };

  // Respond immediately — processing is async in worker
  res.status(202).json({
    success: true,
    message: 'CSV upload started. Processing in background.',
    data: { fileName: req.file.originalname },
  });

  // Spawn the worker
  const worker = new Worker(workerFile, workerOptions);

  worker.on('message', (result: CsvWorkerResult) => {
    console.log('📦  CSV Worker completed:', result);
  });

  worker.on('error', (err) => {
    console.error('❌  CSV Worker error:', err);
  });

  worker.on('exit', (code) => {
    if (code !== 0) console.error(`❌  CSV Worker exited with code ${code}`);
  });
};

// ─── CSV Template Download ────────────────────────────────────────────────────
export const getCSVTemplate = (_req: AuthRequest, res: Response): void => {
  const headers = 'name,sku,barcode,description,price,costPrice,stock,minStock,categoryId,createdBy\n';
  const example = 'Sample Product,SKU-001,1234567890,A sample product,99.99,60.00,100,10,<categoryObjectId>,<userObjectId>\n';
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="products_template.csv"');
  res.send(headers + example);
};
