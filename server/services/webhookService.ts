import crypto from "crypto";
import { storage } from "../storage";

export interface KiwifyWebhookData {
  purchase_id: string;
  customer_email: string;
  customer_name: string;
  product_name: string;
  product_id: string;
  checkout_link?: string; // ✅ suporte ao link curto
  value: number;
  status: string;
}

const CREDIT_COSTS = {
  chat: 1,
  image: 7,
  prompt: 0,
  video: 40,
  video4k: 100, // ✅ novo custo para vídeos 4K
};

const CREDIT_MAP: Record<string, number> = {
  // Links curtos (checkout_link)
  "97ObxqK": 100,
  "3gpZJ6N": 200,
  "M2XmJF7": 300,
  "ntcPS8x": 500,
  "Tqy289G": 1000,
  "f8d7PdX": 2000,
  "8IDayIy": 500,    // Plano Básico
  "QnHmsQm": 1500,   // Plano Pro
  "hOJ3bEi": 5000,   // Plano Premium

  // UUIDs internos (product_id)
  "57c511c0-05d2-11f1-a5d8-9909e220e83a": 2000,  // Produto de Créditos
  "f1e06ef0-05d0-11f1-b57c-c9aa21f3f207": 5000,  // Produto de Planos
};

export async function verifyKiwifySignature(payload: string, signature: string): Promise<boolean> {
  const secret = process.env.KIWIFY_WEBHOOK_SECRET || "";
  if (!secret) return true;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const hash = hmac.digest("hex");
  return hash === signature;
}

export async function handleKiwifyPurchase(data: KiwifyWebhookData) {
  try {
    if (data.status !== "approved") {
      return { success: false, message: "Compra não aprovada" };
    }

    // 🔑 Flexível: tenta primeiro pelo checkout_link, depois pelo product_id
    let productKey: string | undefined;

    if (data.checkout_link && CREDIT_MAP[data.checkout_link]) {
      productKey = data.checkout_link;
    } else if (data.product_id && CREDIT_MAP[data.product_id]) {
      productKey = data.product_id;
    }

    const creditsToAdd = productKey ? CREDIT_MAP[productKey] : 0;

    if (creditsToAdd === 0) {
      console.warn(
        `⚠️ Produto não reconhecido: product_id=${data.product_id}, checkout_link=${data.checkout_link}`
      );
      return { success: false, message: "Produto não reconhecido" };
    }

    const alreadyProcessed = await storage.hasProcessedPurchase?.(data.purchase_id);
    if (alreadyProcessed) {
      console.log(`ℹ️ Compra ${data.purchase_id} já processada, ignorando duplicata.`);
      return {
        success: true,
        message: "Compra já processada",
        userId: alreadyProcessed.userId,
        creditsAdded: 0,
      };
    }

    // 🔎 Normalizar email antes de buscar
    const normalizedEmail = data.customer_email.toLowerCase();
    let user = await storage.getUserByEmail?.(normalizedEmail);

    if (!user) {
      // ✅ Fluxo 2: usuário ainda não existe → salvar como pendente
      console.warn(
        `⚠️ Usuário com email ${normalizedEmail} não encontrado. Registrando compra como pendente.`
      );

      await storage.addPendingPurchase({
        purchaseId: data.purchase_id,
        email: normalizedEmail,
        productId: productKey ?? data.product_id,
        credits: creditsToAdd,
        status: data.status,
      });

      return {
        success: true,
        message: "Compra registrada como pendente (aguardando cadastro)",
        userId: null,
        creditsAdded: 0,
      };
    }

    // ✅ Fluxo 1: adicionar créditos ao usuário existente
    await storage.addCredits(user.id, creditsToAdd, data.purchase_id);
    await storage.logWebhookEvent?.(
      data.purchase_id,
      user.id,
      creditsToAdd,
      productKey ?? data.product_id,
      data.product_name,
      data
    );

    console.log(
      `✅ Compra processada: ${creditsToAdd} créditos adicionados para ${user.email} (ID: ${user.id})`
    );

    return {
      success: true,
      message: `${creditsToAdd} créditos adicionados`,
      userId: user.id,
      creditsAdded: creditsToAdd,
    };
  } catch (error) {
    console.error("🔥 Erro ao processar compra:", error);
    return { success: false, message: "Erro ao processar compra" };
  }
}

export async function deductCredits(
  userId: string,
  operationType: "chat" | "image" | "prompt" | "video" | "video4k"
) {
  try {
    const cost = CREDIT_COSTS[operationType];

    // 🔎 Buscar créditos atuais antes de deduzir
    const currentCredits = await storage.getUserCredits(userId);
    if (!currentCredits || currentCredits.credits < cost) {
      return {
        success: false,
        error: "insufficient_credits",
        message: `Você precisa de ${cost} créditos para usar ${operationType}. Compre mais créditos.`,
      };
    }

    // ✅ Deduzir créditos
    const result = await storage.deductCredits(userId, cost);
    const remaining = result?.credits ?? (currentCredits.credits - cost);

    console.log(
      `✅ Deduzidos ${cost} créditos para ${operationType}. Restante: ${remaining}`
    );

    return {
      success: true,
      creditsRemaining: remaining,
      cost,
    };
  } catch (error) {
    console.error("🔥 Erro ao descontar créditos:", error);
    return { success: false, message: "Erro ao descontar créditos" };
  }
}
