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

    // 🔎 Busca créditos do usuário
    const creditsData = await storage.getUserCredits(req.user.id);

    if (!creditsData) {
      console.warn(`⚠️ Usuário ${req.user.id} não encontrado ao verificar créditos`);
      return res.status(404).json({ error: "user_not_found", message: "Usuário não encontrado" });
    }

    req.userCredits = creditsData.credits;

    if (req.userCredits <= 0) {
      return res.status(402).json({
        error: "insufficient_credits",
        message: `Você precisa de créditos para continuar. Saldo atual: ${req.userCredits}`,
        creditsRemaining: req.userCredits,
      });
    }

    // ➕ expõe créditos restantes para qualquer rota que venha depois
    res.locals.creditsRemaining = req.userCredits;

    console.log(`✅ Middleware - Usuário ${req.user.id} com ${req.userCredits} créditos`);
    next();
  } catch (error) {
    console.error("🔥 Credits middleware error:", error);
    res.status(500).json({ error: "Erro ao verificar créditos" });
  }
}
