import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const getAllUsers: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUserById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createUser: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateUser: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteUser: (req: AuthRequest, res: Response) => Promise<void>;
export declare const changePassword: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=userController.d.ts.map