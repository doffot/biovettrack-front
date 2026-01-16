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
    <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-4 shadow-soft space-y-4">
      {/* Motivo */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-vet-text)] mb-2">
          <FileText className="w-4 h-4 text-[var(--color-vet-muted)]" />
          Motivo de la cita *
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="Ej: Control postoperatorio, Vacuna antirrábica..."
          className={`
            w-full px-4 py-3 rounded-lg border-2 transition-all font-roboto
            bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)]
            ${
              errors?.reason
                ? "border-red-500/50 bg-red-600/10 focus:border-red-500"
                : "border-[var(--color-border)] focus:border-[var(--color-vet-accent)] focus:bg-[var(--color-vet-primary)]/5"
            }
          `}
        />
        {errors?.reason && (
          <p className="mt-1.5 text-sm text-red-400 font-medium">
            {errors.reason}
          </p>
        )}
      </div>

      {/* Observaciones */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-vet-text)] mb-2">
          <MessageSquare className="w-4 h-4 text-[var(--color-vet-muted)]" />
          Observaciones
          <span className="text-[var(--color-vet-muted)] font-normal">(opcional)</span>
        </label>
        <textarea
          value={observations}
          onChange={(e) => onObservationsChange(e.target.value)}
          placeholder="Notas adicionales..."
          rows={3}
          className={`
            w-full px-4 py-3 rounded-lg border-2 resize-none transition-all font-roboto
            bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)]
            ${
              errors?.observations
                ? "border-red-500/50 bg-red-600/10 focus:border-red-500"
                : "border-[var(--color-border)] focus:border-[var(--color-vet-accent)] focus:bg-[var(--color-vet-primary)]/5"
            }
          `}
        />
        {errors?.observations && (
          <p className="mt-1.5 text-sm text-red-400 font-medium">
            {errors.observations}
          </p>
        )}
      </div>
    </div>
  );
}