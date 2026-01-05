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

// Mapeamento de produtos → créditos fixos (IDs reais da Kiwify)
const CREDIT_MAP: Record<string, number> = {
  // Pacotes de créditos
  "b25quAR": 100,   // Pacote 100 créditos
  "OHJeYkb": 200,   // Pacote 200 créditos
  "Ypa4tzr": 300,   // Pacote 300 créditos
  "iRNfqB9": 500,   // Pacote 500 créditos
  "zbugEDV": 1000,  // Pacote 1000 créditos
  "LFJ342L": 2000,  // Pacote 2000 créditos

  // Planos (IDs extraídos dos links do PlansModal.tsx)
  "jM0siPY": 500,    // Plano Básico → 500 créditos
  "q0rFdNB": 1500,   // Plano Pro → 1500 créditos
  "KFXdvJv": 5000    // Plano Premium → 5000 créditos
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

    // Usa diretamente o product_id como chave
    const productKey = data.product_id;

    const creditsToAdd = CREDIT_MAP[productKey] ?? 0;
    if (creditsToAdd === 0) {
      console.warn(`⚠️ Produto não reconhecido: ${productKey}`);
      return { success: false, message: "Produto não reconhecido" };
    }

    // Idempotência
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

    // Procura usuário pelo e-mail
    let user = await storage.getUserByEmail(data.customer_email);
    if (!user) {
      user = await storage.createUser({
        username: data.customer_email || `kiwify_${Date.now()}@placeholder.com`,
        password: "kiwify_" + Date.now(),
        provider: "kiwify",
      });

      if (user) {
        await storage.updateUserProfile(user.id, {
          email: data.customer_email || `kiwify_${Date.now()}@placeholder.com`,
          name: data.customer_name || "Cliente Kiwify",
        });
      }
    }

    if (!user) {
      return { success: false, message: "Erro ao criar usuário" };
    }

    // Adiciona créditos
    await storage.addCredits(user.id, creditsToAdd);

    // Registrar evento
    await storage.logWebhookEvent?.(data.purchase_id, user.id, creditsToAdd);

    console.log(`✅ Kiwify purchase processed: ${creditsToAdd} créditos adicionados para usuário ${user.id}`);

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
    const result = await storage.deductCredits(userId, cost);

    if (!result) {
      return {
        success: false,
        error: "insufficient_credits",
        message: `Você precisa de ${cost} créditos para usar ${operationType}. Compre mais créditos.`,
      };
    }

    console.log(`✅ Deduzidos ${cost} créditos para ${operationType}. Restante: ${result.credits}`);

    return {
      success: true,
      creditsRemaining: result.credits,
      cost,
    };
  } catch (error) {
    console.error("🔥 Erro ao descontar créditos:", error);
    return { success: false, message: "Erro ao descontar créditos" };
  }
}
