import type { Express, Request, Response } from "express";
import {
  handleKiwifyPurchase,
  verifyKiwifySignature,
  KiwifyWebhookData,
  deductCredits,
} from "../services/webhookService";
import { authMiddleware } from "../middleware/authMiddleware";
import type { IStorage } from "../storage";

export async function registerWebhookRoutes(app: Express, storage: IStorage, kiwifyService: any) {
  // Kiwify Webhook Endpoint
  app.post("/api/webhook/kiwify", async (req: Request, res: Response) => {
    try {
      const signature = req.headers["x-kiwify-signature"] as string;
      const payload = JSON.stringify(req.body);

      // Log para confirmar recebimento
      console.log("📩 Webhook recebido da Kiwify:", req.body);

      // Validação da assinatura
      if (signature && process.env.KIWIFY_WEBHOOK_SECRET) {
        const isValid = await verifyKiwifySignature(payload, signature);
        if (!isValid) {
          console.warn("❌ Assinatura inválida no webhook da Kiwify");
          return res.status(401).json({ success: false, message: "Assinatura inválida" });
        }
      }

      // Monta os dados do webhook
      const webhookData: KiwifyWebhookData = {
        purchase_id: req.body.purchase_id || req.body.id,
        customer_email: req.body.customer?.email || req.body.email,
        customer_name: req.body.customer?.name || req.body.name,
        product_name: req.body.product?.name || req.body.product_name,
        product_id: req.body.product?.id || req.body.product_id,
        value: parseFloat(req.body.value || req.body.total || "0"),
        status: req.body.status || "approved",
      };

      // Processa a compra
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

  // Endpoint para consultar créditos do usuário
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
