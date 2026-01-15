import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import { Message, Persona } from "../types";

const TEXT_MODEL = "gemini-3-flash-preview";
const IMAGE_MODEL = "gemini-2.5-flash-image";

export class GeminiService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  }

  async *streamChat(
    history: Message[],
    persona: Persona,
    attachedImage?: { data: string; mimeType: string }
  ): AsyncGenerator<string> {
    if (!history.length) {
      yield "Histórico vazio: não há mensagem para processar.";
      return;
    }

    const ai = this.getAI();
    const userPrompt = history[history.length - 1].content;

    // Transform history for Gemini format
    const contents: Content[] = history.slice(0, -1).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Current parts
    const currentParts: Content["parts"] = [{ text: userPrompt }];

    // Add image if attached for Vision
    if (attachedImage) {
      currentParts.unshift({
        inlineData: {
          data: attachedImage.data.split(",")[1], // Remove prefix if present
          mimeType: attachedImage.mimeType,
        },
      });
    }

    contents.push({
      role: "user",
      parts: currentParts,
    });

    try {
      const responseStream = await ai.models.generateContentStream({
        model: TEXT_MODEL,
        contents,
        config: {
          systemInstruction: persona.systemInstruction,
          temperature: 0.7,
        },
      });

      for await (const chunk of responseStream) {
        const text = (chunk as GenerateContentResponse).text;
        if (text) yield text;
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      yield "Desculpe, ocorreu um erro ao processar sua mensagem.";
    }
  }

  async generateImage(
    prompt: string
  ): Promise<{ imageUrl: string; description: string }> {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: { parts: [{ text: prompt }] },
      });

      if (!response.candidates?.length) {
        throw new Error("Nenhuma imagem gerada.");
      }

      let imageUrl = "";
      let description = "";

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        } else if (part.text) {
          description = part.text;
        }
      }

      return { imageUrl, description };
    } catch (error) {
      console.error("Image Generation Error:", error);
      return { imageUrl: "", description: "Erro ao gerar imagem." };
    }
  }
}

// Instância única
export const gemini = new GeminiService();

/**
 * Wrapper para compatibilidade com routes.ts
 * Assim você pode continuar usando `createChatService()` no routes.ts
 */
export async function createChatService() {
  return {
    createChat(history?: Content[]) {
      return gemini["getAI"]().chats.create({
        model: TEXT_MODEL,
        history,
      });
    },

    async sendMessage(chat: any, message: string) {
      const result = await chat.sendMessage({ message });
      return result;
    },

    async generateTitle(text: string): Promise<string> {
      return text.split(" ").slice(0, 5).join(" ");
    },
  };
}
