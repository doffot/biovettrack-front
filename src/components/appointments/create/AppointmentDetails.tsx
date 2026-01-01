// src/components/appointments/create/AppointmentDetails.tsx

import { FileText, MessageSquare } from "lucide-react";

type AppointmentDetailsProps = {
  reason: string;
  observations: string;
  onReasonChange: (value: string) => void;
  onObservationsChange: (value: string) => void;
  errors?: {
    reason?: string;
    observations?: string;
  };
};

export default function AppointmentDetails({
  reason,
  observations,
  onReasonChange,
  onObservationsChange,
  errors,
}: AppointmentDetailsProps) {
  return (
    <div className="bg-white rounded-xl border border-vet-light p-4 shadow-soft space-y-4">
      {/* Motivo */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-vet-text mb-2">
          <FileText className="w-4 h-4 text-vet-muted" />
          Motivo de la cita *
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="Ej: Control postoperatorio, Vacuna antirrábica..."
          className={`
            w-full px-4 py-3 rounded-lg border-2 transition-all font-roboto
            ${
              errors?.reason
                ? "border-vet-danger bg-red-50 focus:border-vet-danger"
                : "border-vet-light focus:border-vet-accent focus:bg-sky-soft"
            }
          `}
        />
        {errors?.reason && (
          <p className="mt-1.5 text-sm text-vet-danger font-medium">
            {errors.reason}
          </p>
        )}
      </div>

      {/* Observaciones */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-vet-text mb-2">
          <MessageSquare className="w-4 h-4 text-vet-muted" />
          Observaciones
          <span className="text-vet-muted font-normal">(opcional)</span>
        </label>
        <textarea
          value={observations}
          onChange={(e) => onObservationsChange(e.target.value)}
          placeholder="Notas adicionales..."
          rows={3}
          className={`
            w-full px-4 py-3 rounded-lg border-2 resize-none transition-all font-roboto
            ${
              errors?.observations
                ? "border-vet-danger bg-red-50 focus:border-vet-danger"
                : "border-vet-light focus:border-vet-accent focus:bg-sky-soft"
            }
          `}
        />
        {errors?.observations && (
          <p className="mt-1.5 text-sm text-vet-danger font-medium">
            {errors.observations}
          </p>
        )}
      </div>
    </div>
  );
}