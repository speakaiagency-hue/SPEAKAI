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
  // 🔗 Endpoint do Webhook da Kiwify
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
        console.log("📝 Webhook JSON parseado:", JSON.stringify(body, null, 2));

        // Captura o e-mail do cliente
        const customerEmail =
          body.Customer?.email ||
          body.customer?.email ||
          body.buyer_email ||
          body.email ||
          null;

        if (!customerEmail) {
          console.error("❌ Webhook sem e-mail do cliente, não é possível adicionar créditos");
          return res.status(400).json({ success: false, message: "E-mail do cliente ausente" });
        }

        // Status do pagamento (deixa o service decidir se concede, segura ou revoga)
        const status = body.order_status || body.status || "pending";

        // Monta os dados do webhook
        const webhookData: KiwifyWebhookData = {
          purchase_id: body.purchase_id || body.id || body.order_id || `purchase_${Date.now()}`,
          customer_email: customerEmail,
          customer_name:
            body.Customer?.full_name ||
            body.customer?.name ||
            body.name ||
            "Cliente Kiwify",
          product_name:
            body.Product?.product_name ||
            body.product?.name ||
            body.product_name ||
            "Produto",
          product_id:
            body.Product?.product_id ||
            body.product?.id ||
            body.product_id ||
            "0",
          product_offer_id:
            body.Product?.product_offer_id ||
            body.product_offer_id ||
            body.offer_id ||
            "",
          checkout_link: body.checkout_link || body.short_link || body.link || "",
          value: parseFloat(
            body.Commissions?.charge_amount ||
              body.value ||
              body.total ||
              "0"
          ),
          status,
          raw: body,
        };

        console.log("📦 Dados montados para handleKiwifyPurchase:", webhookData);

        // Processa a compra
        const result = await handleKiwifyPurchase(webhookData, storage);

        if (result.success) {
          console.log(
            `✅ Créditos adicionados: ${result.creditsAdded ?? 0} para usuário ${result.userId}`
          );
          return res.status(200).json({
            success: true,
            message: result.message,
            userId: result.userId,
            creditsAdded: result.creditsAdded ?? 0,
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
