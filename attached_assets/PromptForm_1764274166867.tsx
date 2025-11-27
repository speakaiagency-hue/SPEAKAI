/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {Video} from '@google/genai';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  AspectRatio,
  GenerateVideoParams,
  GenerationMode,
  ImageFile,
  Resolution,
  VeoModel,
} from '../types';
import {
  ArrowRightIcon,
  ChevronDownIcon,
  FilmIcon,
  ImageModeIcon,
  PlusIcon,
  RectangleStackIcon,
  ReferencesModeIcon,
  TextModeIcon,
  TvIcon,
  UploadIcon,
  XMarkIcon,
} from './icons';

const aspectRatioDisplayNames: Record<AspectRatio, string> = {
  [AspectRatio.LANDSCAPE]: 'Paisagem (16:9)',
  [AspectRatio.PORTRAIT]: 'Retrato (9:16)',
};

const modeIcons: Record<GenerationMode, React.ReactNode> = {
  [GenerationMode.TEXT_TO_VIDEO]: <TextModeIcon className="w-5 h-5" />,
  [GenerationMode.IMAGE_TO_VIDEO]: <ImageModeIcon className="w-5 h-5" />,
  [GenerationMode.REFERENCES_TO_VIDEO]: (
    <ReferencesModeIcon className="w-5 h-5" />
  ),
  [GenerationMode.EXTEND_VIDEO]: <FilmIcon className="w-5 h-5" />,
};

const fileToBase64 = <T extends {file: File; base64: string}>(
  file: File,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      if (base64) {
        resolve({file, base64} as T);
      } else {
        reject(new Error('Failed to read file as base64.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
const fileToImageFile = (file: File): Promise<ImageFile> =>
  fileToBase64<ImageFile>(file);

const CustomSelect: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({label, value, onChange, icon, children, disabled = false}) => (
  <div>
    <label
      className={`text-xs block mb-1.5 font-medium ${
        disabled ? 'text-slate-500' : 'text-slate-400'
      }`}>
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {icon}
        </div>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-lg pr-8 py-2.5 appearance-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-900 disabled:border-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed ${
          icon ? 'pl-10' : 'pl-4'
        }`}>
        {children}
      </select>
      <ChevronDownIcon
        className={`w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
          disabled ? 'text-slate-500' : 'text-slate-400'
        }`}
      />
    </div>
  </div>
);

const ImageUpload: React.FC<{
  onSelect: (image: ImageFile) => void;
  onRemove?: () => void;
  image?: ImageFile | null;
  label: React.ReactNode;
}> = ({onSelect, onRemove, image, label}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imageFile = await fileToImageFile(file);
        onSelect(imageFile);
      } catch (error) {
        console.error('Error converting file:', error);
      }
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  if (image) {
    return (
      <div className="relative w-28 h-20 group">
        <img
          src={URL.createObjectURL(image.file)}
          alt="preview"
          className="w-full h-full object-cover rounded-lg"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove image">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="w-28 h-20 bg-slate-950/50 hover:bg-slate-950/80 border-2 border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-slate-200 transition-colors">
      <PlusIcon className="w-6 h-6" />
      <span className="text-xs mt-1">{label}</span>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </button>
  );
};

const LargeImageUpload: React.FC<{
  onSelect: (image: ImageFile) => void;
  onRemove?: () => void;
  image?: ImageFile | null;
  label: React.ReactNode;
  subLabel: React.ReactNode;
}> = ({onSelect, onRemove, image, label, subLabel}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imageFile = await fileToImageFile(file);
        onSelect(imageFile);
      } catch (error) {
        console.error('Error converting file:', error);
      }
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  if (image) {
    return (
      <div className="relative w-full h-64 group">
        <img
          src={URL.createObjectURL(image.file)}
          alt="preview"
          className="w-full h-full object-contain rounded-lg bg-slate-950/50"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white"
          aria-label="Remover imagem">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="w-full h-64 bg-transparent hover:bg-slate-950/50 border-2 border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-slate-200 transition-colors p-4 text-center">
      <UploadIcon className="w-10 h-10 mb-4 text-slate-500" />
      <span className="text-lg font-semibold">{label}</span>
      <span className="text-sm text-slate-500">{subLabel}</span>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </button>
  );
};

interface PromptFormProps {
  onGenerate: (params: GenerateVideoParams) => void;
  initialValues?: GenerateVideoParams | null;
}

const PromptForm: React.FC<PromptFormProps> = ({
  onGenerate,
  initialValues,
}) => {
  const [prompt, setPrompt] = useState(initialValues?.prompt ?? '');
  const [model] = useState<VeoModel>(VeoModel.VEO);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
    initialValues?.aspectRatio ?? AspectRatio.LANDSCAPE,
  );
  const [resolution, setResolution] = useState<Resolution>(
    initialValues?.resolution ?? Resolution.P720,
  );
  const [generationMode, setGenerationMode] = useState<GenerationMode>(
    initialValues?.mode ?? GenerationMode.TEXT_TO_VIDEO,
  );
  const [startFrame, setStartFrame] = useState<ImageFile | null>(
    initialValues?.startFrame ?? null,
  );
  const [referenceImages, setReferenceImages] = useState<ImageFile[]>(
    initialValues?.referenceImages ?? [],
  );
  const [inputVideoObject, setInputVideoObject] = useState<Video | null>(
    initialValues?.inputVideoObject ?? null,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialValues) {
      setPrompt(initialValues.prompt ?? '');
      setAspectRatio(initialValues.aspectRatio ?? AspectRatio.LANDSCAPE);
      setResolution(initialValues.resolution ?? Resolution.P720);
      setGenerationMode(initialValues.mode ?? GenerationMode.TEXT_TO_VIDEO);
      setStartFrame(initialValues.startFrame ?? null);
      setReferenceImages(initialValues.referenceImages ?? []);
      setInputVideoObject(initialValues.inputVideoObject ?? null);
    }
  }, [initialValues]);

  useEffect(() => {
    if (generationMode === GenerationMode.REFERENCES_TO_VIDEO) {
      setAspectRatio(AspectRatio.LANDSCAPE);
      setResolution(Resolution.P720);
    } else if (generationMode === GenerationMode.EXTEND_VIDEO) {
      setResolution(Resolution.P720);
    }
  }, [generationMode]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 200;
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [prompt]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onGenerate({
        prompt,
        model,
        aspectRatio,
        resolution,
        mode: generationMode,
        startFrame,
        referenceImages,
        inputVideoObject,
      });
    },
    [
      prompt,
      model,
      aspectRatio,
      resolution,
      generationMode,
      startFrame,
      referenceImages,
      inputVideoObject,
      onGenerate,
    ],
  );

  const handleSelectMode = (mode: GenerationMode) => {
    setGenerationMode(mode);
    setStartFrame(null);
    setReferenceImages([]);
    setInputVideoObject(null);
  };

  const promptPlaceholder = {
    [GenerationMode.TEXT_TO_VIDEO]: 'Descreva o vídeo que você quer criar...',
    [GenerationMode.IMAGE_TO_VIDEO]:
      'Descreva o movimento que você quer ver...',
    [GenerationMode.REFERENCES_TO_VIDEO]:
      'Descreva um vídeo usando as imagens de referência...',
    [GenerationMode.EXTEND_VIDEO]: 'Descreva o que acontece em seguida...',
  }[generationMode];

  const selectableModes = [
    GenerationMode.TEXT_TO_VIDEO,
    GenerationMode.IMAGE_TO_VIDEO,
    GenerationMode.REFERENCES_TO_VIDEO,
  ];

  const renderMediaUploads = () => {
    if (generationMode === GenerationMode.IMAGE_TO_VIDEO) {
      return (
        <div className="mb-2">
          <LargeImageUpload
            label="Enviar Imagem"
            subLabel="Toque para selecionar"
            image={startFrame}
            onSelect={setStartFrame}
            onRemove={() => setStartFrame(null)}
          />
        </div>
      );
    }
    if (generationMode === GenerationMode.REFERENCES_TO_VIDEO) {
      return (
        <div className="mb-3 p-4 bg-slate-950/50 rounded-xl border border-slate-800 flex flex-wrap items-center justify-center gap-2">
          {referenceImages.map((img, index) => (
            <ImageUpload
              key={index}
              image={img}
              label=""
              onSelect={() => {}}
              onRemove={() =>
                setReferenceImages((imgs) => imgs.filter((_, i) => i !== index))
              }
            />
          ))}
          {referenceImages.length < 3 && (
            <ImageUpload
              label="Adicionar Referência"
              onSelect={(img) => setReferenceImages((imgs) => [...imgs, img])}
            />
          )}
        </div>
      );
    }
    return null;
  };

  const isRefMode = generationMode === GenerationMode.REFERENCES_TO_VIDEO;
  const isExtendMode = generationMode === GenerationMode.EXTEND_VIDEO;

  let isSubmitDisabled = false;
  let tooltipText = '';

  switch (generationMode) {
    case GenerationMode.TEXT_TO_VIDEO:
      isSubmitDisabled = !prompt.trim();
      if (isSubmitDisabled) tooltipText = 'Por favor, insira um prompt.';
      break;
    case GenerationMode.IMAGE_TO_VIDEO:
      isSubmitDisabled = !startFrame;
      if (isSubmitDisabled) tooltipText = 'Uma imagem inicial é necessária.';
      break;
    case GenerationMode.REFERENCES_TO_VIDEO:
      isSubmitDisabled =
        referenceImages.length === 0 || !prompt.trim();
      if (isSubmitDisabled) {
        if (referenceImages.length === 0 && !prompt.trim()) {
          tooltipText =
            'Adicione imagens de referência e insira um prompt.';
        } else if (referenceImages.length === 0) {
          tooltipText = 'Pelo menos uma imagem de referência é necessária.';
        } else {
          tooltipText = 'Por favor, insira um prompt.';
        }
      }
      break;
    case GenerationMode.EXTEND_VIDEO:
      isSubmitDisabled = !inputVideoObject || !prompt.trim();
      if (isSubmitDisabled) {
        if (!inputVideoObject) {
          tooltipText =
            'Um vídeo de uma geração anterior é necessário para estender.';
        } else {
          tooltipText = 'Por favor, insira um prompt para estender o vídeo.';
        }
      }
      break;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col gap-4">
      <CustomSelect
        label="MODO DE CRIAÇÃO"
        value={generationMode}
        onChange={(e) => handleSelectMode(e.target.value as GenerationMode)}>
        {selectableModes.map((mode) => (
          <option key={mode} value={mode}>
            {mode}
          </option>
        ))}
      </CustomSelect>

      {renderMediaUploads()}

      <div>
        <label
          htmlFor="prompt-textarea"
          className="text-xs block mb-1.5 font-medium text-slate-400">
          PROMPT
        </label>
        <textarea
          id="prompt-textarea"
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={promptPlaceholder}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 resize-none text-base text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[6rem]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomSelect
          label="FORMATO"
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
          disabled={isRefMode || isExtendMode}>
          {Object.entries(aspectRatioDisplayNames).map(([key, name]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </CustomSelect>
        <CustomSelect
          label="RESOLUÇÃO"
          value={resolution}
          onChange={(e) => setResolution(e.target.value as Resolution)}
          disabled={isRefMode || isExtendMode}>
          <option value={Resolution.P720}>720p</option>
          <option value={Resolution.P1080}>1080p</option>
        </CustomSelect>
      </div>

      <div className="relative group mt-2">
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold text-lg transition-all duration-200"
          aria-label="Gerar vídeo"
          disabled={isSubmitDisabled}>
          Gerar <ArrowRightIcon className="w-5 h-5" />
        </button>
        {isSubmitDisabled && tooltipText && (
          <div
            role="tooltip"
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-black border border-slate-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {tooltipText}
          </div>
        )}
      </div>
    </form>
  );
};

export default PromptForm;
