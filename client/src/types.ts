
export interface GeneratedImage {
  id: string;
  url: string; // base64 data url
  prompt: string;
  aspectRatio: string;
  timestamp: number;
  width?: number;
  height?: number;
}

export interface GenerationConfig {
  prompt: string;
  negativePrompt?: string;
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  numberOfImages: number;
}

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

export type AppView = 'home';
