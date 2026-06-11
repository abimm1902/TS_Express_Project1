/**
 * Worker Thread: CSV Product Import
 * Reads a CSV file, validates each row, and bulk-upserts into MongoDB.
 * Runs in an isolated thread — does not block the main event loop.
 */

import { workerData, parentPort } from 'worker_threads';
import fs from 'fs';
import readline from 'readline';
import mongoose from 'mongoose';
import { CsvWorkerInput, CsvWorkerResult } from '../types';

interface ProductRow {
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  categoryId: string;
  createdBy: string;
}

const { filePath, mongoUri } = workerData as CsvWorkerInput;

const parseRow = (headers: string[], values: string[]): ProductRow | null => {
  const obj: Record<string, string> = {};
  headers.forEach((h, i) => { obj[h.trim().toLowerCase()] = (values[i] || '').trim(); });

  // Validate required fields
  if (!obj['name'] || !obj['sku'] || !obj['price'] || !obj['costprice'] || !obj['categoryid'] || !obj['createdby']) {
    return null;
  }

  return {
    name:        obj['name'],
    sku:         obj['sku'].toUpperCase(),
    barcode:     obj['barcode']      || undefined,
    description: obj['description']  || undefined,
    price:       parseFloat(obj['price']),
    costPrice:   parseFloat(obj['costprice']),
    stock:       parseInt(obj['stock'] || '0', 10),
    minStock:    parseInt(obj['minstock'] || '5', 10),
    categoryId:  obj['categoryid'],
    createdBy:   obj['createdby'],
  };
};

const run = async (): Promise<void> => {
  const result: CsvWorkerResult = { success: false, processed: 0, failed: 0, errors: [] };

  try {
    // Connect to MongoDB in this worker thread
    await mongoose.connect(mongoUri);

    const Product = mongoose.model('Product', new mongoose.Schema({
      name:        { type: String, required: true },
      sku:         { type: String, required: true, unique: true, uppercase: true },
      barcode:     String,
      description: String,
      price:       { type: Number, required: true },
      costPrice:   { type: Number, required: true },
      stock:       { type: Number, default: 0 },
      minStock:    { type: Number, default: 5 },
      category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
      isActive:    { type: Boolean, default: true },
      createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    }, { timestamps: true }));

    const fileStream = fs.createReadStream(filePath);
    const rl         = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const lines: string[] = [];
    for await (const line of rl) {
      if (line.trim()) lines.push(line);
    }

    if (lines.length < 2) {
      result.errors.push('CSV file is empty or has no data rows');
      parentPort?.postMessage(result);
      return;
    }

    const headers = lines[0].split(',');
    const BATCH   = 50;

    for (let i = 1; i < lines.length; i += BATCH) {
      const batch = lines.slice(i, i + BATCH);
      const ops = batch.map((line, idx) => {
        const row = parseRow(headers, line.split(','));
        if (!row) {
          result.failed++;
          result.errors.push(`Row ${i + idx + 1}: Missing required fields`);
          return null;
        }

        // Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(row.categoryId) ||
            !mongoose.Types.ObjectId.isValid(row.createdBy)) {
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
                name:        row.name,
                barcode:     row.barcode,
                description: row.description,
                price:       row.price,
                costPrice:   row.costPrice,
                stock:       row.stock,
                minStock:    row.minStock,
                category:    new mongoose.Types.ObjectId(row.categoryId),
                createdBy:   new mongoose.Types.ObjectId(row.createdBy),
              },
            },
            upsert: true,
          },
        };
      }).filter(Boolean);

      if (ops.length > 0) {
        try {
          const bulkRes = await Product.bulkWrite(ops as mongoose.AnyBulkWriteOperation[]);
          result.processed += bulkRes.upsertedCount + bulkRes.modifiedCount;
        } catch (bErr) {
          result.failed += ops.length;
          result.errors.push(`Batch ${Math.ceil(i / BATCH)}: ${(bErr as Error).message}`);
        }
      }
    }

    // Clean up temp file
    fs.unlink(filePath, () => {});
    await mongoose.disconnect();

    result.success = true;
    parentPort?.postMessage(result);

  } catch (err) {
    result.errors.push((err as Error).message);
    parentPort?.postMessage(result);
    process.exit(1);
  }
};

run();
