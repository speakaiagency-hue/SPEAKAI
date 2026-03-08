import { GoogleGenAI } from "@google/genai";
import { getGeminiKeyRotator } from "../utils/apiKeyRotator";
import { ReferenceImage } from "../types"; // garante tipagem consistente

export async function createImageService() {
  const rotator = getGeminiKeyRotator();

  return {
    async generateImage(
      prompt: string,
      aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1",
      imageSize: "1K" | "2K" = "1K",
      numberOfImages: 1 | 2 | 3 | 4 = 4,
      personGeneration: "dont_allow" | "allow_adult" | "allow_all" = "allow_adult",
      referenceImages: ReferenceImage[] = []
    ): Promise<{ images: string[]; model: string; message?: string }> {
      return await rotator.executeWithRotation(async (apiKey) => {
        const ai = new GoogleGenAI({ apiKey });

        // Monta os "parts": primeiro imagens, depois texto
        const parts: any[] = referenceImages
          .filter((img) => img?.data && img?.mimeType)
          .map((img) => ({
            inline_data: {
              // remove prefixo caso venha no formato data:image/png;base64,...
              data: img.data.includes(",") ? img.data.split(",")[1] : img.data,
              mime_type: img.mimeType,
            },
          }));

        // Sempre adiciona o prompt no final
        parts.push({
          text: prompt?.trim() || "Uma arte digital cinematográfica e detalhada", // fallback
        });

        const geminiResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: [{ role: "user", parts }],
          config: {
            response_modalities: ["IMAGE"],
            image_config: {
              aspect_ratio: aspectRatio,
              image_size: imageSize,
              number_of_images: numberOfImages,
              person_generation: personGeneration,
            },
          },
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            topK: 40,
          },
        });

        // Debug opcional
        console.log("Gemini response:", JSON.stringify(geminiResponse, null, 2));
        console.log("Finish reason:", geminiResponse.candidates?.[0]?.finishReason);

        const images: string[] = [];
        let message: string | undefined;

        if (geminiResponse.candidates?.[0]?.content?.parts) {
          for (const part of geminiResponse.candidates[0].content.parts) {
            if (part.inline_data) {
              const base64EncodeString: string = part.inline_data.data || "";
              const mimeType = part.inline_data.mime_type;
              images.push(`data:${mimeType};base64,${base64EncodeString}`);
            } else if (part.text) {
              // Se vier texto em vez de imagem, repassamos como mensagem
              console.log("Modelo retornou texto:", part.text);
              message = part.text;
            }
          }
        }

        if (images.length > 0) {
          return {
            images,
            model: "Gemini 2.5 Flash Image",
          };
        }

        // Retorno amigável para o frontend
        return {
          images: [],
          model: "Gemini 2.5 Flash Image",
          message: message || "A resposta da API não continha uma imagem. Tente ajustar o prompt ou a configuração.",
        };
      });
    },
  };
}
