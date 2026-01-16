import { X, Calendar, FlaskConical, FileText, Beaker, AlertCircle } from "lucide-react";
import type { LabExam } from "../../types/labExam";

interface LabExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: LabExam;
}

export default function LabExamModal({
  isOpen,
  onClose,
  exam,
}: LabExamModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div
        className="bg-slate-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden max-h-[90vh] overflow-y-auto border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/30 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-vet-text">Hemograma</h3>
              <p className="text-sm text-vet-muted">${exam.cost.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-3">
          {/* Fecha */}
          <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-vet-muted">Fecha del examen</p>
              <p className="text-sm font-medium text-vet-text">{formatDate(exam.date)}</p>
            </div>
          </div>

          {/* Resultados principales */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Beaker className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-blue-400">Hematocrito</p>
              </div>
              <p className="text-lg font-bold text-blue-300">{exam.hematocrit}%</p>
            </div>

            <div className="p-3 bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Beaker className="w-4 h-4 text-purple-400" />
                <p className="text-xs text-purple-400">Leucocitos</p>
              </div>
              <p className="text-lg font-bold text-purple-300">{exam.whiteBloodCells}</p>
            </div>

            <div className="p-3 bg-amber-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Beaker className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-amber-400">Proteína Total</p>
              </div>
              <p className="text-lg font-bold text-amber-300">{exam.totalProtein} g/dL</p>
            </div>

            <div className="p-3 bg-rose-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Beaker className="w-4 h-4 text-rose-400" />
                <p className="text-xs text-rose-400">Plaquetas</p>
              </div>
              <p className="text-lg font-bold text-rose-300">{exam.platelets}</p>
            </div>
          </div>

          {/* Hemotrópicos */}
          {exam.hemotropico && (
            <div className="flex items-start gap-3 p-3 bg-red-900/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
              <div>
                <p className="text-xs text-red-400">Hemotrópicos</p>
                <p className="text-sm text-red-300">{exam.hemotropico}</p>
              </div>
            </div>
          )}

          {/* Observaciones */}
          {exam.observacion && (
            <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
              <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-vet-muted">Observaciones</p>
                <p className="text-sm text-vet-text">{exam.observacion}</p>
              </div>
            </div>
          )}

          {/* Veterinario */}
          {exam.treatingVet && (
            <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-vet-muted">Veterinario tratante</p>
                <p className="text-sm font-medium text-vet-text">{exam.treatingVet}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-slate-400 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}