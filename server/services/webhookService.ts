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
  image: 5,
  prompt: 2,
  video: 20,
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

    // Calculate credits based on value (approximately 10 credits per R$ 1)
    const creditsToAdd = Math.round(data.value * 10);

    // Find or create user by email
    let user = await storage.getUserByEmail(data.customer_email);
    if (!user) {
      // Create user with email as username
      user = await storage.createUser({
        username: data.customer_email,
        password: "kiwify_" + Date.now(),
      });
      
      // Update with email and name
      if (user) {
        await storage.updateUserProfile(user.id, {
          email: data.customer_email,
          name: data.customer_name,
        });
      }
    }

    if (!user) {
      return { success: false, message: "Erro ao criar usuário" };
    }

    // Add credits
    await storage.addCredits(user.id, creditsToAdd);

    console.log(`✅ Kiwify purchase processed: ${creditsToAdd} credits added to user ${user.id}`);

    return {
      success: true,
      message: `${creditsToAdd} créditos adicionados`,
      userId: user.id,
      creditsAdded: creditsToAdd,
    };
  } catch (error) {
    console.error("Error handling Kiwify purchase:", error);
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

    console.log(`✅ Deducted ${cost} credits for ${operationType}. Remaining: ${result.credits}`);

    return {
      success: true,
      creditsRemaining: result.credits,
    };
  } catch (error) {
    console.error("Error deducting credits:", error);
    return { success: false, message: "Erro ao descontar créditos" };
  }
}
