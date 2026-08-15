// server/src/middleware/rateLimiter.ts
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Simple in-memory rate limiter
export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  
  // Clean up old entries
  if (rateLimitStore.size > 1000) {
    rateLimitStore.clear();
  }
  
  const entry = rateLimitStore.get(ip);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + env.server.rateLimit.windowMs,
    });
    return next();
  }
  
  if (entry.count >= env.server.rateLimit.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter,
    });
  }
  
  entry.count++;
  rateLimitStore.set(ip, entry);
  next();
}