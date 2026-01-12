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

    // 🔎 Buscar usuário pelo email
    let user = await storage.getUserByEmail?.(data.customer_email);

    if (!user) {
      console.warn(`⚠️ Usuário com email ${data.customer_email} não encontrado. Não foi possível adicionar créditos.`);
      return { success: false, message: "Usuário não encontrado" };
    }

    // ✅ Adicionar créditos ao usuário existente
    await storage.addCredits(user.id, creditsToAdd);
    await storage.logWebhookEvent?.(data.purchase_id, user.id, creditsToAdd);

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
