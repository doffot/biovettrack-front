// src/components/vaccinations/VaccinationModal.tsx
import { X, Calendar, Syringe, Building, Hash, Clock, FileText, CheckCircle2, XCircle } from "lucide-react";
import type { Vaccination, VaccinationStatus } from "../../types/vaccination";

interface VaccinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaccination: Vaccination;
  onStatusChange?: (status: VaccinationStatus) => void;
}

export default function VaccinationModal({ 
  isOpen, 
  onClose, 
  vaccination,
  onStatusChange 
}: VaccinationModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusConfig = (status?: VaccinationStatus) => {
    if (!status) return null;
    
    switch (status) {
      case "Aplicada":
        return {
          color: "bg-green-100 text-green-700",
          icon: CheckCircle2,
          label: "Aplicada",
        };
      case "Programada":
        return {
          color: "bg-blue-100 text-blue-700",
          icon: Clock,
          label: "Programada",
        };
      case "Cancelada":
        return {
          color: "bg-red-100 text-red-700",
          icon: XCircle,
          label: "Cancelada",
        };
    }
  };

  const statusConfig = getStatusConfig(vaccination.status);

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

        {/* Status si está vinculada a cita */}
        {vaccination.status && statusConfig && (
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Estado de aplicación</p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-sm rounded-full font-medium flex items-center gap-1 ${statusConfig.color}`}>
                    <statusConfig.icon className="w-3.5 h-3.5" />
                    {statusConfig.label}
                  </span>
                  {vaccination.appointmentId && (
                    <span className="text-xs text-gray-400">• Vinculada a cita</span>
                  )}
                </div>
              </div>
              
              {/* Botones de acción para cambiar status */}
              {vaccination.status === "Programada" && onStatusChange && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onStatusChange("Aplicada")}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Marcar aplicada
                  </button>
                  <button
                    onClick={() => onStatusChange("Cancelada")}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
              
              {vaccination.status === "Aplicada" && onStatusChange && (
                <button
                  onClick={() => onStatusChange("Cancelada")}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition-colors"
                >
                  Cancelar aplicación
                </button>
              )}
            </div>
          </div>
        )}

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