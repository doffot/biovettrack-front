// components/GeneralTab.tsx

import type { FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form";
import type { LabExamFormData } from "../../types";

interface GeneralTabProps {
  species: 'perro' | 'gato';
  onSpeciesChange: (species: 'perro' | 'gato') => void;
  register: UseFormRegister<Omit<LabExamFormData, "differentialCount" | "totalCells">>;
  errors: FieldErrors<Omit<LabExamFormData, "differentialCount" | "totalCells">>;
  watch: UseFormWatch<Omit<LabExamFormData, "differentialCount" | "totalCells">>;
  isOutOfRange: (value: number | string | undefined, rangeKey: keyof typeof normalValues.perro) => boolean;
}

const normalValues = {
  perro: {
    hematocrit: [37, 55],
    whiteBloodCells: [6, 17],
    totalProtein: [5.4, 7.8],
    platelets: [175, 500],
  },
  gato: {
    hematocrit: [30, 45],
    whiteBloodCells: [5.5, 19.5],
    totalProtein: [5.7, 8.9],
    platelets: [180, 500],
  }
};

export function GeneralTab({ 
  species, 
  onSpeciesChange, 
  register, 
  errors, 
  watch, 
  isOutOfRange 
}: GeneralTabProps) {
  const fields = [
    { name: "hematocrit", label: "Hematocrito (%)", step: "0.1", rangeKey: 'hematocrit' as const },
    { name: "whiteBloodCells", label: "Glóbulos Blancos (x10³/μL)", step: "1", rangeKey: 'whiteBloodCells' as const },
    { name: "totalProtein", label: "Proteína Total (g/dL)", step: "0.1", rangeKey: 'totalProtein' as const },
    { name: "platelets", label: "Plaquetas (x10³/μL)", step: "1", rangeKey: 'platelets' as const },
  ] as const;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-vet-text font-semibold text-xs mb-1">Especie</label>
        <select
          value={species}
          onChange={(e) => onSpeciesChange(e.target.value as 'perro' | 'gato')}
          className="w-full bg-vet-light border border-vet-muted/30 rounded-md px-3 py-1.5 text-vet-text focus:outline-none focus:border-vet-primary text-sm"
        >
          <option value="perro">Perro</option>
          <option value="gato">Gato</option>
        </select>
      </div>
      <div>
        <label className="block text-vet-text font-semibold text-xs mb-1">Fecha</label>
        <input
          type="date"
          {...register("date", { required: "La fecha es obligatoria" })}
          className="w-full bg-vet-light border border-vet-muted/30 rounded-md px-3 py-1.5 text-vet-text placeholder-vet-muted focus:outline-none focus:border-vet-primary text-sm"
        />
        {errors.date && <p className="mt-1 text-xs text-vet-danger">{errors.date.message}</p>}
      </div>
      
      {fields.map((field) => (
        <div key={field.name} className="col-span-1">
          <label className="block text-vet-text font-semibold text-xs mb-1">{field.label}</label>
          <input
            type="number"
            step={field.step}
            {...register(field.name, {
              required: `${field.label} es obligatorio`,
              min: { value: 0, message: "Debe ser positivo" },
              valueAsNumber: true,
            })}
            className={`w-full bg-vet-light border rounded-md px-3 py-1.5 placeholder-vet-muted focus:outline-none focus:border-vet-primary text-sm
              ${isOutOfRange(watch(field.name), field.rangeKey)
                ? 'border-vet-danger text-vet-danger'
                : 'border-vet-muted/30 text-vet-text'
              }`}
          />
          {errors[field.name] && (
            <p className="mt-1 text-xs text-vet-danger">
              {errors[field.name]?.message}
            </p>
          )}
          <p className="mt-1 text-xs text-vet-muted/70">
            Normal ({species}): {normalValues[species][field.rangeKey][0]} - {normalValues[species][field.rangeKey][1]}
          </p>
        </div>
      ))}
    </div>
  );
}