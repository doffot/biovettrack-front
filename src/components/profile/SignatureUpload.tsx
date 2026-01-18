// src/components/profile/SignatureUpload.tsx
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadSignature, deleteSignature } from "../../api/AuthAPI";
import { toast } from "../Toast";
import { Upload, Trash2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface SignatureUploadProps {
  currentSignature?: string | null;
}

export default function SignatureUpload({ currentSignature }: SignatureUploadProps) {
  const [preview, setPreview] = useState<string>(currentSignature || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { mutate: upload, isPending: isUploading } = useMutation({
    mutationFn: uploadSignature,
    onSuccess: (data) => {
      toast.success("Firma actualizada", "Tu firma se ha guardado correctamente");
      setPreview(data.signature);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: Error) => {
      toast.error("Error", error.message);
    },
  });

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: deleteSignature,
    onSuccess: () => {
      toast.success("Firma eliminada", "Tu firma se ha eliminado correctamente");
      setPreview("");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: Error) => {
      toast.error("Error", error.message);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      toast.error("Archivo inválido", "Solo se permiten imágenes PNG, JPG o JPEG");
      return;
    }

    // Validar tamaño (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Archivo muy grande", "La imagen no debe superar 2MB");
      return;
    }

    // Previsualizar
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Subir
    upload(file);
  };

  return (
    <div className="space-y-6">
      {/* Título y descripción */}
      <div>
        <h3 className="text-xl font-bold text-vet-text mb-2">Firma Digital Profesional</h3>
        <p className="text-sm text-vet-muted">
          Esta firma aparecerá automáticamente en todas tus recetas médicas y documentos oficiales
        </p>
      </div>

      {/* Área de preview/upload */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        {preview ? (
          <div className="space-y-4">
            {/* Preview de la firma */}
            <div className="bg-white rounded-lg p-8 flex items-center justify-center border-2 border-slate-600 min-h-[200px]">
              <img 
                src={preview} 
                alt="Firma digital" 
                className="max-h-32 w-auto object-contain drop-shadow-lg"
              />
            </div>
            
            {/* Botones de acción */}
            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isDeleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-vet-primary hover:bg-vet-secondary text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Cambiar Firma
                  </>
                )}
              </button>
              
              <button
                onClick={() => remove()}
                disabled={isUploading || isDeleting}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Eliminar firma"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Estado confirmado */}
            <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-3">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">Firma configurada y lista para usar en tus documentos</span>
            </div>
          </div>
        ) : (
          <div>
            {/* Zona de carga */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full border-2 border-dashed border-slate-600 hover:border-vet-accent rounded-xl p-12 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mb-4 bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-vet-primary/20 transition-colors">
                  <Upload className="h-8 w-8 text-slate-500 group-hover:text-vet-accent transition-colors" />
                </div>
                <p className="text-base font-semibold text-slate-300 group-hover:text-vet-text transition-colors mb-2">
                  Haz clic para subir tu firma
                </p>
                <p className="text-sm text-slate-500">
                  o arrastra y suelta tu archivo aquí
                </p>
              </div>
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Requisitos y recomendaciones */}
      <div className="space-y-4">
        {/* Requisitos técnicos */}
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-blue-300 mb-2">Requisitos de la imagen</h4>
              <ul className="text-xs text-blue-200 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  <span><strong>Formato:</strong> PNG, JPG o JPEG</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  <span><strong>Tamaño máximo:</strong> 2MB</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  <span><strong>Dimensiones recomendadas:</strong> 400x200 px</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mejores prácticas */}
        <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4">
          <h4 className="text-sm font-bold text-emerald-300 mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Mejores prácticas para tu firma
          </h4>
          <ul className="text-xs text-emerald-200 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Fondo transparente:</strong> Usa formato PNG con fondo transparente para mejor apariencia</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Tinta oscura:</strong> Firma con bolígrafo negro o azul oscuro sobre papel blanco</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Buena iluminación:</strong> Escanea o fotografía con buena luz para evitar sombras</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Calidad alta:</strong> Usa escáner o cámara de buena resolución</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Recorta el exceso:</strong> Elimina espacios vacíos alrededor de la firma</span>
            </li>
          </ul>
        </div>

        {/* Paso a paso */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
          <h4 className="text-sm font-bold text-slate-300 mb-3">📝 Cómo crear tu firma digital</h4>
          <ol className="text-xs text-slate-400 space-y-2">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-vet-primary text-white flex items-center justify-center text-[10px] font-bold">1</span>
              <span>Firma en una hoja blanca con bolígrafo negro</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-vet-primary text-white flex items-center justify-center text-[10px] font-bold">2</span>
              <span>Escanea o fotografía la firma con buena iluminación</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-vet-primary text-white flex items-center justify-center text-[10px] font-bold">3</span>
              <span>Usa una herramienta como <a href="https://www.remove.bg" target="_blank" rel="noopener noreferrer" className="text-vet-accent underline hover:text-vet-primary">remove.bg</a> para quitar el fondo</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-vet-primary text-white flex items-center justify-center text-[10px] font-bold">4</span>
              <span>Recorta la imagen para que solo quede tu firma</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-vet-primary text-white flex items-center justify-center text-[10px] font-bold">5</span>
              <span>Sube el archivo PNG resultante aquí</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}