"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI is not defined in environment variables');
    }
    try {
        const conn = await mongoose_1.default.connect(uri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log(`✅  MongoDB Atlas connected: ${conn.connection.host}`);
        mongoose_1.default.connection.on('error', (err) => {
            console.error('❌  MongoDB connection error:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.warn('⚠️   MongoDB disconnected. Reconnecting...');
        });
    }
    catch (error) {
        console.error('❌  MongoDB connection failed:', error);
        process.exit(1);
    }
};
exports.default = connectDB;
//# sourceMappingURL=database.js.map