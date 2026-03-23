import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 1. Extend the standard Express Request
export interface AuthRequest extends Request {
  user?: any; // Replace 'any' with your actual User or JwtPayload type if you have one
  userId?: string;
}

// 2. JWT middleware - verifies token and extracts user info
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const jwtSecret = process.env.JWT_SECRET || 'secret';

  try {
    const decoded: any = jwt.verify(token, jwtSecret);
    req.userId = decoded.sub; // JWT 'sub' claim contains user ID
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};