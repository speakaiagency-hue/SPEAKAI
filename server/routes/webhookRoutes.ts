import type { Express, Request, Response } from "express";
import {
  handleKiwifyPurchase,
  verifyKiwifySignature,
  KiwifyWebhookData,
} from "../services/webhookService";
import { authMiddleware } from "../middleware/authMiddleware";
import type { IStorage } from "../storage";
import express from "express";

export async function registerWebhookRoutes(app: Express, storage: IStorage, kiwifyService: any) {
  // ✅ Kiwify Webhook Endpoint com express.raw para validar assinatura
  app.post("/api/webhook/kiwify", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
    try {
      const signature = req.headers["x-kiwify-signature"] as string;
      const payload = req.body instanceof Buffer ? req.body.toString("utf8") : req.body;

      console.log("📩 Webhook recebido da Kiwify:", payload);

      // Validação da assinatura
      if (signature && process.env.KIWIFY_WEBHOOK_SECRET) {
        const isValid = await verifyKiwifySignature(payload, signature);
        if (!isValid) {
          console.warn("❌ Assinatura inválida no webhook da Kiwify");
          return res.status(401).json({ success: false, message: "Assinatura inválida" });
        }
      }

      const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
      const fallbackEmail = `kiwify_${Date.now()}@placeholder.com`;

      const webhookData: KiwifyWebhookData = {
        purchase_id: parsed.purchase_id || parsed.id || `purchase_${Date.now()}`,
        customer_email: parsed.customer?.email || parsed.email || fallbackEmail,
        customer_name: parsed.customer?.name || parsed.name || "Cliente Kiwify",
        product_name: parsed.product?.name || parsed.product_name || "Produto",
        product_id: parsed.product?.id || parsed.product_id || "0",
        value: parseFloat(parsed.value || parsed.total || "0"),
        status: parsed.status || "approved",
      };

      console.log("📦 Dados montados para handleKiwifyPurchase:", webhookData);

      const result = await handleKiwifyPurchase(webhookData);

      if (result.success) {
        console.log(`✅ Créditos adicionados: ${result.creditsAdded} para usuário ${result.userId}`);
        return res.status(200).json({
          success: true,
          message: result.message,
          userId: result.userId,
          creditsAdded: result.creditsAdded,
        });
      } else {
        console.warn("⚠️ Falha ao processar compra:", result.message);
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("🔥 Erro ao processar webhook da Kiwify:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao processar webhook",
      });
    }
  });

  // ✅ Endpoint para consultar créditos do usuário
  app.get("/api/credits/balance", authMiddleware, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.json({ credits: 0 });
      }

      const credits = await (storage as any).getUserCredits?.(req.user!.id);
      const creditBalance = credits?.credits ?? 0;

      console.log(`✅ Créditos do usuário ${req.user!.id}: ${creditBalance}`);
      res.json({ credits: creditBalance });
    } catch (error) {
      console.error("Erro ao buscar créditos:", error);
      res.json({ credits: 0 });
    }
  });
}
