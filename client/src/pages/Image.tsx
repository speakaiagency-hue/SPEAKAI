import { useState } from "react";
import { Image as ImageIcon, Download, Maximize2, RefreshCw, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getAuthHeader } from "@/lib/auth";
import { withMembershipCheck } from "@/components/ProtectedGenerator";

const IMAGE_COST = 7;

function ImagePageComponent() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // modos e upload
  const [creationMode, setCreationMode] = useState<"text-to-image" | "image-to-image">("text-to-image");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageData, setUploadedImageData] = useState<{ base64: string; mimeType: string } | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setUploadedImage(URL.createObjectURL(file));
      setUploadedImageData({ base64, mimeType: file.type });
      toast({ title: "Imagem carregada com sucesso!" });
    } catch {
      toast({ title: "Erro ao carregar imagem", variant: "destructive" });
    }
  };

  const handleGenerate = async () => {
    if (creationMode === "text-to-image" && !prompt.trim()) {
      toast({ title: "Digite um prompt primeiro", variant: "destructive" });
      return;
    }
    if (creationMode === "image-to-image" && !uploadedImageData) {
      toast({ title: "Envie uma imagem", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const payload: any = { prompt, aspectRatio, mode: creationMode };
      if (creationMode === "image-to-image" && uploadedImageData) {
        payload.imageBase64 = uploadedImageData.base64;
        payload.imageMimeType = uploadedImageData.mimeType;
      }

      const response = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.error === "insufficient_credits") {
          throw new Error("Créditos insuficientes. Compre mais para continuar.");
        }
        throw new Error(error.error || "Erro ao gerar imagem");
      }

      const result = await response.json();

      if (Array.isArray(result.images)) {
        setGeneratedImages(result.images);
      } else if (result.imageUrl) {
        setGeneratedImages([result.imageUrl]);
      } else if (result.url) {
        setGeneratedImages([result.url]);
      } else {
        throw new Error("Resposta da API não contém URL da imagem.");
      }

      toast({ title: "Imagem gerada com sucesso!" });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro inesperado.";
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
          <span className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
            <ImageIcon className="w-6 h-6" />
          </span>
          Geração de Imagem
        </h1>
        <p className="text-muted-foreground">
          Crie imagens a partir de texto ou use uma foto como base para variações.
        </p>
      </div>

      {/* Modo de criação */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Modo de Criação</label>
        <select
          value={creationMode}
          onChange={(e) => setCreationMode(e.target.value as "text-to-image" | "image-to-image")}
          className="bg-[#1a1d24] border-[#2d3748] text-foreground h-12 rounded-lg px-3"
        >
          <option value="text-to-image">Texto para Imagem</option>
          <option value="image-to-image">Imagem para Imagem</option>
        </select>
      </div>

      {/* Upload se for image-to-image */}
      {creationMode === "image-to-image" && (
        <div className="border-2 border-dashed border-[#2d3748] rounded-lg p-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <Upload className="w-5 h-5 text-gray-400" />
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
          {uploadedImage && (
            <img src={uploadedImage} alt="Upload" className="mt-4 rounded-lg max-h-64 w-full object-contain" />
          )}
        </div>
      )}

      {/* Prompt + Aspect ratio + Botão */}
      <div className="space-y-4">
        <div className="bg-[#0f1117] p-1 rounded-xl border border-[#1f2937] shadow-2xl">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              creationMode === "text-to-image"
                ? "Descreva o que você quer ver..."
                : "Opcional: descreva como alterar a imagem enviada (ex.: estilo anime, mudar fundo, cores)"
            }
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
            <div className="text-xs text-muted-foreground font-mono">{prompt.length}/2000</div>
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
              <span className="text-sm font-semibold px-2 py-1 rounded bg-white/20 border border-white/30">
                {IMAGE_COST} ⚡
              </span>
              <span>Gerar Imagem</span>
            </>
          )}
        </Button>
      </div>

      {/* Gallery */}
      {generatedImages.length > 0 && (
        <div className="space-y-6 mt-12">
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {generatedImages.map((src, i) => (
              <div
                key={i}
                className="group relative aspect-video rounded-xl overflow-hidden border border-[#2d3748] shadow-xl bg-[#1a1d24]"
              >
                <img
                  src={src}
                  alt={`Generated ${i}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-sm">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full h-12 w-12"
                    onClick={() => setSelectedImage(src)}
                  >
                    <Maximize2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Download buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            {generatedImages.map((src, i) => (
              <a key={i} href={src} download={`imagem-${i}.png`}>
                <Button size="sm" variant="secondary" className="flex items-center gap-2 px-4 py-2 rounded-lg">
                  <Download className="w-4 h-4" /> Baixar imagem {i + 1}
                </Button>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Modal fullscreen */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <img src={selectedImage} alt="Fullscreen" className="max-w-full max-h-full rounded-lg shadow-2xl" />
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}

export default withMembershipCheck(ImagePageComponent);
