// src/views/treatments/CreateTreatmentView.tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Pill, DollarSign } from "lucide-react";
import { createTreatment } from "../../api/treatmentAPI";
import { toast } from "../../components/Toast";
import { treatmentTypes, routeTypes, statusTypes, type TreatmentFormData } from "../../types/treatment";

export default function CreateTreatmentView() {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const queryClient = useQueryClient();

  const [showTreatmentTypeOther, setShowTreatmentTypeOther] = useState(false);
  const [showRouteOther, setShowRouteOther] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<TreatmentFormData>({
    defaultValues: {
      status: "Activo",
      cost: 0,
    },
  });

  const treatmentType = watch("treatmentType");
  const route = watch("route");

const { mutate, isPending } = useMutation({
  mutationFn: (data: TreatmentFormData) => createTreatment(patientId!, data),
  onSuccess: () => {
   toast.success(
      "Tratamiento registrado",
      "El tratamiento se creó correctamente y se generó su factura asociada"
    );
    queryClient.invalidateQueries({ queryKey: ["treatments", patientId] });
    queryClient.invalidateQueries({ queryKey: ["invoices"] });              
    queryClient.invalidateQueries({ queryKey: ["invoices", patientId] });   
    navigate(`/patients/${patientId}`);
  },
  onError: (error: Error) => {
    toast.error(error.message);
  },
});

  const onSubmit = (data: TreatmentFormData) => {
    if (data.treatmentType !== "Otro") {
      delete data.treatmentTypeOther;
    }
    if (data.route !== "Otro") {
      delete data.routeOther;
    }
    mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-[var(--color-hover)] text-[var(--color-vet-muted)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-vet-text)]">Nuevo Tratamiento</h2>
          <p className="text-sm text-[var(--color-vet-muted)]">Registra un nuevo tratamiento médico</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-6 space-y-6">
        
        {/* Tipo de tratamiento */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-vet-text)] mb-2">
            <Pill className="w-4 h-4 text-[var(--color-vet-accent)]" />
            Tipo de Tratamiento
          </label>
          <select
            {...register("treatmentType", { required: "El tipo es obligatorio" })}
            onChange={(e) => setShowTreatmentTypeOther(e.target.value === "Otro")}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-vet-primary)] focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 bg-[var(--color-card)] text-[var(--color-vet-text)]"
          >
            <option value="">Seleccionar tipo</option>
            {treatmentTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.treatmentType && <p className="mt-1 text-sm text-red-500">{errors.treatmentType.message}</p>}
        </div>

        {/* Campo personalizado si es "Otro" */}
        {showTreatmentTypeOther && (
          <div>
            <label className="text-sm font-semibold text-[var(--color-vet-text)] mb-2 block">
              Especificar tipo
            </label>
            <input
              type="text"
              {...register("treatmentTypeOther", { 
                required: treatmentType === "Otro" ? "Debes especificar el tipo" : false 
              })}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-vet-primary)] focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 bg-[var(--color-card)] text-[var(--color-vet-text)]"
              placeholder="Ej: Antiparasitario"
            />
            {errors.treatmentTypeOther && <p className="mt-1 text-sm text-red-500">{errors.treatmentTypeOther.message}</p>}
          </div>
        )}

        {/* Nombre del producto */}
        <div>
          <label className="text-sm font-semibold text-[var(--color-vet-text)] mb-2 block">
            Nombre del Producto/Medicamento
          </label>
          <input
            type="text"
            {...register("productName", { required: "El nombre es obligatorio" })}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-vet-primary)] focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 bg-[var(--color-card)] text-[var(--color-vet-text)]"
            placeholder="Ej: Amoxicilina"
          />
          {errors.productName && <p className="mt-1 text-sm text-red-500">{errors.productName.message}</p>}
        </div>

        {/* Dosis, Frecuencia, Duración */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold text-[var(--color-vet-text)] mb-2 block">Dosis</label>
            <input
              type="text"
              {...register("dose", { required: "La dosis es obligatoria" })}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-vet-primary)] focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 bg-[var(--color-card)] text-[var(--color-vet-text)]"
              placeholder="Ej: 250mg"
            />
            {errors.dose && <p className="mt-1 text-sm text-red-500">{errors.dose.message}</p>}
          </div>

          <div>
            <label className="text-sm font-semibold text-[var(--color-vet-text)] mb-2 block">Frecuencia</label>
            <input
              type="text"
              {...register("frequency", { required: "La frecuencia es obligatoria" })}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-vet-primary)] focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 bg-[var(--color-card)] text-[var(--color-vet-text)]"
              placeholder="Ej: Cada 8 horas"
            />
            {errors.frequency && <p className="mt-1 text-sm text-red-500">{errors.frequency.message}</p>}
          </div>

          <div>
            <label className="text-sm font-semibold text-[var(--color-vet-text)] mb-2 block">Duración</label>
            <input
              type="text"
              {...register("duration", { required: "La duración es obligatoria" })}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-vet-primary)] focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 bg-[var(--color-card)] text-[var(--color-vet-text)]"
              placeholder="Ej: 7 días"
            />
            {errors.duration && <p className="mt-1 text-sm text-red-500">{errors.duration.message}</p>}
          </div>
        </div>

        {/* Vía de administración */}
        <div>
          <label className="text-sm font-semibold text-[var(--color-vet-text)] mb-2 block">
            Vía de Administración
          </label>
          <select
            {...register("route", { required: "La vía es obligatoria" })}
            onChange={(e) => setShowRouteOther(e.target.value === "Otro")}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-vet-primary)] focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 bg-[var(--color-card)] text-[var(--color-vet-text)]"
          >
            <option value="">Seleccionar vía</option>
            {routeTypes.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {errors.route && <p className="mt-1 text-sm text-red-500">{errors.route.message}</p>}
        </div>

        {/* Campo personalizado si route es "Otro" */}
        {showRouteOther && (
          <div>
            <label className="text-sm font-semibold text-[var(--color-vet-text)] mb-2 block">
              Especificar vía
            </label>
            <input
              type="text"
              {...register("routeOther", { 
                required: route === "Otro" ? "Debes especificar la vía" : false 
              })}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-vet-primary)] focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 bg-[var(--color-card)] text-[var(--color-vet-text)]"
              placeholder="Ej: Intramuscular"
            />
            {errors.routeOther && <p className="mt-1 text-sm text-red-500">{errors.routeOther.message}</p>}
          </div>
        )}

        {/* Costo */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-vet-text)] mb-2">
            <DollarSign className="w-4 h-4 text-[var(--color-vet-accent)]" />
            Costo
          </label>
          <input
            type="number"
            step="0.01"
            {...register("cost", { required: "El costo es obligatorio", min: 0 })}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-vet-primary)] focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 bg-[var(--color-card)] text-[var(--color-vet-text)]"
            placeholder="0.00"
          />
          {errors.cost && <p className="mt-1 text-sm text-red-500">{errors.cost.message}</p>}
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-vet-text)] mb-2">
              <Calendar className="w-4 h-4 text-[var(--color-vet-accent)]" />
              Fecha de Inicio
            </label>
            <input
              type="date"
              {...register("startDate", { required: "La fecha de inicio es obligatoria" })}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-vet-primary)] focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 bg-[var(--color-card)] text-[var(--color-vet-text)]"
            />
            {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate.message}</p>}
          </div>

          <div>
            <label className="text-sm font-semibold text-[var(--color-vet-text)] mb-2 block">
              Fecha de Fin (opcional)
            </label>
            <input
              type="date"
              {...register("endDate")}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-vet-primary)] focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 bg-[var(--color-card)] text-[var(--color-vet-text)]"
            />
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="text-sm font-semibold text-[var(--color-vet-text)] mb-2 block">Estado</label>
          <select
            {...register("status")}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-vet-primary)] focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 bg-[var(--color-card)] text-[var(--color-vet-text)]"
          >
            {statusTypes.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Observaciones */}
        <div>
          <label className="text-sm font-semibold text-[var(--color-vet-text)] mb-2 block">
            Observaciones (opcional)
          </label>
          <textarea
            {...register("observations")}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-vet-primary)] focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 bg-[var(--color-card)] text-[var(--color-vet-text)] resize-none"
            placeholder="Indicaciones especiales..."
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-vet-text)] font-semibold hover:bg-[var(--color-hover)] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 px-6 py-3 rounded-xl bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white font-semibold transition-colors disabled:opacity-50"
          >
            {isPending ? "Guardando..." : "Registrar Tratamiento"}
          </button>
        </div>
      </form>
    </div>
  );
}