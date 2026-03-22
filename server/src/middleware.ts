import { Request } from 'express';
// Add any other imports you have, like jsonwebtoken

// 1. Extend the standard Express Request
export interface AuthRequest extends Request {
  user?: any; // Replace 'any' with your actual User or JwtPayload type if you have one
}

// 2. Now your middleware will recognize req.headers
export const requireAuth = (req: AuthRequest, res: any, next: any) => {
  const authHeader = req.headers.authorization; // This will no longer throw an error
  
  // ... rest of your JWT verification logic
};