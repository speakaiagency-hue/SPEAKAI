import React, { useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Download,
  RefreshCw,
  UploadCloud,
  X
} from "lucide-react";
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
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setGeneratedImages([]);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  };

  const fileToBase64 = (f: File): Promise<{ base64: string; mimeType: string }> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(",")[1];
        resolve({ base64, mimeType: f.type });
      };
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const handleGenerate = async () => {
    if (!prompt && !file) {
      toast({ title: "Digite um prompt ou envie uma imagem", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      let imageBase64: string | undefined;
      let imageMimeType: string | undefined;

      if (file) {
        const { base64, mimeType } = await fileToBase64(file);
        imageBase64 = base64;
        imageMimeType = mimeType;
      }

      const response = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ prompt, aspectRatio, imageBase64, imageMimeType }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === "insufficient_credits") {
          throw new Error("Créditos insuficientes. Compre mais para continuar.");
        }
        throw new Error(result.error || "Erro ao gerar imagem");
      }

      if (Array.isArray(result.images)) {
        setGeneratedImages(result.images);
      } else if (result.imageUrl) {
        setGeneratedImages([result.imageUrl]);
      } else if (result.url) {
        setGeneratedImages([result.url]);
      } else {
        throw new Error("Resposta da API não contém URL da imagem.");
      }

      toast({ title: "Imagem processada com sucesso!" });
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
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-2 mb-8">
        <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
          <span className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
            <ImageIcon className="w-6 h-6" />
          </span>
          Geração de Imagem
        </h1>
        <p className="text-muted-foreground">
          Descreva o que você quer ver ou envie uma imagem para editar.
        </p>
      </div>

      <div className="space-y-4">
        {/* Prompt + Aspect ratio */}
        <div className="bg-[#0f1117] p-1 rounded-xl border border-[#1f2937] shadow-2xl">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Me conta o que você quer ver — ou descreva a edição que deseja."
            className="min-h-[160px] w-full bg-[#0f1117] border-none resize-none text-lg p-6 focus-visible:ring-0 placeholder:text-muted-foreground/40"
            maxLength={2000}
          />

          <div className="flex items-end justify-between px-6 pb-4">
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

            <div className="text-xs text-muted-foreground font-mono">
              {prompt.length}/2000
            </div>
          </div>
        </div>

        {/* Upload estilizado */}
        <div className="bg-[#0f1117] p-4 rounded-xl border border-dashed border-[#2d3748] shadow-2xl">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center gap-2 cursor-pointer py-10 rounded-xl transition hover:bg-[#1a1d24]"
          >
            <UploadCloud className="w-10 h-10 text-purple-500" />
            <span className="text-sm text-gray-400">Clique para enviar uma imagem</span>
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
          {file && (
            <div className="mt-2 text-sm text-gray-300 truncate">
              Arquivo selecionado: {file.name}
            </div>
          )}
          {previewUrl && (
            <div className="mt-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-64 rounded-lg border border-gray-700 object-contain"
              />
            </div>
          )}
        </div>

        {/* Action */}
        <Button
          className="w-full bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-bold h-16 rounded-xl text-xl shadow-lg shadow-purple-900/20 transition-all duration-300 hover:scale-[1.01] flex items-center justify-center gap-3"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin" /> Processando...
            </span>
          ) : (
            <>
              <span className="text-sm font-semibold px-2 py-1 rounded bg-white/20 border border-white/30">
                {IMAGE_COST} ⚡
              </span>
              <span>{file ? "Aplicar mudanças" : "Gerar Imagem"}</span>
            </>
          )}
        </Button>
      </div>

      {/* Gallery + downloads fora da imagem */}
      {generatedImages.length > 0 && (
        <div className="space-y-6 mt-12">
          <div className="grid grid-cols-2 gap-4">
            {generatedImages.map((src, i) => (
              <div
                key={i}
                className="group relative aspect-video rounded-xl overflow-hidden border border-[#2d3748] shadow-xl bg-[#1a1d24] cursor-pointer"
                onClick={() => setFullscreenImage(src)}
                title="Clique para ampliar"
              >
                <img
                  src={src}
                  alt={`Generated ${i}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            ))}
          </div>

          {/* Botões de download fora das imagens */}
          <div className="flex flex-wrap gap-3">
            {generatedImages.map((src, i) => (
              <a key={i} href={src} download={`imagem-${i}.png`}>
                <Button variant="secondary" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Baixar imagem {i + 1}
                </Button>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Modal fullscreen */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full">
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute -top-3 -right-3 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 border border-white/20 transition"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={fullscreenImage}
              alt="Imagem ampliada"
              className="w-full h-auto rounded-xl border border-gray-700 object-contain max-h-[85vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default withMembershipCheck(ImagePageComponent);
