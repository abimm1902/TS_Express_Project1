import mongoose, { Schema } from 'mongoose';
import { ICategory } from '../types';

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    description: { type: String, trim: true, maxlength: [500, 'Description too long'] },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, versionKey: false }
);

CategorySchema.index({ name: 1 });

export default mongoose.model<ICategory>('Category', CategorySchema);


