import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ModelType, AspectRatio, ImageSize, ReferenceImage } from "../types";

// Helper to check for the presence of the aistudio window object
const checkAiStudio = () => (window as any).aistudio;

export const hasSelectedKey = async (): Promise<boolean> => {
  const aistudio = checkAiStudio();
  if (aistudio) {
    return await aistudio.hasSelectedApiKey();
  }
  return true; // Fallback if environment doesn't require selection
};

export const openSelectKey = async (): Promise<void> => {
  const aistudio = checkAiStudio();
  if (aistudio) {
    await aistudio.openSelectKey();
  }
};

export const generateImage = async (
  prompt: string,
  model: ModelType,
  references: ReferenceImage[],
  aspectRatio: AspectRatio = "1:1",
  imageSize: ImageSize = "1K"
): Promise<string[]> => {
  // Sempre cria uma nova instância para garantir que usa a API key atualizada
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepara partes: referências primeiro, depois o texto
  const parts: any[] = references.map((ref) => ({
    inlineData: {
      data: ref.data.split(",")[1], // remove o prefixo data:image/png;base64,
      mimeType: ref.type,
    },
  }));

  if (prompt.trim()) {
    parts.push({ text: prompt });
  }

  try {
    const config: any = {
      imageConfig: {
        aspectRatio,
      },
    };

    // gemini-3-pro-image-preview suporta imageSize
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

    // 🔑 Itera sobre TODOS os candidatos e partes
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
  } catch (error: any) {
    console.error("Erro na geração de imagem:", error);
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_ERROR");
    }
    throw error;
  }
};
