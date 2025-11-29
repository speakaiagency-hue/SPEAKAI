import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, MessageSquare, Type, Image as ImageIcon, Video, Sparkles, Copy, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Import assets
import chatImg from "@assets/generated_images/abstract_ai_chat_concept.png";
import promptImg from "@assets/generated_images/creative_writing_prompt_concept.png";
import imageImg from "@assets/generated_images/digital_art_generation_concept.png";
import videoImg from "@assets/generated_images/video_production_concept.png";

export default function Home() {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const prompts = [
    {
      id: "1",
      title: "Roteiro para Video Marketing",
      prompt: "Você é um roteirista expert em vídeos de marketing. Crie um roteiro de 30 segundos para um produto de software que soluciona problemas de produtividade. Inclua: hook nos primeiros 3 segundos, problema, solução e call-to-action.",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=60"
    },
    {
      id: "2",
      title: "Análise de Dados",
      prompt: "Sou um analista de dados. Preciso de uma query SQL otimizada para extrair os top 10 produtos mais vendidos do último mês, agrupados por categoria, com suas respectivas taxas de crescimento em relação ao mês anterior.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=600&auto=format&fit=crop&q=60"
    },
    {
      id: "3",
      title: "Copy para Email Marketing",
      prompt: "Escreva uma copy de email para uma campanha de Black Friday. O produto é um curso online sobre fotografia profissional. Deve ter: subject line impactante, apresentação do desconto, benefícios do curso, urgência e CTA claro. Máximo 200 palavras.",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=60"
    },
    {
      id: "4",
      title: "Brainstorm de Conteúdo",
      prompt: "Me sugira 10 ideias criativas de conteúdo para um blog sobre inteligência artificial e produtividade. Cada ideia deve ter: título, tipo de conteúdo (artigo/vídeo/infográfico), público-alvo e palavra-chave principal.",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop&q=60"
    },
    {
      id: "5",
      title: "Descrição de Produto",
      prompt: "Crie uma descrição detalhada e persuasiva para um produto de fone de ouvido wireless premium. Inclua: características técnicas, benefícios para o usuário, diferenciais da marca e uma chamada para ação. Máximo 150 palavras.",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60"
    },
    {
      id: "6",
      title: "Plano de Conteúdo Social",
      prompt: "Desenvolva um plano de conteúdo para Instagram de um personal trainer. Sugestões de posts para a semana: segunda, quarta, sexta e domingo. Cada post deve incluir: tema, tipo de conteúdo, hashtags relevantes e horário sugerido.",
      image: "https://images.unsplash.com/photo-1611532736adf-a1c17b2b0a4f?w=600&auto=format&fit=crop&q=60"
    },
  ];

  const handleCopy = (promptText: string, id: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    toast({ title: "Prompt copiado!" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const modules = [
    {
      title: "Chat IA",
      description: "Converse com uma inteligência artificial avançada com contexto e memória.",
      href: "/chat",
      icon: MessageSquare,
      image: chatImg,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Gerador de Prompt",
      description: "Crie prompts perfeitos para coding, marketing e design com templates prontos.",
      href: "/prompt",
      icon: Type,
      image: promptImg,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      title: "Geração de Imagem",
      description: "Transforme texto em imagens incríveis com estilos variados e alta resolução.",
      href: "/image",
      icon: ImageIcon,
      image: imageImg,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Geração de Vídeo",
      description: "Crie vídeos curtos e storyboards a partir de descrições textuais.",
      href: "/video",
      icon: Video,
      image: videoImg,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-12 relative">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12 relative overflow-hidden rounded-3xl bg-gradient-to-b from-primary/5 to-transparent border border-primary/10">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-heading font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/60">
            Crie o impossível com <br />
            <span className="text-primary">Inteligência Artificial</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Uma suite completa de ferramentas criativas potencializadas por IA. 
            Gere textos, imagens, vídeos e otimize seus prompts em um único lugar.
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
                  <img 
                    src={module.image} 
                    alt={module.title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
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
                  <CardDescription className="text-base">
                    {module.description}
                  </CardDescription>
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
            <Card key={item.id} className="bg-[#1a1d24] border-[#2d3748] hover:border-primary/50 transition-all duration-300 flex flex-col overflow-hidden">
              {/* Image Preview */}
              <div className="h-40 overflow-hidden bg-[#0f1117]">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
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
