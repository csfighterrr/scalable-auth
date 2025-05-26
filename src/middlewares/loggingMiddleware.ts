import { Request, Response, NextFunction } from 'express';
import { info, error as logError } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent') || '',
  });

  const originalSend = res.send.bind(res);
  res.send = (body?: any): Response => {
    const duration = Date.now() - start;
    info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
    return originalSend(body);
  };

  next();
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  logError('Uncaught error', err);
  res.status(500).json({ error: 'Internal server error' });
};