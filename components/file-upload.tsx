"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Upload, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FileUploadProps {
  onChange: (url?: string) => void;
  endpoint: string;
};

export const FileUpload = ({
  onChange,
  endpoint
}: FileUploadProps) => {
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleMockUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a local object URL to represent the uploaded file,
    // or use a nice default asset depending on the file type.
    const localUrl = URL.createObjectURL(file);
    
    toast.success(`Mock: ${file.name} carregado com sucesso!`);
    onChange(localUrl);
  };

  const handleUrlSubmit = () => {
    if (!urlInput) {
      toast.error("Por favor, digite uma URL válida.");
      return;
    }
    onChange(urlInput);
    toast.success("URL inserida com sucesso!");
  };

  const handlePresetSelect = (presetUrl: string) => {
    onChange(presetUrl);
    toast.success("Conteúdo de demonstração carregado!");
  };

  const isVideo = endpoint === "chapterVideo";

  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-200 rounded-lg p-6 bg-emerald-50/20 hover:bg-emerald-50/40 transition-all gap-y-4">
      <div className="flex flex-col items-center justify-center text-slate-500">
        <Upload className="h-10 w-10 text-emerald-600 mb-2" />
        <p className="text-sm font-semibold text-center">
          Arraste e solte ou clique para selecionar
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {isVideo ? "Vídeo demonstrativo (MP4)" : "Imagem (PNG, JPG) ou PDF"}
        </p>
      </div>

      <div className="flex flex-col w-full gap-y-2 mt-2">
        <label className="w-full flex items-center justify-center px-4 py-2 border border-emerald-600 rounded-md bg-white hover:bg-emerald-50/50 text-emerald-600 text-sm font-medium cursor-pointer transition">
          Selecionar arquivo local
          <input
            type="file"
            className="hidden"
            accept={isVideo ? "video/*" : "image/*,application/pdf"}
            onChange={handleMockUpload}
          />
        </label>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs text-slate-500 hover:text-emerald-600 flex items-center justify-center"
          onClick={() => setShowUrlInput(!showUrlInput)}
        >
          <Link2 className="h-3 w-3 mr-1" />
          {showUrlInput ? "Esconder entrada de URL" : "Usar link de internet / URL"}
        </Button>

        {showUrlInput && (
          <div className="flex items-center gap-x-2 mt-1">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://exemplo.com/arquivo.mp4"
              className="text-xs bg-white"
            />
            <Button
              type="button"
              onClick={handleUrlSubmit}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs shrink-0"
            >
              Confirmar
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-y-1 mt-2">
          <p className="text-[10px] text-slate-400 font-medium text-center">
            Ou use um de nossos conteúdos de demonstração:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {isVideo ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-[10px] h-6 px-2 bg-white"
                  onClick={() => handlePresetSelect("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")}
                >
                  Filme de Animação (Demo)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-[10px] h-6 px-2 bg-white"
                  onClick={() => handlePresetSelect("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4")}
                >
                  Elephants Dream (Demo)
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-[10px] h-6 px-2 bg-white"
                  onClick={() => handlePresetSelect("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800")}
                >
                  Inovação & Gestão
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-[10px] h-6 px-2 bg-white"
                  onClick={() => handlePresetSelect("https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800")}
                >
                  Consultoria Líder
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};