// src/components/vaccinations/VaccinationModal.tsx
import { X, Calendar, Syringe, Building, Hash, Clock, FileText } from "lucide-react";
import type { Vaccination } from "../../types/vaccination";

interface VaccinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaccination: Vaccination;
}

export default function VaccinationModal({ isOpen, onClose, vaccination }: VaccinationModalProps) {
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
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Syringe className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{vaccination.vaccineType}</h3>
              <p className="text-sm text-gray-500">${vaccination.cost.toFixed(2)}</p>
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
              <p className="text-xs text-gray-500">Fecha de vacunación</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(vaccination.vaccinationDate)}</p>
            </div>
          </div>

          {vaccination.laboratory && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Building className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Laboratorio</p>
                <p className="text-sm font-medium text-gray-900">{vaccination.laboratory}</p>
              </div>
            </div>
          )}

          {vaccination.batchNumber && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Hash className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Número de lote</p>
                <p className="text-sm font-medium text-gray-900">{vaccination.batchNumber}</p>
              </div>
            </div>
          )}

          {vaccination.expirationDate && (
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
              <Calendar className="w-4 h-4 text-amber-500" />
              <div>
                <p className="text-xs text-amber-600">Vencimiento</p>
                <p className="text-sm font-medium text-amber-700">{formatDate(vaccination.expirationDate)}</p>
              </div>
            </div>
          )}

          {vaccination.nextVaccinationDate && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Clock className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-blue-600">Próxima vacunación</p>
                <p className="text-sm font-medium text-blue-700">{formatDate(vaccination.nextVaccinationDate)}</p>
              </div>
            </div>
          )}

          {vaccination.observations && (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Observaciones</p>
                <p className="text-sm text-gray-700">{vaccination.observations}</p>
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