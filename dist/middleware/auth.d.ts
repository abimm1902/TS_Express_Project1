import { Response, NextFunction } from 'express';
import { AuthRequest, Permission } from '../types';
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const authorize: (...permissions: Permission[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const authorizeRoles: (...roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map