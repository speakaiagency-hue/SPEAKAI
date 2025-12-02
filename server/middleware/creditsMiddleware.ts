import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

declare global {
  namespace Express {
    interface Request {
      userCredits?: number;
    }
  }
}

export async function creditsCheckMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const credits = await storage.getUserCredits(req.user.id);
    req.userCredits = credits?.credits || 0;

    if (req.userCredits <= 0) {
      return res.status(402).json({
        error: "insufficient_credits",
        message: "Você não tem créditos disponíveis. Compre mais créditos para continuar.",
        creditsRemaining: 0,
      });
    }

    next();
  } catch (error) {
    console.error("Credits middleware error:", error);
    res.status(500).json({ error: "Erro ao verificar créditos" });
  }
}
