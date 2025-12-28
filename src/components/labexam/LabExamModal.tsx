import { X, Calendar, FlaskConical, Clock, FileText, CheckCircle2, XCircle, Loader2, Beaker, AlertCircle } from "lucide-react";
import type { LabExam, LabExamStatus } from "../../types/labExam";

interface LabExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: LabExam;
  onStatusChange?: (status: LabExamStatus) => void;
}

export default function LabExamModal({
  isOpen,
  onClose,
  exam,
  onStatusChange,
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

  const getStatusConfig = (status?: LabExamStatus) => {
    if (!status) return null;

    switch (status) {
      case "Completado":
        return {
          color: "bg-green-100 text-green-700",
          icon: CheckCircle2,
          label: "Completado",
        };
      case "Programado":
        return {
          color: "bg-blue-100 text-blue-700",
          icon: Clock,
          label: "Programado",
        };
      case "En proceso":
        return {
          color: "bg-amber-100 text-amber-700",
          icon: Loader2,
          label: "En proceso",
        };
      case "Cancelado":
        return {
          color: "bg-red-100 text-red-700",
          icon: XCircle,
          label: "Cancelado",
        };
    }
  };

  const statusConfig = getStatusConfig(exam.status);

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

        {/* Status si está vinculado a cita */}
        {exam.status && statusConfig && (
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Estado del examen</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-sm rounded-full font-medium flex items-center gap-1 ${statusConfig.color}`}
                  >
                    <statusConfig.icon className="w-3.5 h-3.5" />
                    {statusConfig.label}
                  </span>
                  {exam.appointmentId && (
                    <span className="text-xs text-gray-400">• Vinculado a cita</span>
                  )}
                </div>
              </div>

              {/* Botones de acción para cambiar status */}
              {exam.status === "Programado" && onStatusChange && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onStatusChange("En proceso")}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-medium rounded-lg transition-colors"
                  >
                    En proceso
                  </button>
                  <button
                    onClick={() => onStatusChange("Completado")}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Completar
                  </button>
                </div>
              )}

              {exam.status === "En proceso" && onStatusChange && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onStatusChange("Completado")}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Completar
                  </button>
                  <button
                    onClick={() => onStatusChange("Cancelado")}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {exam.status === "Completado" && onStatusChange && (
                <button
                  onClick={() => onStatusChange("Cancelado")}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        )}

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
              <Clock className="w-4 h-4 text-gray-400" />
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