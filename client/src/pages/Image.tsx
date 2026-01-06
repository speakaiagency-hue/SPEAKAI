import React, { useState } from "react";
import { generateImage } from "./services/geminiService";
import { GeneratedImage, AspectRatio } from "./types";

const MagicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="currentColor" fill="none" viewBox="0 0 24 24">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

const App: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [error, setError] = useState<string | null>(null);

  const runMagic = async () => {
    if (!prompt.trim()) {
      setError("Escreva algo para começar.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const resultUrl = await generateImage(prompt, aspectRatio);

      const newImg: GeneratedImage = {
        id: Math.random().toString(36).substring(2, 11),
        url: resultUrl,
        prompt,
        aspectRatio,
        timestamp: new Date(),
      };

      setGallery(prev => [newImg, ...prev]);
      setPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans">
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lado Esquerdo */}
        <div className="lg:col-span-5 space-y-8">
          <header className="space-y-2">
            <div className="flex items-center gap-3 text-indigo-500 mb-2">
              <MagicIcon />
              <span className="text-xs font-black uppercase tracking-[0.3em]">AI Studio Professional</span>
            </div>
            <h1 className="text-4xl font-bold">Gerar Imagens</h1>
            <p className="text-slate-500">Crie artes digitais usando o Gemini 2.5.</p>
          </header>

          <div className="bg-[#0f0f12] border border-white/5 rounded-[2rem] p-6 space-y-6 shadow-2xl">
            {/* Prompt */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Instruções da IA</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descreva o que quer criar..."
                className="w-full bg-black border border-white/5 rounded-2xl p-5 min-h-[150px] outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-lg placeholder:text-slate-800"
              />
            </div>

            {/* Aspect Ratio */}
            <div className="flex gap-1 p-1 bg-black rounded-xl border border-white/5">
              {(["1:1", "16:9", "9:16"] as AspectRatio[]).map(r => (
                <button 
                  key={r}
                  onClick={() => setAspectRatio(r)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${aspectRatio === r ? 'bg-white text-black' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {r}
                </button>
              ))}
            </div>

            {error && <p className="text-xs text-red-500 font-medium animate-pulse">{error}</p>}

            <button
              onClick={runMagic}
              disabled={isGenerating}
              className="w-full h-16 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-black rounded-2xl text-xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-4 active:scale-95"
            >
              {isGenerating ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processando...</span>
                </div>
              ) : (
                <>
                  <span>Gerar Imagem</span>
                  <MagicIcon />
                </>
              )}
            </button>
          </div>
        </div>

               {/* Galeria */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Galeria</h2>
          {gallery.length === 0 ? (
            <div className="h-[600px] border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-slate-800 bg-white/[0.01]">
              <div className="mb-6 opacity-20"><MagicIcon /></div>
              <p className="font-bold">Aguardando sua primeira criação...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 overflow-y-auto max-h-[85vh] pr-2 custom-scrollbar">
              {gallery.map(img => (
                <div
                  key={img.id}
                  className="group relative bg-[#0f0f12] rounded-[2rem] overflow-hidden border border-white/5 hover:border-indigo-500/30 transition-all"
                >
                  <div
                    className={`w-full overflow-hidden ${
                      img.aspectRatio === "1:1"
                        ? "aspect-square"
                        : img.aspectRatio === "16:9"
                        ? "aspect-video"
                        : "aspect-[9/16]"
                    }`}
                  >
                    <img
                      src={img.url}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Overlay de Ações */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                    <a
                      href={img.url}
                      download={`studio-${img.id}.png`}
                      className="p-4 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-2xl"
                    >
                      <MagicIcon />
                    </a>
                  </div>

                  <div className="p-5 flex flex-col gap-1">
                    <p className="text-[10px] text-indigo-500 font-black uppercase">{img.aspectRatio}</p>
                    <p className="text-xs text-slate-400 italic line-clamp-1">"{img.prompt}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 py-4 bg-black/80 backdrop-blur-xl border-t border-white/5 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.8em] text-slate-700">
          Powered by Gemini 2.5 Flash Multimodal Engine
        </p>
      </footer>
    </div>
  );
};

export default App;
