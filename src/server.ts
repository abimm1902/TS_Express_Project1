import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import connectDB from './config/database';

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`\n🚀  POS API Server running on port ${PORT}`);
    console.log(`📡  Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗  Health check: http://localhost:${PORT}/health\n`);
  });

  // ─── Graceful Shutdown ────────────────────────────────────────────────────
  const shutdown = (signal: string) => {
    console.log(`\n⚠️   Received ${signal}. Gracefully shutting down...`);
    server.close(() => {
      console.log('✅  HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('uncaughtException',  (err) => { console.error('Uncaught Exception:', err); process.exit(1); });
  process.on('unhandledRejection', (err) => { console.error('Unhandled Rejection:', err); process.exit(1); });
};

startServer();
