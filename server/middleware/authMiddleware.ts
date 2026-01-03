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

// 🔑 Use uma variável de ambiente segura em produção
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

/**
 * Gera um token JWT para o usuário
 */
export function generateToken(userId: string, email: string, name?: string): string {
  return jwt.sign(
    { id: userId, email, name: name || "" },
    JWT_SECRET,
    { expiresIn: "7d" } // token válido por 7 dias
  );
}

/**
 * Verifica e decodifica um token JWT
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Middleware obrigatório de autenticação
 * Bloqueia requisições sem token válido
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }

  const decoded = verifyToken(token);
  if (!decoded || typeof decoded === "string") {
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }

  req.user = {
    id: decoded.id,
    email: decoded.email,
    name: decoded.name,
  };

  next();
}

/**
 * Middleware opcional de autenticação
 * Permite requisições sem token, mas adiciona req.user se válido
 */
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (token) {
    const decoded = verifyToken(token);
    if (decoded && typeof decoded !== "string") {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
      };
    }
  }

  next();
}
