import mongoose, { Schema } from 'mongoose';
import { IProduct } from '../types';

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Name must not exceed 200 characters'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    barcode: { type: String, trim: true },
    description: { type: String, trim: true, maxlength: [1000, 'Description too long'] },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: [0, 'Cost price cannot be negative'],
    },
    stock: { type: Number, default: 0, min: [0, 'Stock cannot be negative'] },
    minStock: { type: Number, default: 5, min: [0, 'Min stock cannot be negative'] },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, versionKey: false }
);

ProductSchema.index({ sku: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);
