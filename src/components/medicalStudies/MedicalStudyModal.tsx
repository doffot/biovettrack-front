// src/components/medicalStudies/MedicalStudyModal.tsx
import { useState } from "react";
import { 
  X, 
  Calendar, 
  User, 
  FileText, 
  Stethoscope,
  Download,
  ExternalLink,
  Eye,
  ArrowLeft,
  Maximize2,
  Loader2,
  AlertCircle
} from "lucide-react";
import type { MedicalStudy } from "../../types/medicalStudy";

interface MedicalStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  study: MedicalStudy;
}

const studyTypeIcons: Record<string, string> = {
  "Radiografía": "🩻",
  "Ecografía": "📡",
  "Hemograma externo": "🩸",
  "Química sanguínea": "🧪",
};

export default function MedicalStudyModal({ isOpen, onClose, study }: MedicalStudyModalProps) {
  const [viewMode, setViewMode] = useState<"info" | "pdf">("info");
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getFileName = () => {
    const dateStr = new Date(study.date).toISOString().split("T")[0];
    const typeSafe = study.studyType.replace(/\s+/g, "_");
    return `${typeSafe}_${dateStr}.pdf`;
  };

  // Descargar con nombre correcto
  const handleDownloadPdf = async () => {
    try {
      const response = await fetch(study.pdfFile);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = getFileName();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(study.pdfFile, "_blank");
    }
  };

  const handleOpenExternal = () => {
    window.open(study.pdfFile, "_blank");
  };

  const handleIframeLoad = () => {
    setPdfLoading(false);
  };

  // Timeout para detectar si Google Docs no carga
  useState(() => {
    if (viewMode === "pdf") {
      const timeout = setTimeout(() => {
        if (pdfLoading) {
          setPdfError(true);
          setPdfLoading(false);
        }
      }, 10000);
      return () => clearTimeout(timeout);
    }
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div 
        className={`bg-sky-soft rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col border border-slate-700/50 ${
          viewMode === "pdf" 
            ? "w-full h-full max-w-5xl max-h-[95vh]" 
            : "max-w-lg w-full max-h-[90vh]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 flex-shrink-0 bg-vet-light/50">
          <div className="flex items-center gap-3">
            {viewMode === "pdf" && (
              <button
                onClick={() => {
                  setViewMode("info");
                  setPdfLoading(true);
                  setPdfError(false);
                }}
                className="p-2 rounded-xl hover:bg-slate-700 text-vet-muted hover:text-vet-text transition-colors mr-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-vet-primary/20 border border-vet-primary/30 flex items-center justify-center text-xl">
              {studyTypeIcons[study.studyType] || "📄"}
            </div>
            <div>
              <h3 className="text-lg font-bold text-vet-text">{study.studyType}</h3>
              <p className="text-sm text-vet-muted">{study.professional}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {viewMode === "pdf" && (
              <button
                onClick={handleOpenExternal}
                className="p-2 rounded-xl hover:bg-slate-700 text-vet-muted hover:text-vet-accent transition-colors"
                title="Abrir en nueva pestaña"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-vet-text transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        {viewMode === "info" ? (
          <>
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {/* Fecha */}
              <div className="flex items-center gap-3 p-3 bg-vet-light rounded-xl border border-slate-700/50">
                <Calendar className="w-5 h-5 text-vet-accent" />
                <div>
                  <p className="text-xs text-vet-muted uppercase tracking-wide">Fecha del estudio</p>
                  <p className="font-medium text-vet-text">{formatDate(study.date)}</p>
                </div>
              </div>

              {/* Profesional */}
              <div className="flex items-center gap-3 p-3 bg-vet-light rounded-xl border border-slate-700/50">
                <User className="w-5 h-5 text-vet-accent" />
                <div>
                  <p className="text-xs text-vet-muted uppercase tracking-wide">Profesional / Laboratorio</p>
                  <p className="font-medium text-vet-text">{study.professional}</p>
                </div>
              </div>

              {/* Diagnóstico presuntivo */}
              {study.presumptiveDiagnosis && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="w-4 h-4 text-amber-400" />
                    <p className="text-xs text-amber-300 uppercase tracking-wide font-semibold">
                      Diagnóstico Presuntivo
                    </p>
                  </div>
                  <p className="text-sm text-amber-200/90">{study.presumptiveDiagnosis}</p>
                </div>
              )}

              {/* Notas */}
              {study.notes && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <p className="text-xs text-blue-300 uppercase tracking-wide font-semibold">
                      Notas
                    </p>
                  </div>
                  <p className="text-sm text-blue-200/90">{study.notes}</p>
                </div>
              )}
            </div>

            {/* Footer con botones */}
            <div className="p-4 border-t border-slate-700/50 bg-vet-light/50 flex-shrink-0">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-sky-soft border border-slate-600 text-vet-muted font-medium rounded-xl hover:bg-slate-700 hover:border-slate-500 hover:text-vet-text transition-all"
                >
                  <Download className="w-5 h-5" />
                  <span>Descargar</span>
                </button>
                <button
                  onClick={() => {
                    setPdfLoading(true);
                    setPdfError(false);
                    setViewMode("pdf");
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-vet-primary to-vet-secondary text-white font-medium rounded-xl hover:from-vet-secondary hover:to-vet-primary transition-all shadow-lg shadow-vet-primary/20"
                >
                  <Eye className="w-5 h-5" />
                  <span>Ver PDF</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Vista del PDF embebido */
          <div className="flex-1 relative bg-slate-950 flex flex-col">
            {pdfLoading && !pdfError && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-10">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 text-vet-accent animate-spin mx-auto mb-3" />
                  <p className="text-sm text-vet-text">Cargando PDF...</p>
                  <p className="text-xs text-vet-muted mt-1">Esto puede tomar unos segundos</p>
                </div>
              </div>
            )}
            
            {pdfError ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-6">
                  <AlertCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-vet-text mb-2">
                    No se pudo cargar el visor
                  </h3>
                  <p className="text-vet-muted mb-6 max-w-sm">
                    El PDF está disponible pero el visor embebido no pudo cargarlo.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleDownloadPdf}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-soft border border-slate-600 text-vet-text rounded-xl font-medium hover:bg-slate-700 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Descargar PDF
                    </button>
                    <button
                      onClick={handleOpenExternal}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-vet-primary to-vet-secondary text-white rounded-xl font-medium hover:from-vet-secondary hover:to-vet-primary transition-all shadow-lg shadow-vet-primary/20"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Abrir en navegador
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(study.pdfFile)}&embedded=true`}
                className="w-full flex-1 min-h-[500px] border-0"
                onLoad={handleIframeLoad}
                title={`PDF - ${study.studyType}`}
              />
            )}
            
            {/* Barra inferior con opciones */}
            {!pdfError && (
              <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  ¿Problemas para ver el PDF?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadPdf}
                    className="text-xs text-slate-400 hover:text-vet-accent flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar
                  </button>
                  <span className="text-slate-700">|</span>
                  <button
                    onClick={handleOpenExternal}
                    className="text-xs text-slate-400 hover:text-vet-accent flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Nueva pestaña
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click fuera para cerrar */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}