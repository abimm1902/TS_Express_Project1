import { Request } from 'express';
import { Document, Types } from 'mongoose';
export declare enum Role {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    MANAGER = "manager",
    CASHIER = "cashier"
}
export declare enum Permission {
    CREATE_USER = "create_user",
    READ_USER = "read_user",
    UPDATE_USER = "update_user",
    DELETE_USER = "delete_user",
    CREATE_PRODUCT = "create_product",
    READ_PRODUCT = "read_product",
    UPDATE_PRODUCT = "update_product",
    DELETE_PRODUCT = "delete_product",
    CREATE_ORDER = "create_order",
    READ_ORDER = "read_order",
    UPDATE_ORDER = "update_order",
    DELETE_ORDER = "delete_order",
    CREATE_CATEGORY = "create_category",
    READ_CATEGORY = "read_category",
    UPDATE_CATEGORY = "update_category",
    DELETE_CATEGORY = "delete_category",
    VIEW_REPORTS = "view_reports",
    UPLOAD_CSV = "upload_csv"
}
export declare const ROLE_PERMISSIONS: Record<Role, Permission[]>;
export interface JwtPayload {
    userId: string;
    email: string;
    role: Role;
    permissions: Permission[];
}
export interface AuthRequest extends Request {
    user?: JwtPayload;
}
export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    role: Role;
    permissions: Permission[];
    isActive: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
}
export interface ICategory extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string;
    isActive: boolean;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface IProduct extends Document {
    _id: Types.ObjectId;
    name: string;
    sku: string;
    barcode?: string;
    description?: string;
    price: number;
    costPrice: number;
    stock: number;
    minStock: number;
    category: Types.ObjectId;
    isActive: boolean;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface IOrderItem {
    product: Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    total: number;
}
export interface IOrder extends Document {
    _id: Types.ObjectId;
    orderNumber: string;
    items: IOrderItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paymentMethod: 'cash' | 'card' | 'digital';
    paymentStatus: 'pending' | 'paid' | 'refunded';
    status: 'pending' | 'completed' | 'cancelled';
    cashier: Types.ObjectId;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    errors?: string[];
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
    };
}
export interface CsvWorkerInput {
    filePath: string;
    mongoUri: string;
}
export interface CsvWorkerResult {
    success: boolean;
    processed: number;
    failed: number;
    errors: string[];
}
//# sourceMappingURL=index.d.ts.map