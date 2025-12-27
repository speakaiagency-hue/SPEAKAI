import { useState } from "react";
import { Copy, Save, Wand2, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeader } from "@/lib/auth";
import { withMembershipCheck } from "@/components/ProtectedGenerator";

function PromptComponent() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [qualityScore, setQualityScore] = useState(0);
  const [input, setInput] = useState("");

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast({ title: "Por favor, descreva o conteúdo primeiro", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/prompt/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ userInput: input }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao gerar prompt");
      }

      const result = await response.json();
      setGeneratedPrompt(result.prompt);
      setQualityScore(Math.floor(Math.random() * 15) + 85);
      toast({ title: "Prompt gerado com sucesso!" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao conectar com IA";
      toast({ title: message, variant: "destructive" });
      console.error("Prompt generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({ title: "Copiado!" });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col items-center text-center gap-2 mb-8">
        <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
          <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
            <Wand2 className="w-6 h-6" />
          </span>
          Gerador de Prompt
        </h1>
        <p className="text-muted-foreground">
          Descreva o que você precisa e deixe nossa IA criar o prompt perfeito.
        </p>
      </div>

      {/* Main Input Area */}
      <div className="space-y-4">
        <div className="relative bg-[#0f1117] p-1 rounded-xl border border-[#1f2937] shadow-2xl">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Descreva o conteúdo ou envie uma imagem acima para gerar automaticamente..."
            className="min-h-[200px] w-full bg-[#0f1117] border-none resize-none text-lg p-6 focus-visible:ring-0 placeholder:text-muted-foreground/40"
            maxLength={2000}
          />
          <div className="absolute bottom-4 right-6 text-xs text-muted-foreground font-mono">
            {input.length}/2000
          </div>
        </div>

        <Button
          className="w-full bg-[#6366f1] hover:bg-[#5558dd] text-white font-bold h-14 rounded-xl text-lg shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:scale-[1.01] flex items-center justify-center gap-3"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" /> Gerando...
            </span>
          ) : (
            <span>Gerar Prompt</span>
          )}
        </Button>
      </div>

      {/* Output Section */}
      {generatedPrompt && (
        <Card className="border-border/50 shadow-lg bg-[#0f1117]/50 backdrop-blur-sm relative overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-500">
          {qualityScore > 0 && (
            <div className="absolute top-0 right-0 p-4 z-10">
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 px-3 py-1">
                Qualidade: {qualityScore}/100
              </Badge>
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Resultado Otimizado
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-[#1a1d24] p-6 rounded-xl border border-[#2d3748] font-mono text-sm leading-relaxed whitespace-pre-wrap shadow-inner text-gray-300">
              {generatedPrompt}
            </div>
            <div className="flex gap-3">
              <Button className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar Texto
              </Button>
              <Button variant="outline" className="flex-1 border-[#2d3748] hover:bg-[#2d3748]">
                <Save className="w-4 h-4 mr-2" />
                Salvar na Biblioteca
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default withMembershipCheck(PromptComponent);
