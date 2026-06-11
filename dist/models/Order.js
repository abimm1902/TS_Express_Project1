"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const OrderItemSchema = new mongoose_1.Schema({
    product: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
}, { _id: false });
const OrderSchema = new mongoose_1.Schema({
    orderNumber: { type: String, unique: true },
    items: { type: [OrderItemSchema], required: true, validate: { validator: (v) => v.length > 0, message: 'Order must have at least one item' } },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['cash', 'card', 'digital'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    cashier: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, trim: true },
}, { timestamps: true, versionKey: false });
OrderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const count = await mongoose_1.default.model('Order').countDocuments();
        const pad = String(count + 1).padStart(6, '0');
        this.orderNumber = `ORD-${Date.now()}-${pad}`;
    }
    next();
});
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ cashier: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
exports.default = mongoose_1.default.model('Order', OrderSchema);
//# sourceMappingURL=Order.js.map