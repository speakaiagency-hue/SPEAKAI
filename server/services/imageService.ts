import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ModelType, AspectRatio, ImageSize, ReferenceImage } from "../../shared/types"; 
// 👆 ajuste o caminho conforme onde você colocou seu types.ts (ex: src/types ou shared/types)

export const generateImage = async (
  prompt: string,
  model: ModelType,
  references: ReferenceImage[] = [],
  aspectRatio: AspectRatio = "1:1",
  imageSize: ImageSize = "1K",
  numImages: number = 1 // 👈 novo parâmetro
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepara partes: imagens de referência primeiro
  const parts: any[] = references.map((ref) => ({
    inlineData: {
      data: ref.data.split(",")[1], // remove o prefixo data:image/png;base64,
      mimeType: ref.type,
    },
  }));

  // Adiciona o prompt se existir
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

  // Se for modelo PRO, permite escolher tamanho
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

  // Itera sobre todos os candidatos e partes
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
