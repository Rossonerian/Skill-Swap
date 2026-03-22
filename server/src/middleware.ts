import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "secret";

export interface AuthRequest extends Request {
  userId?: string;
}

export const authRequired = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const auth = req.headers["authorization"]?.toString().split(" ");
  if (!auth || auth[0] !== "Bearer" || !auth[1]) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const data = jwt.verify(auth[1], secret) as { sub: string };
    req.userId = data.sub;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
