/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {
  GoogleGenAI,
  Video,
  VideoGenerationReferenceImage,
  VideoGenerationReferenceType,
} from '@google/genai';
import { GenerateVideoParams, GenerationMode } from '../types';

const API_KEY_ERROR_MESSAGE =
  'A chave de API não foi encontrada no ambiente. Configure a variável de ambiente `VITE_AI_STUDIO_API_KEY` nas configurações da sua plataforma de hospedagem.';

export const generateVideo = async (
  params: GenerateVideoParams,
): Promise<{ objectUrl: string; blob: Blob; uri: string; video: Video }> => {
  // Verifica se a chave está presente
  if (!import.meta.env.VITE_AI_STUDIO_API_KEY) {
    throw new Error(API_KEY_ERROR_MESSAGE);
  }

  console.log('Starting video generation with params:', params);

  // Usa a chave correta do ambiente Vite
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_AI_STUDIO_API_KEY });

  const config: any = {
    numberOfVideos: 1,
    resolution: params.resolution,
    aspectRatio: params.aspectRatio,
  };

  const generateVideoPayload: any = {
    model: params.model,
    config: config,
  };

  if (params.prompt) {
    generateVideoPayload.prompt = params.prompt;
  }

  if (params.mode === GenerationMode.IMAGE_TO_VIDEO) {
    if (params.startFrame) {
      generateVideoPayload.image = {
        imageBytes: params.startFrame.base64,
        mimeType: params.startFrame.file.type,
      };
      console.log(`Generating with start frame: ${params.startFrame.file.name}`);
    }
  } else if (params.mode === GenerationMode.REFERENCES_TO_VIDEO) {
    const referenceImagesPayload: VideoGenerationReferenceImage[] = [];

    if (params.referenceImages) {
      for (const img of params.referenceImages) {
        console.log(`Adding reference image: ${img.file.name}`);
        referenceImagesPayload.push({
          image: {
            imageBytes: img.base64,
            mimeType: img.file.type,
          },
          referenceType: VideoGenerationReferenceType.ASSET,
        });
      }
    }

    if (referenceImagesPayload.length > 0) {
      generateVideoPayload.config.referenceImages = referenceImagesPayload;
    }
  } else if (params.mode === GenerationMode.EXTEND_VIDEO) {
    if (params.inputVideoObject) {
      generateVideoPayload.video = params.inputVideoObject;
      console.log(`Generating extension from input video object.`);
    } else {
      throw new Error('Um vídeo de entrada é necessário para estender.');
    }
  }

  console.log('Submitting video generation request...', generateVideoPayload);
  let operation = await ai.models.generateVideos(generateVideoPayload);
  console.log('Video generation operation started:', operation);

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    console.log('...Generating...');
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  if (operation?.response) {
    const videos = operation.response.generatedVideos;

    if (!videos || videos.length === 0) {
      if (operation.error?.message) {
        throw new Error(operation.error.message);
      }
      throw new Error(
        'A geração do vídeo não produziu um resultado. Isso geralmente acontece quando o conteúdo (prompt ou imagem) aciona os filtros de segurança da IA. Tente usar um prompt diferente ou uma imagem alternativa.',
      );
    }

    const firstVideo = videos[0];
    if (!firstVideo?.video?.uri) {
      throw new Error('O vídeo gerado não possui URI.');
    }
    const videoObject = firstVideo.video;

    let uriToParse = videoObject.uri;
    try {
      uriToParse = decodeURIComponent(videoObject.uri);
    } catch (e) {
      console.warn('Could not decode video URI, proceeding with original.', e);
    }

    const url = new URL(uriToParse);
    url.searchParams.set('key', import.meta.env.VITE_AI_STUDIO_API_KEY as string);
    const finalUrl = url.toString();

    console.log('Fetching video from:', finalUrl);

    const res = await fetch(finalUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch video: ${res.status} ${res.statusText}`);
    }

    const videoBlob = await res.blob();
    const objectUrl = URL.createObjectURL(videoBlob);

    return { objectUrl, blob: videoBlob, uri: finalUrl, video: videoObject };
  } else {
    console.error('Operation failed:', operation);
    if (operation.error?.message) {
      throw new Error(operation.error.message);
    }
    throw new Error('Nenhum vídeo foi gerado.');
  }
};
