"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const errorHandler = (err, _req, res, _next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = [];
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        statusCode = 400;
        message = 'Validation Error';
        errors = Object.values(err.errors).map((e) => e.message);
    }
    if (err.code === '11000' || err.code === 11000) {
        statusCode = 409;
        const mongoErr = err;
        const keyVal = mongoErr.keyValue;
        const field = keyVal ? Object.keys(keyVal)[0] : 'field';
        message = `Duplicate value for '${field}'`;
    }
    if (err instanceof mongoose_1.default.Error.CastError) {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(errors.length > 0 && { errors }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
const notFound = (_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
};
exports.notFound = notFound;
//# sourceMappingURL=errorHandler.js.map