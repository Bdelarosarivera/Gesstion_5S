import React, { useState, useRef } from 'react';
import { editImageWithGemini } from '../services/geminiService';
import { Upload, Wand2, RefreshCw, Download, Image as ImageIcon } from 'lucide-react';

export const AIEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setGeneratedImage(null); // Reset previous generation
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!originalImage || !prompt.trim()) return;

    setIsLoading(true);
    try {
      const result = await editImageWithGemini(originalImage, prompt);
      setGeneratedImage(result);
    } catch (error) {
      alert("Error al procesar la imagen. Intenta con un prompt diferente o verifica tu API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto mb-20">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <div className="bg-purple-100 p-2 rounded-lg">
          <Wand2 className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Editor de Evidencia con IA</h2>
          <p className="text-sm text-gray-500">Sube una foto de la auditoría y usa Gemini para resaltar fallos o visualizar mejoras.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-4">
          <div 
            className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              originalImage ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            {originalImage ? (
              <img src={originalImage} alt="Original" className="h-full w-full object-contain rounded-lg" />
            ) : (
              <div className="text-center p-4">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Clic para subir imagen</p>
                <p className="text-xs text-gray-400 mt-1">Soporta JPG, PNG</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej: 'Resalta con rojo la caja en el suelo' o 'Elimina la basura del pasillo'"
              className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              onClick={handleGenerate}
              disabled={!originalImage || !prompt || isLoading}
              className={`px-4 py-2 rounded-md text-white font-medium flex items-center ${
                !originalImage || !prompt || isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="border border-gray-200 rounded-xl h-64 md:h-auto flex items-center justify-center bg-gray-50 relative overflow-hidden">
          {isLoading ? (
            <div className="text-center">
              <RefreshCw className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-2" />
              <p className="text-sm text-purple-600 font-medium">Gemini está pensando...</p>
            </div>
          ) : generatedImage ? (
            <div className="relative w-full h-full group">
              <img src={generatedImage} alt="Generada por IA" className="w-full h-full object-contain" />
              <a 
                href={generatedImage} 
                download="evidencia_editada.png"
                className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-purple-600"
              >
                <Download className="w-5 h-5" />
              </a>
            </div>
          ) : (
            <div className="text-center text-gray-400 p-4">
              <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">La imagen editada aparecerá aquí</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-xs">
        <strong>Nota:</strong> Esta función utiliza el modelo <code>gemini-2.5-flash-image</code>. Describe claramente qué cambio quieres ver en la imagen.
      </div>
    </div>
  );
};
