"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const types_1 = require("../types");
const getAllUsers = async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const role = req.query.role;
    const filter = {};
    if (search)
        filter['$or'] = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role)
        filter['role'] = role;
    const [users, total] = await Promise.all([
        User_1.default.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
        User_1.default.countDocuments(filter),
    ]);
    res.json({
        success: true,
        message: 'Users fetched',
        data: { users },
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    const user = await User_1.default.findById(req.params.id);
    if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    res.json({ success: true, message: 'User fetched', data: { user } });
};
exports.getUserById = getUserById;
const createUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    const exists = await User_1.default.findOne({ email });
    if (exists) {
        res.status(409).json({ success: false, message: 'Email already in use' });
        return;
    }
    const assignedRole = role || types_1.Role.CASHIER;
    const user = await User_1.default.create({
        name, email, password, role: assignedRole,
        permissions: types_1.ROLE_PERMISSIONS[assignedRole],
    });
    res.status(201).json({ success: true, message: 'User created', data: { user } });
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    const { name, email, role, isActive, permissions } = req.body;
    const user = await User_1.default.findById(req.params.id);
    if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    if (name)
        user.name = name;
    if (email)
        user.email = email;
    if (isActive !== undefined)
        user.isActive = isActive;
    if (role) {
        user.role = role;
        user.permissions = types_1.ROLE_PERMISSIONS[role];
    }
    if (permissions)
        user.permissions = permissions;
    await user.save();
    res.json({ success: true, message: 'User updated', data: { user } });
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    const user = await User_1.default.findById(req.params.id);
    if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    user.isActive = false;
    await user.save();
    res.json({ success: true, message: 'User deactivated successfully' });
};
exports.deleteUser = deleteUser;
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User_1.default.findById(req.user.userId).select('+password');
    if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    const valid = await user.comparePassword(currentPassword);
    if (!valid) {
        res.status(400).json({ success: false, message: 'Current password is incorrect' });
        return;
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
};
exports.changePassword = changePassword;
//# sourceMappingURL=userController.js.map