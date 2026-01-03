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

// Mapeamento de produtos/plano → créditos fixos
const CREDIT_MAP: Record<string, number> = {
  // Planos
  basico: 500,
  pro: 1.500,
  premium: 5.000,

  // Pacotes de créditos
  "100_creditos": 100,
  "200_creditos": 200,
  "300_creditos": 300,
  "500_creditos": 500,
  "1000_creditos": 1000,
  "2000_creditos": 2000,

  // Fallback para testes da Kiwify
  produto: 50,
  "0": 50,
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

    // Normaliza chave do produto (usa ID ou nome)
    const productKey =
      data.product_id?.toLowerCase() ||
      data.product_name?.toLowerCase().replace(/\s+/g, "_");

    // Busca créditos fixos no mapa
    const creditsToAdd = CREDIT_MAP[productKey] ?? 0;

    if (creditsToAdd === 0) {
      console.warn(`⚠️ Produto não reconhecido: ${productKey}`);
      return { success: false, message: "Produto não reconhecido" };
    }

    // Procura usuário pelo e-mail
    let user = await storage.getUserByEmail(data.customer_email);
    if (!user) {
      // Cria novo usuário
      user = await storage.createUser({
        username: data.customer_email || `kiwify_${Date.now()}@placeholder.com`,
        password: "kiwify_" + Date.now(),
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
    };
  } catch (error) {
    console.error("🔥 Erro ao descontar créditos:", error);
    return { success: false, message: "Erro ao descontar créditos" };
  }
}
