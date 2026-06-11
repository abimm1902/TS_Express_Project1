"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
const PORT = Number(process.env.PORT) || 5000;
const startServer = async () => {
    await (0, database_1.default)();
    const server = app_1.default.listen(PORT, () => {
        console.log(`\n🚀  POS API Server running on port ${PORT}`);
        console.log(`📡  Environment : ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗  Health check: http://localhost:${PORT}/health\n`);
    });
    const shutdown = (signal) => {
        console.log(`\n⚠️   Received ${signal}. Gracefully shutting down...`);
        server.close(() => {
            console.log('✅  HTTP server closed.');
            process.exit(0);
        });
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('uncaughtException', (err) => { console.error('Uncaught Exception:', err); process.exit(1); });
    process.on('unhandledRejection', (err) => { console.error('Unhandled Rejection:', err); process.exit(1); });
};
startServer();
//# sourceMappingURL=server.js.map