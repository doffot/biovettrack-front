// components/ObservationsTab.tsx
import { Save } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { LabExamFormData } from "../../types";

interface ObservationsTabProps {
  register: UseFormRegister<Omit<LabExamFormData, "differentialCount" | "totalCells">>;
  errors: FieldErrors<Omit<LabExamFormData, "differentialCount" | "totalCells">>;
  isPending: boolean;
  onSubmit: () => void;
}

export function ObservationsTab({ 
  register, 
  errors, 
  isPending, 
  onSubmit 
}: ObservationsTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-vet-text font-semibold text-xs mb-1">Hemotrópico</label>
        <textarea
          {...register("hemotropico")}
          placeholder="Ej: Se observan formas compatibles con Mycoplasma hemofelis"
          className="w-full bg-vet-light border border-vet-muted/30 rounded-md px-3 py-1.5 text-vet-text placeholder-vet-muted focus:outline-none focus:border-vet-primary resize-none text-sm"
          rows={2}
        />
        {errors.hemotropico && (
          <p className="mt-1 text-xs text-vet-danger">{errors.hemotropico.message}</p>
        )}
      </div>

      <div>
        <label className="block text-vet-text font-semibold text-xs mb-1">Observación</label>
        <textarea
          {...register("observacion")}
          placeholder="Ej: Muestra con ligera hemólisis. Paciente febril, se sugiere repetir en 72h."
          className="w-full bg-vet-light border border-vet-muted/30 rounded-md px-3 py-1.5 text-vet-text placeholder-vet-muted focus:outline-none focus:border-vet-primary resize-none text-sm"
          rows={3}
        />
        {errors.observacion && (
          <p className="mt-1 text-xs text-vet-danger">{errors.observacion.message}</p>
        )}
      </div>

      <div className="pt-3 flex justify-end">
        <button
          type="submit"
          onClick={onSubmit}
          disabled={isPending}
          className="flex items-center gap-1.5 px-4 py-2 bg-vet-primary hover:bg-vet-accent text-white rounded-md font-semibold text-sm transition-colors"
        >
          {isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar Examen
            </>
          )}
        </button>
      </div>
    </div>
  );
}