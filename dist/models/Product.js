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
const ProductSchema = new mongoose_1.Schema({
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
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category', required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true, versionKey: false });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ name: 'text', description: 'text' });
exports.default = mongoose_1.default.model('Product', ProductSchema);
//# sourceMappingURL=Product.js.map