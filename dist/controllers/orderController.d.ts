import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const createOrder: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllOrders: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getOrderById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateOrderStatus: (req: AuthRequest, res: Response) => Promise<void>;
export declare const cancelOrder: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getSalesSummary: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=orderController.d.ts.map