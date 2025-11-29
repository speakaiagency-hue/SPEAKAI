import { useState } from "react";
import { Image as ImageIcon, Download, Maximize2, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getAuthHeader } from "@/lib/auth";
import { withMembershipCheck } from "@/components/ProtectedGenerator";

const IMAGE_COST = 5;

function ImagePageComponent() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState("16:9");

  // Mock images for demo
  const mockImages = [
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1614728853913-1e221134d341?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  ];

  const handleGenerate = async () => {
    if (!prompt) {
      toast({ title: "Digite um prompt primeiro", variant: "destructive" });
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ prompt, aspectRatio }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.error === "insufficient_credits") {
          throw new Error("Créditos insuficientes. Compre mais para continuar.");
        }
        throw new Error(error.error || "Erro ao gerar imagem");
      }

      const result = await response.json();
      setGeneratedImages([result.imageUrl]);
      toast({ title: "Imagem gerada com sucesso!" });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro inesperado.';
      toast({ title: errorMessage, variant: "destructive" });
      console.error("Image generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col items-center text-center gap-2 mb-8">
        <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
          <span className="p-2 rounded-lg bg-purple-500/10 text-purple-500"><ImageIcon className="w-6 h-6" /></span>
          Geração de Imagem
        </h1>
        <p className="text-muted-foreground">Descreva o que você quer ver e transformaremos em arte.</p>
      </div>

      {/* Main Input Card - Matches Screenshot */}
      <div className="space-y-4">
        <div className="bg-[#0f1117] p-1 rounded-xl border border-[#1f2937] shadow-2xl">
          <Textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Me conta o que você quer ver — eu transformo em imagem pra você rapidinho."
            className="min-h-[240px] w-full bg-[#0f1117] border-none resize-none text-lg p-6 focus-visible:ring-0 placeholder:text-muted-foreground/40"
            maxLength={2000}
          />
          
          <div className="flex items-end justify-between px-6 pb-4">
            {/* Aspect Ratio Selector */}
            <div className="flex items-center gap-2 bg-[#0f1117]">
              {["16:9", "9:16", "1:1"].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-sm font-medium transition-all border",
                    aspectRatio === ratio 
                      ? "bg-[#6366f1] text-white border-[#6366f1]" 
                      : "bg-[#1a1d24] text-gray-400 border-[#2d3748] hover:bg-[#2d3748]"
                  )}
                >
                  {ratio}
                </button>
              ))}
            </div>

            {/* Character Count */}
            <div className="text-xs text-muted-foreground font-mono">
              {prompt.length}/2000
            </div>
          </div>
        </div>

        <Button 
          className="w-full bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-bold h-16 rounded-xl text-xl shadow-lg shadow-purple-900/20 transition-all duration-300 hover:scale-[1.01] flex items-center justify-center gap-3"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin" /> Gerando...
            </span>
          ) : (
            <>
              <span className="text-sm font-semibold px-2 py-1 rounded bg-white/20 border border-white/30">5 ⚡</span>
              <span>Gerar Imagem</span>
            </>
          )}
        </Button>
      </div>

      {/* Gallery Section - Displayed below */}
      {generatedImages.length > 0 && (
        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 mt-12">
          {generatedImages.map((src, i) => (
            <div key={i} className="group relative aspect-video rounded-xl overflow-hidden border border-[#2d3748] shadow-xl bg-[#1a1d24]">
              <img src={src} alt={`Generated ${i}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-sm">
                <Button size="icon" variant="secondary" className="rounded-full h-12 w-12">
                  <Maximize2 className="w-5 h-5" />
                </Button>
                <Button size="icon" variant="secondary" className="rounded-full h-12 w-12">
                  <Download className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default withMembershipCheck(ImagePageComponent);
