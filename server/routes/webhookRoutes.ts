import type { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import {
  handleKiwifyPurchase,
  verifyKiwifySignature,
  KiwifyWebhookData,
} from "../services/webhookService";
import { authMiddleware } from "../middleware/authMiddleware";
import type { IStorage } from "../storage";

export async function registerWebhookRoutes(app: Express, storage: IStorage, kiwifyService: any) {
  // 🔗 Kiwify Webhook Endpoint
  app.post(
    "/api/webhook/kiwify",
    bodyParser.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf.toString(); // salva corpo cru para validar assinatura
      },
    }),
    async (req: Request, res: Response) => {
      try {
        const signature = req.headers["x-kiwify-signature"] as string;
        const payload = (req as any).rawBody; // corpo cru para validação

        // Log para confirmar recebimento
        console.log("📩 Webhook recebido da Kiwify (raw):", payload);

        // Validação da assinatura
        if (signature && process.env.KIWIFY_WEBHOOK_SECRET) {
          const isValid = await verifyKiwifySignature(payload, signature);
          if (!isValid) {
            console.warn("❌ Assinatura inválida no webhook da Kiwify");
            return res.status(401).json({ success: false, message: "Assinatura inválida" });
          }
        }

        // Agora req.body já é objeto JSON parseado
        const body = req.body;

        // Garantir que temos e-mail do cliente
        if (!body.customer?.email) {
          console.error("❌ Webhook sem e-mail do cliente, não é possível adicionar créditos");
          return res.status(400).json({ success: false, message: "E-mail do cliente ausente" });
        }

        // Validar status do pagamento
        const status = body.status;
        if (!["paid", "completed", "approved"].includes(status)) {
          console.warn("⚠️ Status não reconhecido:", status);
          return res.status(400).json({ success: false, message: "Status inválido" });
        }

        // Monta os dados do webhook
        const webhookData: KiwifyWebhookData = {
          purchase_id: body.purchase_id || body.id || `purchase_${Date.now()}`,
          customer_email: body.customer.email,
          customer_name: body.customer?.name || "Cliente Kiwify",
          product_name: body.product?.name || body.product_name || "Produto",
          product_id: body.product?.id || body.product_id || "0",
          value: parseFloat(body.value || body.total || "0"),
          status,
        };

        console.log("📦 Dados montados para handleKiwifyPurchase:", webhookData);

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
    }
  );

  // 🔗 Endpoint para consultar créditos do usuário
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
