// src/utils/asyncHandler.ts
// Wraps async route handlers to catch errors and pass to Express error middleware
// Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))

import { Request, Response, NextFunction } from 'express';

type AsyncFn = (req: any, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: AsyncFn) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
