
export const APP_NAME = "Lasy";
export const MODEL_NAME = "imagen-4.0-generate-001"; 

export const SUGGESTION_CHIPS = [
  "Create a Netflix clone",
  "Create an admin dashboard",
  "Create a kanban board",
  "Create a task manager",
  "Create a store landing page",
  "Create an Airbnb clone",
  "Create a Spotify clone"
];

export const MOCK_VIDEOS = [
  {
    id: 'v1',
    title: 'Dentista falando na cadeira',
    description: 'Vídeo curto estilo reels mostrando um dentista homem de 35 anos, pele clara, cabelo castanho curto e barba bem aparada. Ele está sentado na cadeira odontológica, usando jaleco branco impecável e máscara abaixada no pescoço. Fala diretamente para a câmera com sorriso confiante, em consultório moderno com paredes claras e equipamentos odontológicos ao fundo. Iluminação suave e profissional.',
    videoUrl: 'https://speakia.ai/wp-content/uploads/2026/01/IMG_2884.mp4',
    messagesCount: 0
  },
  {
    id: 'v2',
    title: 'Gerador de Reels',
    description: 'Vídeos curtos e magnéticos com roteiros otimizados para viralização rápida.',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    messagesCount: 0
  },
  {
    id: 'v3',
    title: 'Tradução Global',
    description: 'Dobre seus vídeos para mais de 50 idiomas mantendo sua voz original.',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    messagesCount: 0
  },
  {
    id: 'v4',
    title: 'Cinematografia IA',
    description: 'Crie cenas cinematográficas a partir de descrições simples de texto.',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    messagesCount: 0
  },
  {
    id: 'v5',
    title: 'Motion Graphics',
    description: 'Animações complexas geradas instantaneamente para seus projetos.',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    messagesCount: 0
  },
  {
    id: 'v6',
    title: 'Deepfake Ético',
    description: 'Troca de rostos para produções profissionais com consentimento e segurança.',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    messagesCount: 0
  }
];

export const MOCK_PHOTOS = [
  {
    id: 'p1',
    title: 'IA mostrando um produto na mão',
    description: 'Uma mulher de 29 anos, pele clara, cabelo preto liso, sorriso leve. Ela segura um produto de beleza na mão direita, olhando para a câmera. Roupa casual moderna, fundo branco minimalista, estilo catálogo.',
    imageUrl: 'https://speakia.ai/wp-content/uploads/2026/01/IMG_2888.png',
    messagesCount: 0
  },
  {
    id: 'p2',
    title: 'IA psicóloga foto profissional',
    description: 'Mulher de 35 anos, pele clara, cabelo castanho preso em coque. Roupa formal discreta (blazer azul marinho), fundo de consultório elegante com estante de livros. Expressão acolhedora e confiante, iluminação suave.',
    imageUrl: 'https://speakia.ai/wp-content/uploads/2026/01/IMG_2889.png',
    messagesCount: 0
  },
  {
    id: 'p3',
    title: 'Bella tomando coca-cola',
    description: 'Manter todas as características originais da pessoa e do fundo da imagem sem alterações. Adicionar apenas o detalhe de que a pessoa está segurando uma lata de Coca-Cola e bebendo dela, com gesto natural e expressão descontraída. A iluminação e cenário devem permanecer exatamente iguais ao original.',
    imageUrl: 'https://speakia.ai/wp-content/uploads/2026/01/IMG_2893.png',
    messagesCount: 0
  },
  {
    id: 'p4',
    title: 'IA fazendo ‘provador fashion’',
    description: 'Foto estilo editorial mostrando uma mulher de 24 anos, pele morena clara, cabelo castanho longo. Ela está em frente a espelho experimentando roupas diferentes: vestido elegante, jeans casual e look esportivo. Iluminação de loja moderna, estética Instagram.',
    imageUrl: 'https://speakia.ai/wp-content/uploads/2026/01/IMG_2891.png',
    messagesCount: 0
  },
  {
    id: 'p5',
    title: 'Empresária foto profissional',
    description: 'Foto corporativa de mulher de 38 anos, pele morena, cabelo castanho médio liso, estilo clássico. Roupa executiva feminina (blazer cinza e blusa social azul), fundo de escritório moderno com janelas amplas. Postura firme, olhar determinado, iluminação profissional.',
    imageUrl: 'https://speakia.ai/wp-content/uploads/2026/01/imagem-0-21.png',
    messagesCount: 0
  },
  {
    id: 'p6',
    title: 'Chef de Cozinha Profissional',
    description: 'Retrato realista de uma muher de 32 anos, pele clara, cabelo castanho preso em coque elegante. Ela veste uniforme de chef de cozinha branco impecável com avental preto. Está em uma cozinha moderna e iluminada, segurando uma panela de aço inox com uma das mãos e uma colher de madeira na outra, como se estivesse preparando uma receita. Expressão confiante e simpática, fundo com bancadas de mármore e utensílios culinários organizados. Iluminação quente e profissional, estilo fotografia editorial gastronômica.',
    imageUrl: 'https://speakia.ai/wp-content/uploads/2026/01/imagem-0-22.png',
    messagesCount: 0
  }
];

// Mantendo MOCK_PROJECTS por retrocompatibilidade se necessário
export const MOCK_PROJECTS = [...MOCK_VIDEOS];

export const ASPECT_RATIOS = [
  { value: '1:1', label: 'Square' },
  { value: '3:4', label: 'Portrait' },
  { value: '4:3', label: 'Landscape' },
  { value: '9:16', label: 'Mobile' },
  { value: '16:9', label: 'Desktop' },
];

export const SAMPLE_PROMPTS = [
  "A futuristic city with flying cars",
  "A calm zen garden with cherry blossoms",
  "Cyberpunk street food vendor",
  "Minimalist coffee shop logo",
  "Abstract geometric patterns in neon colors"
];
