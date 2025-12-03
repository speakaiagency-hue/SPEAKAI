import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, MessageSquare, Type, Video as VideoIcon, Video, Copy, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Vídeos de demonstração (links externos)
  const CHAT_VIDEO_URL = "https://speakia.ai/wp-content/uploads/2025/12/chat.mp4";
  const PROMPT_VIDEO_URL = "https://speakia.ai/wp-content/uploads/2025/12/prompt.mp4";
  const IMAGE_VIDEO_URL = "https://speakia.ai/wp-content/uploads/2025/12/imagem.mp4";
  const VIDEO_VIDEO_URL = "https://speakia.ai/wp-content/uploads/2025/12/Video.mp4";

  // Prompts
  const prompts = [
    {
      id: "1",
      title: "Elegância Rosa nas Ruas de Paris",
      prompt:
        "Uma mulher de 25 anos, magra e com corpo definido, exibe um estilo único ao caminhar pelas ruas charmosas de Paris...",
      video: "https://speakia.ai/wp-content/uploads/2025/12/g695xbvax5oi_download.mp4",
    },
    {
      id: "2",
      title: "Noite Parisiense em Quatro Rodas",
      prompt:
        "Uma mulher de 32 anos, alta e elegante, com cabelos castanhos ondulados e pele bronzeada, dirige um carro esportivo...",
      video: "https://speakia.ai/wp-content/uploads/2025/12/gcnx0c60umv7_download.mp4",
    },
    {
      id: "3",
      title: "A Voz da Confiança na Medicina",
      prompt:
        "Um médico de 35 anos, alto e de postura firme, veste um jaleco branco impecável enquanto percorre os corredores...",
      video: "https://speakia.ai/wp-content/uploads/2025/12/cmst2m3osuub_download.mp4",
    },
    {
      id: "4",
      title: "Força e Amor em Movimento",
      prompt:
        "Um casal jovem, ambos com cerca de 28 anos, treina lado a lado em uma academia moderna e bem iluminada...",
      video: "https://speakia.ai/wp-content/uploads/2025/12/1jlkbvi6sawj_download.mp4",
    },
    {
      id: "5",
      title: "Escuta que Transforma",
      prompt:
        "Uma psicóloga de 29 anos, com postura calma e acolhedora, recebe um paciente em seu consultório moderno...",
      video: "https://speakia.ai/wp-content/uploads/2025/12/dpvzgpzancy0_download.mp4",
    },
    {
      id: "6",
      title: "A Autoridade da Justiça",
      prompt:
        "Um juiz de 48 anos, de postura firme e olhar atento, está sentado à frente de um tribunal imponente...",
      video: "https://speakia.ai/wp-content/uploads/2025/12/d354qjq08um2_download.mp4",
    },
  ];

  const handleCopy = (promptText: string, id: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    toast({ title: "Prompt copiado!" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Módulos
  const modules = [
    {
      title: "Chat IA",
      description: "Converse com uma inteligência artificial avançada com contexto e memória.",
      href: "/chat",
      icon: MessageSquare,
      video: CHAT_VIDEO_URL,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Gerador de Prompt",
      description: "Crie prompts perfeitos para coding, marketing e design com templates prontos.",
      href: "/prompt",
      icon: Type,
      video: PROMPT_VIDEO_URL,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      title: "Geração de Imagem",
      description: "Transforme texto em imagens incríveis com estilos variados e alta resolução.",
      href: "/image",
      icon: VideoIcon,
      video: IMAGE_VIDEO_URL,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Geração de Vídeo",
      description: "Crie vídeos curtos e storyboards a partir de descrições textuais.",
      href: "/video",
      icon: Video,
      video: VIDEO_VIDEO_URL,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-12 relative">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12 relative overflow-hidden rounded-3xl bg-gradient-to-b from-primary/5 to-transparent border border-primary/10">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-[15px]">
          <h1 className="text-5xl md:text-6xl font-heading font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/60">
            Crie seu mundo com <br />
            <span className="text-primary">Avatares Inteligentes</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transforme fotos em vídeos, crie avatares exclusivos e explore infinitas possibilidades criativas com IA.
          </p>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {modules.map((module) => (
          <Link key={module.href} href={module.href} className="group">
            <Card className="h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                <video
                  src={module.video}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  autoPlay
                  muted
                  loop
                  playsInline
                  onContextMenu={(e) => e.preventDefault()}
                />
                <div
                  className={`absolute top-4 left-4 p-3 rounded-xl ${module.bg} backdrop-blur-md z-20 border border-white/10`}
                >
                  <module.icon className={`w-6 h-6 ${module.color}`} />
                </div>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between font-heading text-2xl">
                  {module.title}
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </CardTitle>
                <CardDescription className="text-base">{module.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>

      {/* Prompts Library Section */}
      <section className="space-y-6 mt-16 pt-12 border-t border-border/30">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-heading font-bold">Biblioteca de Prompts</h2>
          <p className="text-muted-foreground">
            Prompts prontos para você copiar e usar em qualquer ferramenta de IA
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prompts.map((item) => (
            <Card
              key={item.id}
              className="bg-[#1a1d24] border-[#2d3748] hover:border-primary/50 transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Video Preview */}
              <div className="h-40 overflow-hidden bg-[#0f1117]">
                <video
                  src={item.video}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  autoPlay
                  muted
                  loop
                  playsInline
                  onContextMenu={(e) => e.preventDefault
                                      onContextMenu={(e) => e.preventDefault()}
                />
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white">{item.title}</CardTitle>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <p className="text-xs text-gray-400 leading-relaxed flex-1 mb-4 line-clamp-3">
                  {item.prompt}
                </p>
                <Button
                  size="sm"
                  onClick={() => handleCopy(item.prompt, item.id)}
                  className={`w-full transition-all text-xs ${
                    copiedId === item.id
                      ? "bg-green-600 hover:bg-green-600"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3 h-3 mr-1" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" /> Copiar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
