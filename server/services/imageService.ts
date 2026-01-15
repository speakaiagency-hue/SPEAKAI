import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ModelType, AspectRatio, ImageSize, ReferenceImage } from "../../client/src/types";

// Função para obter uma chave válida do ambiente
function getApiKey(): string {
  const keys = process.env.GEMINI_API_KEYS?.split(",").map(k => k.trim()).filter(Boolean);
  if (!keys || keys.length === 0) {
    throw new Error("Nenhuma chave GEMINI_API_KEYS definida no ambiente.");
  }
  // Usa a primeira chave da lista (simples e funcional)
  return keys[0];
}

export const generateImage = async (
  prompt: string,
  model: ModelType,
  images: ReferenceImage[] = [],   // 👈 alinhado com o nome usado na rota
  aspectRatio: AspectRatio = "1:1",
  imageSize: ImageSize = "1K",
  numImages: number = 1
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  // Prepara partes: imagens de referência válidas
  const parts: any[] = images
    .filter((img) => typeof img?.data === "string" && typeof img?.type === "string")
    .map((img) => {
      const base64 = img.data.includes(",") ? img.data.split(",")[1] : img.data;
      return {
        inlineData: {
          data: base64,
          mimeType: img.type,
        },
      };
    });

  // Adiciona o prompt se existir
  if (prompt.trim()) {
    parts.push({ text: prompt });
  }

  const config: any = {
    imageConfig: { aspectRatio },
    generationConfig: { candidateCount: numImages },
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

  const resultImages: string[] = [];

  for (const candidate of response.candidates) {
    if (candidate.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data && part.inlineData?.mimeType) {
          resultImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
        }
      }
    }
  }

  if (resultImages.length === 0) {
    throw new Error("Nenhuma imagem encontrada na resposta.");
  }

  return resultImages;
};
