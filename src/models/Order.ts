import mongoose, { Schema } from 'mongoose';
import { IOrder } from '../types';

const OrderItemSchema = new Schema(
  {
    product:  { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name:     { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price:    { type: Number, required: true, min: 0 },
    total:    { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, unique: true },
    items: { type: [OrderItemSchema], required: true, validate: { validator: (v: unknown[]) => v.length > 0, message: 'Order must have at least one item' } },
    subtotal:  { type: Number, required: true, min: 0 },
    tax:       { type: Number, default: 0, min: 0 },
    discount:  { type: Number, default: 0, min: 0 },
    total:     { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['cash', 'card', 'digital'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    status:        { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    cashier: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes:   { type: String, trim: true },
  },
  { timestamps: true, versionKey: false }
);

// Auto-generate order number
OrderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const pad = String(count + 1).padStart(6, '0');
    this.orderNumber = `ORD-${Date.now()}-${pad}`;
  }
  next();
});

OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ cashier: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.model<IOrder>('Order', OrderSchema);
