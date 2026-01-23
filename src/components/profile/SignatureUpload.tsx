// src/components/profile/SignatureUpload.tsx
import { useState, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadSignature, deleteSignature } from "../../api/AuthAPI";
import { toast } from "../Toast";
import { 
  Upload, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  FileImage,
  Sparkles,
  ExternalLink,
  Info,
  Lightbulb
} from "lucide-react";

interface SignatureUploadProps {
  currentSignature?: string | null;
}

export default function SignatureUpload({ currentSignature }: SignatureUploadProps) {
  const [preview, setPreview] = useState<string>(currentSignature || "");
  const [isDragging, setIsDragging] = useState(false);
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

  const validateAndUpload = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Archivo inválido", "Solo se permiten imágenes PNG, JPG o JPEG");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Archivo muy grande", "La imagen no debe superar 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    upload(file);
  }, [upload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndUpload(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndUpload(file);
  }, [validateAndUpload]);

  const isProcessing = isUploading || isDeleting;

  return (
    <div className="space-y-6">
      {/* ==================== UPLOAD AREA ==================== */}
      <div className="bg-[var(--color-background)] rounded-xl p-5 border border-[var(--color-border)]">
        {preview ? (
          // ==================== CON FIRMA ====================
          <div className="space-y-4">
            {/* Preview de la firma */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-vet-primary)]/20 via-[var(--color-vet-accent)]/20 to-[var(--color-vet-secondary)]/20 rounded-xl blur-sm opacity-75" />
              <div className="relative bg-white rounded-xl p-8 flex items-center justify-center border-2 border-[var(--color-border)] min-h-[180px]">
                <img 
                  src={preview} 
                  alt="Firma digital" 
                  className="max-h-28 w-auto object-contain drop-shadow-md"
                />
              </div>
              
              {/* Overlay de hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-xl transition-colors duration-200" />
            </div>
            
            {/* Acciones */}
            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white font-semibold text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Cambiar Firma</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => remove()}
                disabled={isProcessing}
                className="px-4 py-3 bg-[var(--color-vet-danger)]/10 text-[var(--color-vet-danger)] hover:bg-[var(--color-vet-danger)]/20 border border-[var(--color-vet-danger)]/30 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Eliminar firma"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Estado de éxito */}
            <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Firma configurada correctamente
                </p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                  Aparecerá en tus recetas y documentos
                </p>
              </div>
            </div>
          </div>
        ) : (
          // ==================== SIN FIRMA (DROPZONE) ====================
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`
                w-full border-2 border-dashed rounded-xl p-10 transition-all duration-300 group
                ${isDragging 
                  ? 'border-[var(--color-vet-primary)] bg-[var(--color-vet-primary)]/5 scale-[1.02]' 
                  : 'border-[var(--color-border)] hover:border-[var(--color-vet-primary)] hover:bg-[var(--color-vet-primary)]/5'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <div className="flex flex-col items-center">
                {/* Icono animado */}
                <div className={`
                  relative w-16 h-16 mb-4 rounded-2xl flex items-center justify-center transition-all duration-300
                  ${isDragging 
                    ? 'bg-[var(--color-vet-primary)]/20 scale-110' 
                    : 'bg-[var(--color-card)] group-hover:bg-[var(--color-vet-primary)]/10'
                  }
                `}>
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 text-[var(--color-vet-primary)] animate-spin" />
                  ) : (
                    <FileImage className={`
                      w-8 h-8 transition-all duration-300
                      ${isDragging 
                        ? 'text-[var(--color-vet-primary)] scale-110' 
                        : 'text-[var(--color-muted)] group-hover:text-[var(--color-vet-primary)]'
                      }
                    `} />
                  )}
                  
                  {/* Decoración */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--color-vet-accent)] rounded-full flex items-center justify-center">
                    <Upload className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>

                {isUploading ? (
                  <>
                    <p className="text-base font-semibold text-[var(--color-vet-primary)] mb-1">
                      Subiendo firma...
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      Por favor espera
                    </p>
                  </>
                ) : (
                  <>
                    <p className={`
                      text-base font-semibold mb-1 transition-colors duration-200
                      ${isDragging ? 'text-[var(--color-vet-primary)]' : 'text-[var(--color-text)] group-hover:text-[var(--color-vet-primary)]'}
                    `}>
                      {isDragging ? '¡Suelta tu archivo aquí!' : 'Haz clic para subir tu firma'}
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      o arrastra y suelta tu archivo
                    </p>
                    
                    {/* Formatos aceptados */}
                    <div className="flex items-center gap-2 mt-4">
                      <span className="px-2 py-1 bg-[var(--color-card)] text-[var(--color-muted)] text-xs font-medium rounded-md border border-[var(--color-border)]">
                        PNG
                      </span>
                      <span className="px-2 py-1 bg-[var(--color-card)] text-[var(--color-muted)] text-xs font-medium rounded-md border border-[var(--color-border)]">
                        JPG
                      </span>
                      <span className="px-2 py-1 bg-[var(--color-card)] text-[var(--color-muted)] text-xs font-medium rounded-md border border-[var(--color-border)]">
                        JPEG
                      </span>
                      <span className="text-xs text-[var(--color-muted)]">
                        • Máx 2MB
                      </span>
                    </div>
                  </>
                )}
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

      {/* ==================== INFO CARDS ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Requisitos técnicos */}
        <div className="bg-[var(--color-vet-primary)]/5 border border-[var(--color-vet-primary)]/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[var(--color-vet-primary)]/10 rounded-lg flex-shrink-0">
              <Info className="w-4 h-4 text-[var(--color-vet-primary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[var(--color-text)] mb-2">
                Requisitos de imagen
              </h4>
              <ul className="space-y-1.5">
                {[
                  { label: "Formato", value: "PNG, JPG o JPEG" },
                  { label: "Tamaño máximo", value: "2MB" },
                  { label: "Dimensiones ideales", value: "400x200 px" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                    <span className="w-1 h-1 rounded-full bg-[var(--color-vet-primary)]" />
                    <span><strong className="text-[var(--color-text)]">{item.label}:</strong> {item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Mejores prácticas */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg flex-shrink-0">
              <Lightbulb className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[var(--color-text)] mb-2">
                Mejores prácticas
              </h4>
              <ul className="space-y-1.5">
                {[
                  "Usa fondo transparente (PNG)",
                  "Firma con tinta oscura",
                  "Buena iluminación al escanear",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== PASO A PASO ==================== */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-[var(--color-background)] border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--color-vet-accent)]" />
            <h4 className="text-sm font-bold text-[var(--color-text)]">
              Cómo crear tu firma digital
            </h4>
          </div>
        </div>
        
        <div className="p-4">
          <ol className="space-y-3">
            {[
              { step: 1, text: "Firma en una hoja blanca con bolígrafo negro" },
              { step: 2, text: "Escanea o fotografía con buena iluminación" },
              { 
                step: 3, 
                text: "Usa remove.bg para quitar el fondo",
                link: { url: "https://www.remove.bg", label: "remove.bg" }
              },
              { step: 4, text: "Recorta la imagen dejando solo tu firma" },
              { step: 5, text: "Sube el archivo PNG aquí" },
            ].map((item) => (
              <li key={item.step} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {item.step}
                </span>
                <span className="text-sm text-[var(--color-muted)] pt-0.5">
                  {item.link ? (
                    <>
                      Usa{" "}
                      <a 
                        href={item.link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--color-vet-primary)] hover:text-[var(--color-vet-secondary)] font-medium underline underline-offset-2 transition-colors"
                      >
                        {item.link.label}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {" "}para quitar el fondo
                    </>
                  ) : (
                    item.text
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}