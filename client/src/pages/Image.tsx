import React, { useState } from "react";

export default function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  // Converte imagem para Base64
  const convertToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1]; // remove prefix data:
        resolve({ base64, mimeType: file.type });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleGenerate = async () => {
    try {
      let imageBase64: string | undefined;
      let imageMimeType: string | undefined;

      if (selectedImage) {
        const converted = await convertToBase64(selectedImage);
        imageBase64 = converted.base64;
        imageMimeType = converted.mimeType;
      }

      const response = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          imageBase64,
          imageMimeType,
        }),
      });

      const data = await response.json();
      if (data.imageUrl) {
        setResultImage(data.imageUrl);
      } else {
        alert(data.error || "Erro ao gerar imagem");
      }
    } catch (err) {
      console.error("Erro:", err);
      alert("Erro inesperado ao gerar imagem");
    }
  };

  return (
    <div>
      <h1>Gerador de Imagem</h1>
      <textarea
        placeholder="Digite sua descrição..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
        <option value="1:1">Quadrado (1:1)</option>
        <option value="16:9">Paisagem (16:9)</option>
        <option value="9:16">Retrato (9:16)</option>
      </select>

      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {preview && <img src={preview} alt="Preview" style={{ maxWidth: "200px" }} />}

      <button onClick={handleGenerate}>
        {selectedImage ? "Aplicar Mudanças" : "Gerar Imagem"}
      </button>

      {resultImage && (
        <div>
          <h2>Resultado:</h2>
          <img src={resultImage} alt="Resultado" style={{ maxWidth: "400px" }} />
        </div>
      )}
    </div>
  );
}
