"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.refreshToken = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../config/jwt");
const types_1 = require("../types");
const register = async (req, res) => {
    const { name, email, password, role } = req.body;
    const exists = await User_1.default.findOne({ email });
    if (exists) {
        res.status(409).json({ success: false, message: 'Email already registered' });
        return;
    }
    const assignedRole = role || types_1.Role.CASHIER;
    const user = await User_1.default.create({
        name, email, password, role: assignedRole,
        permissions: types_1.ROLE_PERMISSIONS[assignedRole],
    });
    const payload = { userId: user._id.toString(), email: user.email, role: user.role, permissions: user.permissions };
    const accessToken = (0, jwt_1.generateAccessToken)(payload);
    const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user, accessToken, refreshToken },
    });
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User_1.default.findOne({ email, isActive: true }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
        return;
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    const payload = { userId: user._id.toString(), email: user.email, role: user.role, permissions: user.permissions };
    const accessToken = (0, jwt_1.generateAccessToken)(payload);
    const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
    res.json({
        success: true,
        message: 'Login successful',
        data: { user, accessToken, refreshToken },
    });
};
exports.login = login;
const refreshToken = async (req, res) => {
    const { refreshToken: token } = req.body;
    if (!token) {
        res.status(400).json({ success: false, message: 'Refresh token required' });
        return;
    }
    try {
        const decoded = (0, jwt_1.verifyRefreshToken)(token);
        const user = await User_1.default.findById(decoded.userId);
        if (!user || !user.isActive) {
            res.status(401).json({ success: false, message: 'User not found or inactive' });
            return;
        }
        const payload = { userId: user._id.toString(), email: user.email, role: user.role, permissions: user.permissions };
        res.json({
            success: true,
            message: 'Token refreshed',
            data: { accessToken: (0, jwt_1.generateAccessToken)(payload) },
        });
    }
    catch {
        res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
};
exports.refreshToken = refreshToken;
const getProfile = async (req, res) => {
    const user = await User_1.default.findById(req.user.userId);
    if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    res.json({ success: true, message: 'Profile fetched', data: { user } });
};
exports.getProfile = getProfile;
//# sourceMappingURL=authController.js.map