import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ModelType, AspectRatio, ImageSize, ReferenceImage } from "../types";

export const generateImage = async (
  prompt: string,
  model: ModelType,
  references: ReferenceImage[],
  aspectRatio: AspectRatio = "1:1",
  imageSize: ImageSize = "1K",
  numImages: number = 1 // 👈 novo parâmetro
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const parts: any[] = references.map((ref) => ({
    inlineData: {
      data: ref.data.split(",")[1],
      mimeType: ref.type,
    },
  }));

  if (prompt.trim()) {
    parts.push({ text: prompt });
  }

  const config: any = {
    imageConfig: {
      aspectRatio,
    },
    generationConfig: {
      candidateCount: numImages, // 👈 pede várias imagens
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
        if (part.inlineData) {
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
