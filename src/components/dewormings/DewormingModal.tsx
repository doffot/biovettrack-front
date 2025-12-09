// src/components/dewormings/DewormingModal.tsx
import { X, Calendar, Bug, Beaker, Clock, DollarSign } from "lucide-react";
import type { Deworming } from "../../types/deworming";

interface DewormingModalProps {
  isOpen: boolean;
  onClose: () => void;
  deworming: Deworming;
}

const typeColors: Record<string, string> = {
  "Interna": "bg-purple-100 text-purple-700",
  "Externa": "bg-blue-100 text-blue-700",
  "Ambas": "bg-emerald-100 text-emerald-700",
};

export default function DewormingModal({ isOpen, onClose, deworming }: DewormingModalProps) {
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
        className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Bug className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{deworming.productName}</h3>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[deworming.dewormingType]}`}>
                {deworming.dewormingType}
              </span>
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
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Fecha de aplicación</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(deworming.applicationDate)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Beaker className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Dosis aplicada</p>
              <p className="text-sm font-medium text-gray-900">{deworming.dose}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Costo</p>
              <p className="text-sm font-medium text-gray-900">${deworming.cost.toFixed(2)}</p>
            </div>
          </div>

          {deworming.nextApplicationDate && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Clock className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-blue-600">Próxima aplicación</p>
                <p className="text-sm font-medium text-blue-700">{formatDate(deworming.nextApplicationDate)}</p>
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