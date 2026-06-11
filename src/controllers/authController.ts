import { Request, Response } from 'express';
import User from '../models/User';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../config/jwt';
import { ROLE_PERMISSIONS, Role, AuthRequest } from '../types';

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409).json({ success: false, message: 'Email already registered' });
    return;
  }

  const assignedRole = (role as Role) || Role.CASHIER;
  const user = await User.create({
    name, email, password, role: assignedRole,
    permissions: ROLE_PERMISSIONS[assignedRole],
  });

  const payload = { userId: user._id.toString(), email: user.email, role: user.role, permissions: user.permissions };
  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user, accessToken, refreshToken },
  });
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, isActive: true }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const payload = { userId: user._id.toString(), email: user.email, role: user.role, permissions: user.permissions };
  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.json({
    success: true,
    message: 'Login successful',
    data: { user, accessToken, refreshToken },
  });
};

// ─── Refresh Token ────────────────────────────────────────────────────────────
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken: token } = req.body;
  if (!token) {
    res.status(400).json({ success: false, message: 'Refresh token required' });
    return;
  }

  try {
    const decoded = verifyRefreshToken(token);
    const user    = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'User not found or inactive' });
      return;
    }

    const payload = { userId: user._id.toString(), email: user.email, role: user.role, permissions: user.permissions };
    res.json({
      success: true,
      message: 'Token refreshed',
      data: { accessToken: generateAccessToken(payload) },
    });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

// ─── Get Profile ──────────────────────────────────────────────────────────────
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user!.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, message: 'Profile fetched', data: { user } });
};
