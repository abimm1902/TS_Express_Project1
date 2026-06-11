import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const getAllCategories: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCategoryById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createCategory: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateCategory: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteCategory: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=categoryController.d.ts.map