import { GoogleGenAI } from "@google/genai";
import { AspectRatio, ImageInput } from "../types";

export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  inputImage?: ImageInput
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const parts: any[] = [];

  if (inputImage) {
    parts.push({
      inlineData: {
        data: inputImage.data,
        mimeType: inputImage.mimeType,
      },
    });

    const refinedPrompt = prompt
      ? `Edite esta imagem seguindo esta instrução: ${prompt}. Preserve as características principais e o realismo.`
      : "Melhore a qualidade desta imagem mantendo os elementos originais.";

    parts.push({ text: refinedPrompt });
  } else {
    parts.push({ text: prompt || "Uma arte digital cinematográfica e detalhada" });
  }

  // ✅ Correção: contents precisa ser um array com role + parts
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [
      {
        role: "user",
        parts: parts,
      },
    ],
    config: {
      imageConfig: {
        aspectRatio: aspectRatio,
      },
    },
  });

  const candidate = response.candidates?.[0];
  if (!candidate) throw new Error("A IA não respondeu. Tente novamente.");

  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Não foi possível extrair a imagem da resposta.");
};
