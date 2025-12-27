import React, { useState, useEffect } from "react";

export default function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Limpa URL de preview ao trocar imagem
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setResultImage(null);
    setErrorMsg(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  };

  const fileToBase64 = (f: File): Promise<{ base64: string; mimeType: string }> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(",")[1]; // remove prefixo
        resolve({ base64, mimeType: f.type });
      };
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg(null);
    setResultImage(null);

    try {
      let imageBase64: string | undefined;
      let imageMimeType: string | undefined;

      if (file) {
        const { base64, mimeType } = await fileToBase64(file);
        imageBase64 = base64;
        imageMimeType = mimeType;
      }

      const res = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio, imageBase64, imageMimeType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Falha ao gerar imagem");
        return;
      }

      if (data.imageUrl) {
        setResultImage(data.imageUrl);
      } else {
        setErrorMsg("A resposta não continha uma imagem");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>Gerar ou editar imagem</h1>

      <label>Descrição</label>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Digite sua instrução..."
        rows={4}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <label>Proporção</label>
      <select
        value={aspectRatio}
        onChange={(e) => setAspectRatio(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
      >
        <option value="1:1">1:1 (quadrado)</option>
        <option value="16:9">16:9 (paisagem)</option>
        <option value="9:16">9:16 (retrato)</option>
      </select>

      <label>Upload de imagem (opcional)</label>
      <input type="file" accept="image/*" onChange={onFileChange} />
      {previewUrl && (
        <div style={{ margin: "12px 0" }}>
          <img src={previewUrl} alt="Preview" style={{ maxWidth: "100%", borderRadius: 8 }} />
        </div>
      )}

      <button onClick={handleGenerate} disabled={loading} style={{ marginTop: 12 }}>
        {loading ? "Processando..." : file ? "Aplicar mudanças" : "Gerar imagem"}
      </button>

      {errorMsg && (
        <div style={{ marginTop: 12, color: "#c00" }}>
          {errorMsg}
        </div>
      )}

      {resultImage && (
        <div style={{ marginTop: 16 }}>
          <h2>Resultado</h2>
          <img src={resultImage} alt="Resultado" style={{ maxWidth: "100%", borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
}
