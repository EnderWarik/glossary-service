import { Request, Response, NextFunction } from 'express';
import { config } from './config';

export function bearerAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!config.apiAuthToken) {
    res.status(503).json({ detail: 'Server not configured: API_AUTH_TOKEN is missing' });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ detail: 'Unauthorized' });
    return;
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || token !== config.apiAuthToken) {
    res.status(401).json({ detail: 'Unauthorized' });
    return;
  }

  next();
}

