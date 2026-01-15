import { GoogleGenAI } from "@google/genai";
import { getGeminiKeyRotator } from "../utils/apiKeyRotator";

export async function createImageService() {
  const rotator = getGeminiKeyRotator();

  return {
    async generateImage(
      prompt: string,
      aspectRatio: string = "1:1",
      inputImages: { data: string; mimeType: string }[] = []
    ): Promise<{ images: string[]; model: string }> {
      return await rotator.executeWithRotation(async (apiKey) => {
        const ai = new GoogleGenAI({ apiKey });

        const parts: any[] = [];

        if (inputImages.length > 0) {
          // Adiciona todas as imagens enviadas
          for (const img of inputImages) {
            parts.push({
              inlineData: {
                data: img.data,
                mimeType: img.mimeType,
              },
            });
          }

          // Depois adiciona instrução do usuário
          parts.push({
            text: prompt || "Edite estas imagens mantendo os elementos originais.",
          });
        } else {
          // Geração só por texto
          parts.push({
            text: prompt || "Uma arte digital cinematográfica e detalhada",
          });
        }

        const geminiResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: { parts },
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

        const images: string[] = [];

        if (
          geminiResponse.candidates &&
          geminiResponse.candidates[0] &&
          geminiResponse.candidates[0].content &&
          geminiResponse.candidates[0].content.parts
        ) {
          for (const part of geminiResponse.candidates[0].content.parts) {
            if (part.inlineData) {
              const base64EncodeString: string = part.inlineData.data || "";
              const mimeType = part.inlineData.mimeType;
              images.push(`data:${mimeType};base64,${base64EncodeString}`);
            }
          }
        }

        if (images.length === 0) {
          throw new Error("A resposta da API não continha imagens.");
        }

        return {
          images,
          model: "Gemini Flash",
        };
      });
    },
  };
}
