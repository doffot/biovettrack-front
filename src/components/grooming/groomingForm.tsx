// src/components/grooming/groomingForm.tsx
import React from "react";
import { Calendar, DollarSign, User } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { GroomingServiceFormData, GroomerOption } from "../../types/grooming";

type GroomingServiceFormProps = {
  register: UseFormRegister<GroomingServiceFormData>;
  errors: FieldErrors<GroomingServiceFormData>;
  groomers?: GroomerOption[];
};

const GroomingServiceForm: React.FC<GroomingServiceFormProps> = ({
  register,
  errors,
  groomers = [],
}) => {
  return (
    <div className="space-y-4">
      {/* Información Principal - 4 columnas en desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Fecha */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
            Fecha <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-vet-muted)] pointer-events-none" />
            <input
              type="date"
              {...register("date", { required: "Requerido" })}
              className={`w-full pl-9 pr-3 py-2 rounded-lg border bg-[var(--color-card)] text-[var(--color-vet-text)] text-sm transition-all ${
                errors.date
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-[var(--color-border)] hover:border-[var(--color-vet-primary)] focus:border-[var(--color-vet-primary)] focus:ring-2 focus:ring-[var(--color-vet-primary)]/10"
              } focus:outline-none`}
            />
          </div>
          {errors.date && (
            <p className="text-red-500 text-[10px] mt-0.5">{errors.date.message}</p>
          )}
        </div>

        {/* Servicio */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
            Servicio <span className="text-red-500">*</span>
          </label>
          <select
            {...register("service", { required: "Requerido" })}
            className={`w-full px-3 py-2 rounded-lg border bg-[var(--color-card)] text-[var(--color-vet-text)] text-sm transition-all ${
              errors.service
                ? "border-red-500 focus:ring-red-500/20"
                : "border-[var(--color-border)] hover:border-[var(--color-vet-primary)] focus:border-[var(--color-vet-primary)] focus:ring-2 focus:ring-[var(--color-vet-primary)]/10"
            } focus:outline-none`}
          >
            <option value="">Seleccionar...</option>
            <option value="Corte">Corte</option>
            <option value="Baño">Baño</option>
            <option value="Corte y Baño">Corte y Baño</option>
          </select>
          {errors.service && (
            <p className="text-red-500 text-[10px] mt-0.5">{errors.service.message}</p>
          )}
        </div>

        {/* Peluquero */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
            Peluquero <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-vet-muted)] pointer-events-none" />
            <select
              {...register("groomer", { required: "Requerido" })}
              className={`w-full pl-9 pr-3 py-2 rounded-lg border bg-[var(--color-card)] text-[var(--color-vet-text)] text-sm transition-all ${
                errors.groomer
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-[var(--color-border)] hover:border-[var(--color-vet-primary)] focus:border-[var(--color-vet-primary)] focus:ring-2 focus:ring-[var(--color-vet-primary)]/10"
              } focus:outline-none`}
            >
              <option value="">Seleccionar...</option>
              {groomers.map((groomer) => (
                <option key={groomer._id} value={groomer._id}>
                  {groomer.name} {groomer.lastName}
                </option>
              ))}
            </select>
          </div>
          {errors.groomer && (
            <p className="text-red-500 text-[10px] mt-0.5">{errors.groomer.message}</p>
          )}
        </div>

        {/* Costo */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
            Costo <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-vet-muted)] pointer-events-none" />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("cost", {
                required: "Requerido",
                valueAsNumber: true,
              })}
              className={`w-full pl-9 pr-3 py-2 rounded-lg border bg-[var(--color-card)] text-[var(--color-vet-text)] text-sm transition-all ${
                errors.cost
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-[var(--color-border)] hover:border-[var(--color-vet-primary)] focus:border-[var(--color-vet-primary)] focus:ring-2 focus:ring-[var(--color-vet-primary)]/10"
              } focus:outline-none`}
            />
          </div>
          {errors.cost && (
            <p className="text-red-500 text-[10px] mt-0.5">{errors.cost.message}</p>
          )}
        </div>
      </div>

      {/* Especificaciones y Observaciones - 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Especificaciones */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
            Especificaciones <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Describe el servicio realizado..."
            rows={3}
            maxLength={300}
            {...register("specifications", {
              required: "Requerido",
            })}
            className={`w-full px-3 py-2 rounded-lg border bg-[var(--color-card)] text-[var(--color-vet-text)] text-sm transition-all resize-none ${
              errors.specifications
                ? "border-red-500 focus:ring-red-500/20"
                : "border-[var(--color-border)] hover:border-[var(--color-vet-primary)] focus:border-[var(--color-vet-primary)] focus:ring-2 focus:ring-[var(--color-vet-primary)]/10"
            } focus:outline-none placeholder:text-[var(--color-vet-muted)]`}
          />
          {errors.specifications && (
            <p className="text-red-500 text-[10px] mt-0.5">{errors.specifications.message}</p>
          )}
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
            Observaciones <span className="text-[var(--color-vet-muted)] text-[10px]">(opcional)</span>
          </label>
          <textarea
            placeholder="Notas adicionales..."
            rows={3}
            maxLength={200}
            {...register("observations")}
            className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-vet-text)] text-sm transition-all resize-none hover:border-[var(--color-vet-primary)] focus:border-[var(--color-vet-primary)] focus:ring-2 focus:ring-[var(--color-vet-primary)]/10 focus:outline-none placeholder:text-[var(--color-vet-muted)]"
          />
        </div>
      </div>
    </div>
  );
};

export default GroomingServiceForm;