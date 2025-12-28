import { X, Calendar, FlaskConical, FileText, Beaker, AlertCircle } from "lucide-react";
import type { LabExam } from "../../types/labExam";

interface LabExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: LabExam;
  // onStatusChange ya no es necesario ni posible
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
        className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Hemograma</h3>
              <p className="text-sm text-gray-500">${exam.cost.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-3">
          {/* Fecha */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Fecha del examen</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(exam.date)}</p>
            </div>
          </div>

          {/* Resultados principales */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Beaker className="w-4 h-4 text-blue-500" />
                <p className="text-xs text-blue-600">Hematocrito</p>
              </div>
              <p className="text-lg font-bold text-blue-700">{exam.hematocrit}%</p>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Beaker className="w-4 h-4 text-purple-500" />
                <p className="text-xs text-purple-600">Leucocitos</p>
              </div>
              <p className="text-lg font-bold text-purple-700">{exam.whiteBloodCells}</p>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Beaker className="w-4 h-4 text-amber-500" />
                <p className="text-xs text-amber-600">Proteína Total</p>
              </div>
              <p className="text-lg font-bold text-amber-700">{exam.totalProtein} g/dL</p>
            </div>

            <div className="p-3 bg-rose-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Beaker className="w-4 h-4 text-rose-500" />
                <p className="text-xs text-rose-600">Plaquetas</p>
              </div>
              <p className="text-lg font-bold text-rose-700">{exam.platelets}</p>
            </div>
          </div>

          {/* Hemotrópicos */}
          {exam.hemotropico && (
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
              <div>
                <p className="text-xs text-red-600">Hemotrópicos</p>
                <p className="text-sm text-red-700">{exam.hemotropico}</p>
              </div>
            </div>
          )}

          {/* Observaciones */}
          {exam.observacion && (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Observaciones</p>
                <p className="text-sm text-gray-700">{exam.observacion}</p>
              </div>
            </div>
          )}

          {/* Veterinario */}
          {exam.treatingVet && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-400" /> {/* Reutilizamos Calendar o puedes usar otro icono */}
              <div>
                <p className="text-xs text-gray-500">Veterinario tratante</p>
                <p className="text-sm font-medium text-gray-900">{exam.treatingVet}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}