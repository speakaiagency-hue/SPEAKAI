import { useState, useRef } from "react";
import { Video, Film, Upload, ArrowRight, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeader } from "@/lib/auth";
import { withMembershipCheck } from "@/components/ProtectedGenerator";

const VIDEO_COST = 40;

function VideoPageComponent() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [creationMode, setCreationMode] = useState("text-to-video");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [resolution, setResolution] = useState("720p");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Video className="w-6 h-6" />
            </span>
            Geração de Vídeo
          </h1>
          <p className="text-muted-foreground">
            Crie vídeos cinematográficos a partir de texto ou imagens.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <Card className="lg:col-span-5 border-border/50 shadow-xl bg-[#0f1117] border-[#1f2937] h-fit overflow-hidden">
          <CardContent className="p-6 space-y-6">
            {/* Modo de Criação */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Modo de Criação
              </Label>
              <Select
                value={creationMode}
                onValueChange={(val) => {
                  setCreationMode(val);
                  setUploadedImage(null);
                  setReferenceImages([]);
                }}
              >
                <SelectTrigger className="w-full bg-[#1a1d24] border-[#2d3748] text-foreground h-12 rounded-lg">
                  <SelectValue placeholder="Selecione o modo" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1d24] border-[#2d3748] text-foreground">
                  <SelectItem value="text-to-video">Texto para Vídeo</SelectItem>
                  <SelectItem value="image-to-video">Imagem para Vídeo</SelectItem>
                  <SelectItem value="reference-to-video">Referências para Vídeo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {creationMode === "text-to-video"
                  ? "Prompt"
                  : creationMode === "image-to-video"
                  ? "Descreva o que deve acontecer no vídeo"
                  : "Descreva o vídeo baseado nas referências"}
              </Label>
              <Textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  creationMode === "text-to-video"
                    ? "Descreva o vídeo que você quer criar..."
                    : creationMode === "image-to-video"
                    ? "Ex: A pessoa começa a sorrir e acenar..."
                    : "Ex: Um vídeo no estilo das referências, com movimento suave..."
                }
                className="h-32 resize-none bg-[#1a1d24] border-[#2d3748] text-foreground rounded-lg focus:ring-indigo-500/50 placeholder:text-muted-foreground/50 p-4"
              />
            </div>

            {/* Formato e Resolução */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Formato
                </Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger className="w-full bg-[#1a1d24] border-[#2d3748] text-foreground h-12 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1d24] border-[#2d3748] text-foreground">
                    <SelectItem value="16:9">Paisagem (16:9)</SelectItem>
                    <SelectItem value="9:16">Retrato (9:16)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Resolução
                </Label>
                <Select value={resolution} onValueChange={setResolution}>
                  <SelectTrigger className="w-full bg-[#1a1d24] border-[#2d3748] text-foreground h-12 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1d24] border-[#2d3748] text-foreground">
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="1080p">1080p</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Botão Gerar */}
            <Button
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold shadow-lg shadow-indigo-500/20 h-14 rounded-lg text-lg mt-4 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3"
              onClick={() => setIsGenerating(true)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Gerando...
                </span>
              ) : (
                <>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-white/20 border border-white/30">
                    {VIDEO_COST} ⚡
                  </span>
                  <span className="flex items-center gap-2">
                    Gerar <ArrowRight className="w-5 h-5" />
                  </span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        {/* Preview Area */}
        <div className="lg:col-span-7 space-y-6">
          <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-border/50 shadow-2xl relative group ring-1 ring-white/10">
            {videoUrl ? (
              <video
                src={videoUrl}
                className="w-full h-full object-cover rounded-lg"
                controls
                autoPlay
                loop
              />
            ) : (
              <div className="text-center p-6 text-muted-foreground">
                {/* Preview vazio */}
                <p>Nenhum vídeo gerado ainda</p>
              </div>
            )}
          </div>

          {/* Botão de Download abaixo do vídeo */}
          {videoUrl && (
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = videoUrl;
                  link.download = "video.mp4";
                  link.click();
                }}
                className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold shadow-md hover:bg-indigo-700"
              >
                Download
              </Button>
            </div>
          )}

        {/* Storyboard Preview */}
<div>
  <Label className="mb-3 block text-muted-foreground font-medium">Frames Gerados</Label>
  <div className="grid grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((frame) => (
      <div
        key={frame}
        className="aspect-video rounded-lg bg-[#1f2937] border border-white/5 flex items-center justify-center group hover:border-indigo-500/50 transition-colors cursor-pointer shadow-sm"
      >
        <span className="text-xs text-muted-foreground group-hover:text-indigo-400">
          Frame {frame}
        </span>
      </div>
    ))}
  </div>
</div>


                  key={frame}
                  className="aspect-video rounded-lg bg-[#1f2937] border border-white/5 flex items-center justify-center group hover:border-indigo-500/50 transition-colors cursor-pointer shadow-sm"
                >
                  <span className="text-xs text-muted-foreground group-hover:text-indigo-400">
                    Frame {frame}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div> {/* fecha lg:col-span-7 */}
      </div>   {/* fecha grid principal */}
    </div>     {/* fecha container geral */}
  );
}

export default withMembershipCheck(VideoPageComponent);
