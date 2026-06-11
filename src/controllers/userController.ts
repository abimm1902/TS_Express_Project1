import { Response } from 'express';
import User from '../models/User';
import { AuthRequest, ROLE_PERMISSIONS, Role, Permission } from '../types';

// ─── Get All Users ────────────────────────────────────────────────────────────
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const page  = Math.max(1, Number(req.query.page)  || 1);
  const limit = Math.min(100, Number(req.query.limit) || 10);
  const skip  = (page - 1) * limit;
  const search = req.query.search as string;
  const role   = req.query.role   as string;

  const filter: Record<string, unknown> = {};
  if (search) filter['$or'] = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  if (role)   filter['role'] = role;

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    message: 'Users fetched',
    data: { users },
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
};

// ─── Get User By ID ───────────────────────────────────────────────────────────
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
  res.json({ success: true, message: 'User fetched', data: { user } });
};

// ─── Create User ──────────────────────────────────────────────────────────────
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) { res.status(409).json({ success: false, message: 'Email already in use' }); return; }

  const assignedRole = (role as Role) || Role.CASHIER;
  const user = await User.create({
    name, email, password, role: assignedRole,
    permissions: ROLE_PERMISSIONS[assignedRole],
  });

  res.status(201).json({ success: true, message: 'User created', data: { user } });
};

// ─── Update User ──────────────────────────────────────────────────────────────
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, role, isActive, permissions } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

  if (name)     user.name     = name;
  if (email)    user.email    = email;
  if (isActive  !== undefined) user.isActive = isActive;
  if (role) {
    user.role        = role as Role;
    user.permissions = ROLE_PERMISSIONS[role as Role] as Permission[];
  }
  if (permissions) user.permissions = permissions;

  await user.save();
  res.json({ success: true, message: 'User updated', data: { user } });
};

// ─── Delete User ──────────────────────────────────────────────────────────────
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

  // Soft delete
  user.isActive = false;
  await user.save();

  res.json({ success: true, message: 'User deactivated successfully' });
};

// ─── Change Password ──────────────────────────────────────────────────────────
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user!.userId).select('+password');
  if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

  const valid = await user.comparePassword(currentPassword);
  if (!valid) { res.status(400).json({ success: false, message: 'Current password is incorrect' }); return; }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
};
