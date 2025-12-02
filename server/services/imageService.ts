import { GoogleGenAI } from "@google/genai";

export async function createImageService() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured");
  }

  const ai = new GoogleGenAI({ apiKey });

  return {
    async generateImage(
      prompt: string,
      aspectRatio: string = "1:1"
    ): Promise<{ imageUrl: string; model: string }> {
      try {
        const geminiResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio,
            },
          },
        });

        if (geminiResponse.candidates && geminiResponse.candidates[0] && geminiResponse.candidates[0].content && geminiResponse.candidates[0].content.parts) {
          for (const part of geminiResponse.candidates[0].content.parts) {
            if (part.inlineData) {
              const base64EncodeString: string = part.inlineData.data || "";
              const mimeType = part.inlineData.mimeType;
              return {
                imageUrl: `data:${mimeType};base64,${base64EncodeString}`,
                model: "Gemini Flash",
              };
            }
          }
        }

        throw new Error("A resposta da API não continha uma imagem.");
      } catch (e) {
        console.error("Falha ao usar gemini-2.5-flash-image.", e);
        if (e instanceof Error) {
          let msg = e.message;
          if (msg.includes("401")) {
            msg = "Falha na autenticação (Erro 401)...";
          } else if (msg.includes("403")) {
            msg = "Acesso negado (Erro 403)...";
          } else if (msg.includes("429")) {
            msg = "Limite de uso excedido (Erro 429)...";
          }
          throw new Error(`Falha ao gerar imagem: ${msg}`);
        }
        throw new Error("Nenhuma imagem foi gerada.");
      }
    },
  };
}
