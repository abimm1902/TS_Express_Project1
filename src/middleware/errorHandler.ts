import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';
  let errors: string[] = [];

  // Mongoose Validation Error
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message    = 'Validation Error';
    errors     = Object.values(err.errors).map((e) => e.message);
  }

  // Mongoose Duplicate Key
  if ((err as NodeJS.ErrnoException).code === '11000' || (err as NodeJS.ErrnoException & { code?: number }).code === 11000) {
    statusCode = 409;
    const mongoErr = err as unknown as { keyValue?: Record<string, unknown> };
    const keyVal = mongoErr.keyValue;
    const field  = keyVal ? Object.keys(keyVal)[0] : 'field';
    message      = `Duplicate value for '${field}'`;
  }

  // Mongoose Cast Error
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message    = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message    = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message    = 'Token expired';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: 'Route not found' });
};
