"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const fs_1 = __importDefault(require("fs"));
const readline_1 = __importDefault(require("readline"));
const mongoose_1 = __importDefault(require("mongoose"));
const { filePath, mongoUri } = worker_threads_1.workerData;
const parseRow = (headers, values) => {
    const obj = {};
    headers.forEach((h, i) => { obj[h.trim().toLowerCase()] = (values[i] || '').trim(); });
    if (!obj['name'] || !obj['sku'] || !obj['price'] || !obj['costprice'] || !obj['categoryid'] || !obj['createdby']) {
        return null;
    }
    return {
        name: obj['name'],
        sku: obj['sku'].toUpperCase(),
        barcode: obj['barcode'] || undefined,
        description: obj['description'] || undefined,
        price: parseFloat(obj['price']),
        costPrice: parseFloat(obj['costprice']),
        stock: parseInt(obj['stock'] || '0', 10),
        minStock: parseInt(obj['minstock'] || '5', 10),
        categoryId: obj['categoryid'],
        createdBy: obj['createdby'],
    };
};
const run = async () => {
    const result = { success: false, processed: 0, failed: 0, errors: [] };
    try {
        await mongoose_1.default.connect(mongoUri);
        const Product = mongoose_1.default.model('Product', new mongoose_1.default.Schema({
            name: { type: String, required: true },
            sku: { type: String, required: true, unique: true, uppercase: true },
            barcode: String,
            description: String,
            price: { type: Number, required: true },
            costPrice: { type: Number, required: true },
            stock: { type: Number, default: 0 },
            minStock: { type: Number, default: 5 },
            category: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Category', required: true },
            isActive: { type: Boolean, default: true },
            createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
        }, { timestamps: true }));
        const fileStream = fs_1.default.createReadStream(filePath);
        const rl = readline_1.default.createInterface({ input: fileStream, crlfDelay: Infinity });
        const lines = [];
        for await (const line of rl) {
            if (line.trim())
                lines.push(line);
        }
        if (lines.length < 2) {
            result.errors.push('CSV file is empty or has no data rows');
            worker_threads_1.parentPort?.postMessage(result);
            return;
        }
        const headers = lines[0].split(',');
        const BATCH = 50;
        for (let i = 1; i < lines.length; i += BATCH) {
            const batch = lines.slice(i, i + BATCH);
            const ops = batch.map((line, idx) => {
                const row = parseRow(headers, line.split(','));
                if (!row) {
                    result.failed++;
                    result.errors.push(`Row ${i + idx + 1}: Missing required fields`);
                    return null;
                }
                if (!mongoose_1.default.Types.ObjectId.isValid(row.categoryId) ||
                    !mongoose_1.default.Types.ObjectId.isValid(row.createdBy)) {
                    result.failed++;
                    result.errors.push(`Row ${i + idx + 1}: Invalid categoryId or createdBy ObjectId`);
                    return null;
                }
                if (isNaN(row.price) || isNaN(row.costPrice)) {
                    result.failed++;
                    result.errors.push(`Row ${i + idx + 1}: price/costPrice must be numbers`);
                    return null;
                }
                return {
                    updateOne: {
                        filter: { sku: row.sku },
                        update: {
                            $set: {
                                name: row.name,
                                barcode: row.barcode,
                                description: row.description,
                                price: row.price,
                                costPrice: row.costPrice,
                                stock: row.stock,
                                minStock: row.minStock,
                                category: new mongoose_1.default.Types.ObjectId(row.categoryId),
                                createdBy: new mongoose_1.default.Types.ObjectId(row.createdBy),
                            },
                        },
                        upsert: true,
                    },
                };
            }).filter(Boolean);
            if (ops.length > 0) {
                try {
                    const bulkRes = await Product.bulkWrite(ops);
                    result.processed += bulkRes.upsertedCount + bulkRes.modifiedCount;
                }
                catch (bErr) {
                    result.failed += ops.length;
                    result.errors.push(`Batch ${Math.ceil(i / BATCH)}: ${bErr.message}`);
                }
            }
        }
        fs_1.default.unlink(filePath, () => { });
        await mongoose_1.default.disconnect();
        result.success = true;
        worker_threads_1.parentPort?.postMessage(result);
    }
    catch (err) {
        result.errors.push(err.message);
        worker_threads_1.parentPort?.postMessage(result);
        process.exit(1);
    }
};
run();
//# sourceMappingURL=csvWorker.js.map