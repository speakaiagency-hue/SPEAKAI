// Tipos para imagens geradas
export interface GeneratedImage {
  id: string;
  url: string; // base64 data url
  prompt: string;
  aspectRatio: string;
  timestamp: number;
  width?: number;
  height?: number;
}

// Configuração de geração
export interface GenerationConfig {
  prompt: string;
  negativePrompt?: string;
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  numberOfImages: number;
}

// Tipos de projeto
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

// Views da aplicação
export type AppView = 'home';

// 🔑 Tipos auxiliares usados no backend (imageService, routes)
export enum ModelType {
  PRO = "gemini-3-pro-image-preview",
  FLASH = "gemini-2.5-flash-image",
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '3:4' | '4:3';

export type ImageSize = '1K' | '2K' | '4K';

export interface ReferenceImage {
  data: string;   // base64 sem prefixo
  type: string;   // mimeType, ex: "image/png"
}
