"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
const generateAccessToken = (payload) => jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => jsonwebtoken_1.default.verify(token, JWT_SECRET);
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
exports.verifyRefreshToken = verifyRefreshToken;
//# sourceMappingURL=jwt.js.map