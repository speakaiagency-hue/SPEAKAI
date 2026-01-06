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
      {/* ... resto do JSX igual ao que você já tinha ... */}
    </div>
  );
}

export default withMembershipCheck(ImagePageComponent);
