// src/components/vaccinations/VaccinationModal.tsx
import { X, Syringe } from "lucide-react";
import type { Vaccination } from "../../types/vaccination";

interface VaccinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaccination: Vaccination;
}

export default function VaccinationModal({ 
  isOpen, 
  onClose, 
  vaccination
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* === HEADER: ÚNICO TOQUE DE ICONO (contextual) === */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-vet-light flex items-center justify-center">
              <Syringe className="w-5 h-5 text-vet-primary" />
            </div>
            <h3 className="font-semibold text-vet-text text-lg">
              {vaccination.vaccineType}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-vet-muted hover:text-vet-text hover:bg-vet-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* === CUERPO: TEXTO PURO, JERARQUÍA CLARA, CERO ICONOS === */}
        <div className="p-5 space-y-4">
          {/* Fecha de aplicación – LA INFORMACIÓN CLÍNICA CENTRAL */}
          <div>
            <p className="text-xs text-vet-muted font-medium uppercase tracking-wide mb-1">
              Fecha de aplicación
            </p>
            <p className="text-sm text-vet-text font-medium">
              {formatDate(vaccination.vaccinationDate)}
            </p>
          </div>

          {/* Laboratorio */}
          {vaccination.laboratory && (
            <div>
              <p className="text-xs text-vet-muted font-medium uppercase tracking-wide mb-1">
                Laboratorio
              </p>
              <p className="text-sm text-vet-text">
                {vaccination.laboratory}
              </p>
            </div>
          )}

          {/* Número de lote – CRÍTICO PARA TRAZABILIDAD */}
          {vaccination.batchNumber && (
            <div>
              <p className="text-xs text-vet-muted font-medium uppercase tracking-wide mb-1">
                Número de lote
              </p>
              <p className="text-sm text-vet-text font-mono"> {/* mono para códigos */}
                {vaccination.batchNumber}
              </p>
            </div>
          )}

          {/* Fecha de vencimiento – DESTACADO POR RELEVANCIA */}
          {vaccination.expirationDate && (
            <div>
              <p className="text-xs text-vet-muted font-medium uppercase tracking-wide mb-1">
                Vencimiento
              </p>
              <p className="text-sm text-amber-700 font-medium">
                {formatDate(vaccination.expirationDate)}
              </p>
            </div>
          )}

          {/* Próxima vacunación – GUIA EL SEGUIMIENTO */}
          {vaccination.nextVaccinationDate && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-vet-muted font-medium uppercase tracking-wide mb-1">
                Próxima vacunación
              </p>
              <p className="text-sm text-vet-accent font-medium">
                {formatDate(vaccination.nextVaccinationDate)}
              </p>
            </div>
          )}

          {/* Observaciones – TEXTO LIBRE CLÍNICO */}
          {vaccination.observations && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-vet-muted font-medium uppercase tracking-wide mb-1">
                Observaciones
              </p>
              <p className="text-sm text-vet-text whitespace-pre-line">
                {vaccination.observations}
              </p>
            </div>
          )}
        </div>

        {/* === FOOTER: BOTÓN CONSISTENTE === */}
        <div className="p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-vet-text bg-vet-light hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}