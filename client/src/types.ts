// Tipagem de proporções padronizada
export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

// Tamanhos de imagem suportados
export type ImageSize = "1K" | "2K";

// Configuração de geração de pessoas
export type PersonGeneration = "dont_allow" | "allow_adult" | "allow_all";

// Imagem de referência usada como input para geração
export interface ReferenceImage {
  id: string;
  data: string;      // base64 puro (sem prefixo data:image/png;base64,...)
  mimeType: string;  // tipo MIME (ex: "image/png")
  preview: string;   // usado para exibir no front (DataURL completo)
}

// Imagem gerada pela IA
export interface GeneratedImage {
  id: string;
  url: string;             // base64 data URL (ex: data:image/png;base64,...)
  prompt: string;          // prompt usado na geração
  aspectRatio: AspectRatio; // proporção tipada corretamente
  timestamp: number;       // marca temporal da geração
  width?: number;          // largura opcional
  height?: number;         // altura opcional
}

// Configuração de geração
export interface GenerationConfig {
  prompt: string;
  negativePrompt?: string;   // prompt negativo opcional
  aspectRatio: AspectRatio;
  numberOfImages: number;    // quantas imagens gerar
}

// Resultado da geração (retorno do serviço)
export interface GenerationResult {
  images: string[];          // lista de imagens geradas (base64 dataURL)
  model: string;             // nome do modelo usado
  message?: string;          // mensagem opcional (quando não há imagem ou explicação do modelo)
}

// Metadados de projeto
export interface Project {
  id: string;
  title: string;
  imageUrl: string;
  videoUrl?: string;
  messagesCount?: number;
  isGenerated?: boolean;
  description?: string;
  tag?: string;
}

// Views possíveis da aplicação
export type AppView = "home";
