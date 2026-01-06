import { GoogleGenAI } from "@google/genai";
import { getGeminiKeyRotator } from "../utils/apiKeyRotator";

export async function createImageService() {
  const rotator = getGeminiKeyRotator();

  return {
    async generateImage(
      prompt: string,
      aspectRatio: string = "1:1",
      inputImage?: { data: string; mimeType: string }
    ): Promise<{ imageUrl: string; model: string }> {
      return await rotator.executeWithRotation(async (apiKey) => {
        const ai = new GoogleGenAI({ apiKey });

        const parts: any[] = [];

        if (inputImage) {
          // Primeiro envia a imagem
          parts.push({
            inlineData: {
              data: inputImage.data,
              mimeType: inputImage.mimeType,
            },
          });

          // Depois envia instrução do usuário
          parts.push({
            text: prompt || "Edite esta imagem mantendo todos os elementos originais.",
          });
        } else {
          // Geração só por texto
          parts.push({
            text: prompt || "Uma arte digital cinematográfica e detalhada",
          });
        }

        const geminiResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: [
            {
              role: "user",
              parts,
            },
          ],
          config: {
            imageConfig: { aspectRatio },
          },
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            topK: 40,
          },
        });

        console.log("Gemini response:", JSON.stringify(geminiResponse, null, 2));

        const candidate = geminiResponse.candidates?.[0];
        if (!candidate) throw new Error("A IA não respondeu. Tente novamente.");

        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            const base64EncodeString: string = part.inlineData.data || "";
            const mimeType = part.inlineData.mimeType;
            return {
              imageUrl: `data:${mimeType};base64,${base64EncodeString}`,
              model: "Gemini Flash",
            };
          }
        }

        throw new Error("A resposta da API não continha uma imagem.");
      });
    },
  };
}
