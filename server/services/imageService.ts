import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ModelType, AspectRatio, ImageSize, ReferenceImage } from "../../client/src/types";

export const generateImage = async (
  prompt: string,
  model: ModelType,
  references: ReferenceImage[] = [],
  aspectRatio: AspectRatio = "1:1",
  imageSize: ImageSize = "1K",
  numImages: number = 1
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepara partes: imagens de referência válidas
  const parts: any[] = references
    .filter((ref) => typeof ref?.data === "string" && typeof ref?.type === "string")
    .map((ref) => {
      const base64 = ref.data.includes(",") ? ref.data.split(",")[1] : ref.data;
      return {
        inlineData: {
          data: base64,
          mimeType: ref.type,
        },
      };
    });

  // Adiciona o prompt se existir
  if (prompt.trim()) {
    parts.push({ text: prompt });
  }

  const config: any = {
    imageConfig: {
      aspectRatio,
    },
    generationConfig: {
      candidateCount: numImages,
    },
  };

  if (model === ModelType.PRO) {
    config.imageConfig.imageSize = imageSize;
  }

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: { parts },
    config,
  });

  if (!response.candidates || response.candidates.length === 0) {
    throw new Error("Nenhum conteúdo gerado pelo modelo.");
  }

  const images: string[] = [];

  for (const candidate of response.candidates) {
    if (candidate.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data && part.inlineData?.mimeType) {
          images.push(
            `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
          );
        }
      }
    }
  }

  if (images.length === 0) {
    throw new Error("Nenhuma imagem encontrada na resposta.");
  }

  return images;
};
