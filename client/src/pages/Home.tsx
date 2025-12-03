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

  // Biblioteca de prompts com preview em vídeo
  const prompts = [
    {
      id: "1",
      title: "Roteiro para Video Marketing",
      prompt:
        "Você é um roteirista expert em vídeos de marketing. Crie um roteiro de 30 segundos para um produto de software que soluciona problemas de produtividade. Inclua: hook nos primeiros 3 segundos, problema, solução e call-to-action.",
      video: CHAT_VIDEO_URL,
    },
    {
      id: "2",
      title: "Análise de Dados",
      prompt:
        "Sou um analista de dados. Preciso de uma query SQL otimizada para extrair os top 10 produtos mais vendidos do último mês, agrupados por categoria, com suas respectivas taxas de crescimento em relação ao mês anterior.",
      video: PROMPT_VIDEO_URL,
    },
    {
      id: "3",
      title: "Copy para Email Marketing",
      prompt:
        "Escreva uma copy de email para uma campanha de Black Friday. O produto é um curso online sobre fotografia profissional. Deve ter: subject line impactante, apresentação do desconto, benefícios do curso, urgência e CTA claro. Máximo 200 palavras.",
      video: IMAGE_VIDEO_URL,
    },
    {
      id: "4",
      title: "Brainstorm de Conteúdo",
      prompt:
        "Me sugira 10 ideias criativas de conteúdo para um blog sobre inteligência artificial e produtividade. Cada ideia deve ter: título, tipo de conteúdo (artigo/vídeo/infográfico), público-alvo e palavra-chave principal.",
      video: VIDEO_VIDEO_URL,
    },
    {
      id: "5",
      title: "Descrição de Produto",
      prompt:
        "Crie uma descrição detalhada e persuasiva para um produto de fone de ouvido wireless premium. Inclua: características técnicas, benefícios para o usuário, diferenciais da marca e uma chamada para ação. Máximo 150 palavras.",
      video: CHAT_VIDEO_URL,
    },
    {
      id: "6",
      title: "Plano de Conteúdo Social",
      prompt:
        "Desenvolva um plano de conteúdo para Instagram de um personal trainer. Sugestões de posts para a semana: segunda, quarta, sexta e domingo. Cada post deve incluir: tema, tipo de conteúdo, hashtags relevantes e horário sugerido.",
      video: PROMPT_VIDEO_URL,
    },
  ];

  const handleCopy = (promptText: string, id: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    toast({ title: "Prompt copiado!" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Módulos com preview em vídeo (links externos)
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
      icon: VideoIcon, // pode trocar para ImageIcon se preferir
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
                />
                <div className={`absolute top-4 left-4 p-3 rounded-xl ${module.bg} backdrop-blur-md z-20 border border-white/10`}>
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
          <p className="text-muted-foreground">Prompts prontos para você copiar e usar em qualquer ferramenta de IA</p>
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
                  controls
                  playsInline
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
                    copiedId === item.id ? "bg-green-600 hover:bg-green-600" : "bg-indigo-600 hover:bg-indigo-700"
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
