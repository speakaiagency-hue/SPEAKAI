
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
    title: 'Avatares & Voz',
    description: 'Dê vida à sua marca com influenciadores digitais ultra-realistas e clonagem de voz.',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    tag: 'VÍDEO IA',
    messagesCount: 0
  },
  {
    id: 'v2',
    title: 'Gerador de Reels',
    description: 'Vídeos curtos e magnéticos com roteiros otimizados para viralização rápida.',
    imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    tag: 'VÍDEO IA',
    messagesCount: 0
  },
  {
    id: 'v3',
    title: 'Tradução Global',
    description: 'Dobre seus vídeos para mais de 50 idiomas mantendo sua voz original.',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    tag: 'VÍDEO IA',
    messagesCount: 0
  },
  {
    id: 'v4',
    title: 'Cinematografia IA',
    description: 'Crie cenas cinematográficas a partir de descrições simples de texto.',
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    tag: 'VÍDEO IA',
    messagesCount: 0
  },
  {
    id: 'v5',
    title: 'Motion Graphics',
    description: 'Animações complexas geradas instantaneamente para seus projetos.',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    tag: 'VÍDEO IA',
    messagesCount: 0
  },
  {
    id: 'v6',
    title: 'Deepfake Ético',
    description: 'Troca de rostos para produções profissionais com consentimento e segurança.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    tag: 'VÍDEO IA',
    messagesCount: 0
  }
];

export const MOCK_PHOTOS = [
  {
    id: 'p1',
    title: 'Retratos Realistas',
    description: 'Fotografia de pessoas com detalhes de pele e iluminação de estúdio impecáveis.',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    tag: 'FOTO IA',
    messagesCount: 0
  },
  {
    id: 'p2',
    title: 'Estúdio Visual',
    description: 'Crie imagens publicitárias com precisão absoluta de iluminação e composição.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    tag: 'FOTO IA',
    messagesCount: 0
  },
  {
    id: 'p3',
    title: 'Arquitetura Futura',
    description: 'Designs arquitetônicos inovadores e renderizações fotorrealistas.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    tag: 'FOTO IA',
    messagesCount: 0
  },
  {
    id: 'p4',
    title: 'Product Design',
    description: 'Mockups de produtos em alta definição para e-commerce e apresentações.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    tag: 'FOTO IA',
    messagesCount: 0
  },
  {
    id: 'p5',
    title: 'Concept Art',
    description: 'Ilustrações fantásticas para jogos, filmes e storytelling visual.',
    imageUrl: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?auto=format&fit=crop&w=800&q=80',
    tag: 'FOTO IA',
    messagesCount: 0
  },
  {
    id: 'p6',
    title: 'Food Styling',
    description: 'Imagens gastronômicas que despertam o desejo, prontas para redes sociais.',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    tag: 'FOTO IA',
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
