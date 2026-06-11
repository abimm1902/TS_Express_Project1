import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const getAllProducts: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getProductById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateStock: (req: AuthRequest, res: Response) => Promise<void>;
export declare const uploadProductsCSV: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCSVTemplate: (_req: AuthRequest, res: Response) => void;
//# sourceMappingURL=productController.d.ts.map