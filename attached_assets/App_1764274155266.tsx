import { Video } from '@google/genai';
import React, { useCallback, useState } from 'react';
import LoadingIndicator from './components/LoadingIndicator';
import PromptForm from './components/PromptForm';
import VideoResult from './components/VideoResult';
import { generateVideo } from './services/geminiService';
import {
  AppState,
  GenerateVideoParams,
  GenerationMode,
  Resolution,
  VideoFile,
} from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastConfig, setLastConfig] = useState<GenerateVideoParams | null>(null);
  const [lastVideoObject, setLastVideoObject] = useState<Video | null>(null);
  const [lastVideoBlob, setLastVideoBlob] = useState<Blob | null>(null);
  const [initialFormValues, setInitialFormValues] =
    useState<GenerateVideoParams | null>(null);

  // Estado para menu mobile
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const showStatusError = (message: string) => {
    setErrorMessage(message);
    setAppState(AppState.ERROR);
  };

  const handleGenerate = useCallback(async (params: GenerateVideoParams) => {
    setAppState(AppState.LOADING);
    setErrorMessage(null);
    setLastConfig(params);
    setInitialFormValues(null);

    try {
      const { objectUrl, blob, video } = await generateVideo(params);
      setVideoUrl(objectUrl);
      setLastVideoBlob(blob);
      setLastVideoObject(video);
      setAppState(AppState.SUCCESS);
    } catch (error) {
      console.error('Video generation failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      let userFriendlyMessage = `Falha na geração do vídeo: ${errorMessage}`;
      if (typeof errorMessage === 'string') {
        if (
          errorMessage.includes('API_KEY_INVALID') ||
          errorMessage.includes('API key not valid') ||
          errorMessage.toLowerCase().includes('permission denied') ||
          errorMessage.includes('Requested entity was not found.')
        ) {
          userFriendlyMessage =
            'Ocorreu um problema de autorização. Verifique a chave de API configurada.';
        }
      }
      setErrorMessage(userFriendlyMessage);
      setAppState(AppState.ERROR);
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (lastConfig) handleGenerate(lastConfig);
  }, [lastConfig, handleGenerate]);

  const handleNewVideo = useCallback(() => {
    setAppState(AppState.IDLE);
    setVideoUrl(null);
    setErrorMessage(null);
    setLastConfig(null);
    setLastVideoObject(null);
    setLastVideoBlob(null);
    setInitialFormValues(null);
  }, []);

  const handleTryAgainFromError = useCallback(() => {
    if (lastConfig) {
      setInitialFormValues(lastConfig);
      setAppState(AppState.IDLE);
      setErrorMessage(null);
    } else {
      handleNewVideo();
    }
  }, [lastConfig, handleNewVideo]);

  const handleExtend = useCallback(async () => {
    if (lastConfig && lastVideoBlob && lastVideoObject) {
      try {
        const file = new File([lastVideoBlob], 'last_video.mp4', {
          type: lastVideoBlob.type,
        });
        const videoFile: VideoFile = { file, base64: '' };
        setInitialFormValues({
          ...lastConfig,
          mode: GenerationMode.EXTEND_VIDEO,
          prompt: '',
          inputVideo: videoFile,
          inputVideoObject: lastVideoObject,
          resolution: Resolution.P720,
          startFrame: null,
          referenceImages: [],
        });
        setAppState(AppState.IDLE);
        setVideoUrl(null);
        setErrorMessage(null);
      } catch (error) {
        console.error('Failed to process video for extension:', error);
        const message =
          error instanceof Error ? error.message : 'An unknown error occurred.';
        showStatusError(`Failed to prepare video for extension: ${message}`);
      }
    }
  }, [lastConfig, lastVideoBlob, lastVideoObject]);

  const renderError = (message: string) => (
    <div className="text-center bg-red-900/20 border border-red-500 p-8 rounded-lg">
      <h2 className="text-2xl font-bold text-red-400 mb-4">Erro</h2>
      <p className="text-red-300">{message}</p>
      <button
        onClick={handleTryAgainFromError}
        className="mt-6 px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Tentar Novamente
      </button>
    </div>
  );

  const renderContent = () => {
    if (appState === AppState.IDLE) {
      return (
        <PromptForm onGenerate={handleGenerate} initialValues={initialFormValues} />
      );
    }
    if (appState === AppState.LOADING) return <LoadingIndicator />;
    if (appState === AppState.SUCCESS && videoUrl) {
      return (
        <VideoResult
          videoUrl={videoUrl}
          onRetry={handleRetry}
          onNewVideo={handleNewVideo}
          onExtend={handleExtend}
          canExtend={lastConfig?.resolution === Resolution.P720}
        />
      );
    }
    if (appState === AppState.SUCCESS && !videoUrl) {
      return renderError(
        'O vídeo foi gerado, mas a URL está ausente. Por favor, tente novamente.'
      );
    }
    if (appState === AppState.ERROR && errorMessage) {
      return renderError(errorMessage);
    }
    return null;
  };

  return (
    <div className="text-slate-200 font-sans">
      {/* Barra de navegação padronizada */}
      <nav className="relative flex items-center justify-between px-4 py-3 md:px-6 md:py-5 border-b border-slate-800 bg-black/50 backdrop-blur-sm z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <img
              src="https://speakia.ai/wp-content/uploads/2025/11/cropped-SPEAK-AI-Proposta-de-Marca-e1763141139366.png"
              alt="Speak AI Logo"
              className="h-8 md:h-9 w-auto object-contain"
            />
          </div>

          {/* Links desktop */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a
              href="https://speakia.ai"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Início
            </a>
            <a
              href="https://chat-speak-ai-516262499372.us-west1.run.app"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Chat
            </a>
            <a
              href="https://prompt-516262499372.us-west1.run.app"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Gerar Prompt
            </a>
            <a
              href="https://gerador-de-imagens-516262499372.us-west1.run.app"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Gerar Imagem
            </a>
            <a
              href="https://alternador-de-veo3-516262499372.us-west1.run.app"
              className="text-white font-medium relative after:content-[''] after:absolute after:-bottom-6 after:left-0 after:w-full after:h-0.5 after:bg-indigo-500 after:rounded-t-full"
            >
              Gerar Vídeo
            </a>
          </div>
        </div>

        {/* Botão hamburguer mobile */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-slate-200 focus:outline-none"
        >
          {isMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                               strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-slate-900 border-b border-slate-800 flex flex-col p-4 gap-4 md:hidden shadow-2xl animate-fadeIn">
            <a
              href="https://speakia.ai"
              className="text-slate-300 hover:text-white py-2 text-lg font-medium border-b border-slate-800/50"
            >
              Início
            </a>
            <a
              href="https://chat-speak-ai-516262499372.us-west1.run.app"
              className="text-slate-300 hover:text-white py-2 text-lg font-medium border-b border-slate-800/50"
            >
              Chat
            </a>
            <a
              href="https://prompt-516262499372.us-west1.run.app"
              className="text-slate-300 hover:text-white py-2 text-lg font-medium border-b border-slate-800/50"
            >
              Gerar Prompt
            </a>
            <a
  href="https://gerador-de-imagens-516262499372.us-west1.run.app"
  className="text-slate-300 hover:text-white py-2 text-lg font-medium border-b border-slate-800/50"
>
  Gerar Imagem
</a>
<a
  href="https://alternador-de-veo3-516262499372.us-west1.run.app"
  className="text-indigo-400 py-2 text-lg font-bold border-b border-slate-800/50 flex items-center gap-2"
>
  Gerar Vídeo
  <span className="ml-2 bg-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full">
    Ativo
  </span>
</a>

          </div>
        )}
      </nav>

      <div className="relative min-h-screen flex items-center justify-center pt-20">
        <main className="w-full max-w-2xl px-4 pb-8">{renderContent()}</main>
      </div>
    </div>
  );
};

export default App;
