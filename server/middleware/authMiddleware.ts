import type { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

interface DecodedToken extends JwtPayload {
  id: string;
  email: string;
  name?: string;
}

export function generateToken(userId: string, email: string, name?: string): string {
  return jwt.sign(
    { id: userId, email, name: name || "" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch (error) {
    return null;
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.id || !decoded.email) {
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }

  req.user = {
    id: decoded.id,
    email: decoded.email,
    name: decoded.name,
  };

  next();
}

export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (token) {
    const decoded = verifyToken(token);
    if (decoded && decoded.id && decoded.email) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
      };
    }
  }

  next();
}
