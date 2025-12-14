import { GoogleGenAI, VideoGenerationReferenceType } from "@google/genai";
import { getGeminiKeyRotator } from "../utils/apiKeyRotator";

export interface GenerateVideoParams {
  prompt: string;
  mode: "text-to-video" | "image-to-video" | "reference-to-video";
  aspectRatio?: "16:9" | "9:16";
  resolution?: "720p" | "1080p";
  imageBase64?: string;
  imageMimeType?: string;
  referenceImages?: Array<{ base64: string; mimeType: string }>;
}

export async function generateVideo(params: GenerateVideoParams) {
  const rotator = getGeminiKeyRotator();

  return await rotator.executeWithRotation(async (apiKey) => {
    const ai = new GoogleGenAI({ apiKey });

    const config: any = {
      numberOfVideos: 1,
      resolution: params.resolution || "720p",
      aspectRatio: params.aspectRatio || "16:9",
    };

    const generateVideoPayload: any = {
      model: "veo-3.1-generate-preview",
      config,
      prompt: params.prompt,
    };

    if (params.mode === "image-to-video" && params.imageBase64) {
      generateVideoPayload.image = {
        imageBytes: params.imageBase64,
        mimeType: params.imageMimeType || "image/jpeg",
      };
    } else if (params.mode === "reference-to-video" && params.referenceImages?.length) {
      const referenceImagesPayload: any[] = params.referenceImages.map((img) => ({
        image: {
          imageBytes: img.base64,
          mimeType: img.mimeType || "image/jpeg",
        },
        referenceType: VideoGenerationReferenceType.ASSET,
      }));

      if (referenceImagesPayload.length > 0) {
        generateVideoPayload.config.referenceImages = referenceImagesPayload;
      }
    }

    console.log("📤 Payload enviado para Gemini:", JSON.stringify(generateVideoPayload, null, 2));

    let operation;
    try {
      operation = await ai.models.generateVideos(generateVideoPayload);
    } catch (err) {
      console.error("❌ Erro inicial ao chamar generateVideos:", err);
      return { videoUrl: "https://dummy.video/fallback.mp4", error: "Falha ao iniciar geração" };
    }

    let attempts = 0;
    while (!operation.done && attempts < 2) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      console.log(`⏳ Tentativa ${attempts + 1}: aguardando vídeo...`);
      try {
        operation = await ai.operations.getVideosOperation({ operation });
      } catch (err) {
        console.error("❌ Erro ao consultar operação:", err);
        break;
      }
      attempts++;
    }

    if (!operation.done) {
      console.error("⚠️ Timeout: vídeo não finalizou em tempo hábil");
      return { videoUrl: "https://dummy.video/fallback.mp4", error: "Timeout na geração" };
    }

    if (operation?.response) {
      const videos = operation.response.generatedVideos;

      if (!videos || videos.length === 0) {
        console.error("⚠️ Nenhum vídeo gerado:", operation);
        return { videoUrl: "https://dummy.video/fallback.mp4", error: "Nenhum vídeo gerado" };
      }

      const firstVideo = videos[0];
      if (!firstVideo?.video?.uri) {
        console.error("⚠️ Vídeo sem URI:", firstVideo);
        return { videoUrl: "https://dummy.video/fallback.mp4", error: "Vídeo sem URI" };
      }

      let uriToParse = firstVideo.video.uri;
      try {
        uriToParse = decodeURIComponent(firstVideo.video.uri);
      } catch {
        console.warn("⚠️ Não foi possível decodificar URI");
      }

      const url = new URL(uriToParse);
      url.searchParams.set("key", apiKey);
      const finalUrl = url.toString();

      return {
        videoUrl: finalUrl,
        uri: finalUrl,
      };
    } else {
      console.error("❌ Erro na resposta da operação:", operation.error || operation);
      return { videoUrl: "https://dummy.video/fallback.mp4", error: "Erro na resposta da operação" };
    }
  });
}
