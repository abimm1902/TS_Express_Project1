import { Response, NextFunction } from 'express';
import { AuthRequest, Permission } from '../types';
import { verifyAccessToken } from '../config/jwt';

// ─── Authenticate JWT ─────────────────────────────────────────────────────────
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Access token missing or malformed' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    const msg = error instanceof Error && error.name === 'TokenExpiredError'
      ? 'Access token expired'
      : 'Invalid access token';
    res.status(401).json({ success: false, message: msg });
  }
};

// ─── Authorize by Permission ──────────────────────────────────────────────────
export const authorize = (...permissions: Permission[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const hasAll = permissions.every((p) => req.user!.permissions.includes(p));
    if (!hasAll) {
      res.status(403).json({
        success: false,
        message: `Insufficient permissions. Required: ${permissions.join(', ')}`,
      });
      return;
    }
    next();
  };

// ─── Authorize by Role ────────────────────────────────────────────────────────
export const authorizeRoles = (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized for this action`,
      });
      return;
    }
    next();
  };
