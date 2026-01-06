import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

export async function createImageService() {
  return {
    async generateImage(
      prompt: string,
      aspectRatio: AspectRatio = "1:1"
    ): Promise<{ imageUrl: string; model: string }> {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // Apenas texto para geração
      const parts = [
        {
          text: prompt || "Uma arte digital cinematográfica e detalhada",
        },
      ];

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
            return {
              imageUrl: `data:${mimeType};base64,${base64EncodeString}`,
              model: "Gemini Flash",
            };
          }
        }
      }

      throw new Error("A resposta da API não continha uma imagem.");
    },
  };
}
