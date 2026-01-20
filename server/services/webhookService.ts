import crypto from "crypto";
import { storage } from "../storage";

export interface KiwifyWebhookData {
  purchase_id: string;
  customer_email: string;
  customer_name: string;
  product_name: string;
  product_id: string;
  value: number;
  status: string;
}

const CREDIT_COSTS = {
  chat: 1,
  image: 7,
  prompt: 0,
  video: 40,
};

const CREDIT_MAP: Record<string, number> = {
  "b25quAR": 100,
  "OHJeYkb": 200,
  "Ypa4tzr": 300,
  "iRNfqB9": 500,
  "zbugEDV": 1000,
  "LFJ342L": 2000,
  "jM0siPY": 500,    // Plano Básico
  "q0rFdNB": 1500,   // Plano Pro
  "KFXdvJv": 5000,   // Plano Premium
  "eaeafac0-c291-11f0-9498-1fd09b0ade58": 1000, // Influencer
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

    const productKey = data.product_id;
    const creditsToAdd = CREDIT_MAP[productKey] ?? 0;

    if (creditsToAdd === 0) {
      console.warn(`⚠️ Produto não reconhecido: ${productKey}`);
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
      console.warn(`⚠️ Usuário com email ${normalizedEmail} não encontrado. Registrando compra como pendente.`);

      await storage.addPendingPurchase({
        purchaseId: data.purchase_id,
        email: normalizedEmail,
        productId: data.product_id,
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
    await storage.logWebhookEvent?.(data.purchase_id, user.id, creditsToAdd, data.product_id, data.product_name, data);

    console.log(`✅ Compra processada: ${creditsToAdd} créditos adicionados para ${user.email} (ID: ${user.id})`);

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

export async function deductCredits(userId: string, operationType: "chat" | "image" | "prompt" | "video") {
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

    console.log(`✅ Deduzidos ${cost} créditos para ${operationType}. Restante: ${result?.credits}`);

    return {
      success: true,
      creditsRemaining: result?.credits ?? currentCredits.credits - cost,
      cost,
    };
  } catch (error) {
    console.error("🔥 Erro ao descontar créditos:", error);
    return { success: false, message: "Erro ao descontar créditos" };
  }
}
