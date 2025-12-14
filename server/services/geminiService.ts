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
      config: config,
      prompt: params.prompt,
    };

    if (params.mode === "image-to-video" && params.imageBase64) {
      generateVideoPayload.image = {
        imageBytes: params.imageBase64,
        mimeType: params.imageMimeType || "image/jpeg",
      };
    } else if (
      params.mode === "reference-to-video" &&
      params.referenceImages?.length
    ) {
      const referenceImagesPayload: any[] = [];

      for (const img of params.referenceImages) {
        referenceImagesPayload.push({
          image: {
            imageBytes: img.base64,
            mimeType: img.mimeType || "image/jpeg",
          },
          referenceType: VideoGenerationReferenceType.ASSET,
        });
      }

      if (referenceImagesPayload.length > 0) {
        generateVideoPayload.config.referenceImages = referenceImagesPayload;
      }
    }

    console.log("Submitting video generation request...");
    let operation = await ai.models.generateVideos(generateVideoPayload);

    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      console.log("Generating video...");
      operation = await ai.operations.getVideosOperation({ operation });
    }

    if (operation?.response) {
      const videos = operation.response.generatedVideos;

      if (!videos || videos.length === 0) {
        if (operation.error) {
          throw new Error(typeof operation.error === 'string' ? operation.error : JSON.stringify(operation.error));
        }
        throw new Error("Nenhum vídeo foi gerado");
      }

      const firstVideo = videos[0];
      if (!firstVideo?.video?.uri) {
        throw new Error("O vídeo gerado não possui URI");
      }

      let uriToParse = firstVideo.video.uri;
      try {
        uriToParse = decodeURIComponent(firstVideo.video.uri);
      } catch (e) {
        console.warn("Could not decode video URI");
      }

      const url = new URL(uriToParse);
      url.searchParams.set("key", apiKey);
      const finalUrl = url.toString();

      return {
        videoUrl: finalUrl,
        uri: finalUrl,
      };
    } else {
      if (operation.error) {
        throw new Error(typeof operation.error === 'string' ? operation.error : JSON.stringify(operation.error));
      }
      throw new Error("Nenhum vídeo foi gerado");
    }
  });
}
