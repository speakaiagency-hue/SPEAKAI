import { GoogleGenAI } from "@google/genai";

export async function createPromptService() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured");
  }

  const ai = new GoogleGenAI({ apiKey });

  return {
    async generateCreativePrompt(userText: string): Promise<string> {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          config: {
            systemInstruction:
              "Você é um especialista em engenharia de prompts de IA, focado em criar descrições visuais para modelos de geração de imagem de alta qualidade (como Imagen, Midjourney, DALL-E). Seu objetivo é pegar descrições simples do usuário e expandi-las em prompts altamente detalhados, artísticos e descritivos. Foque em iluminação, textura, composição, atmosfera, estilo artístico e configurações de câmera. Escreva o resultado final inteiramente em PORTUGUÊS. A saída deve ser um único parágrafo descritivo sem numeração ou marcadores.",
          },
          contents: `Melhore e expanda esta descrição para um prompt completo de geração de imagem: "${userText}".\n\nGaranta que o prompt seja rico em detalhes visuais e esteja em português.`,
        });

        return response.text || "Não foi possível gerar o prompt.";
      } catch (error) {
        console.error("Error generating prompt:", error);
        throw error;
      }
    },
  };
}
