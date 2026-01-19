// src/views/treatments/EditTreatmentView.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Pill, DollarSign, Save } from "lucide-react";
import { getTreatmentById, updateTreatment } from "../../api/treatmentAPI";
import { toast } from "../../components/Toast";
import { treatmentTypes, routeTypes, statusTypes, type TreatmentFormData } from "../../types/treatment";

export default function EditTreatmentView() {
  const navigate = useNavigate();
  const { patientId, treatmentId } = useParams<{ patientId: string; treatmentId: string }>();
  const queryClient = useQueryClient();

  const [showTreatmentTypeOther, setShowTreatmentTypeOther] = useState(false);
  const [showRouteOther, setShowRouteOther] = useState(false);

  const { data: treatment, isLoading: isLoadingTreatment } = useQuery({
    queryKey: ["treatment", treatmentId],
    queryFn: () => getTreatmentById(treatmentId!),
    enabled: !!treatmentId,
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<TreatmentFormData>();

  const treatmentType = watch("treatmentType");
  const route = watch("route");

  useEffect(() => {
    if (treatment) {
      setValue("treatmentType", treatment.treatmentType);
      setValue("treatmentTypeOther", treatment.treatmentTypeOther || "");
      setValue("productName", treatment.productName);
      setValue("dose", treatment.dose);
      setValue("frequency", treatment.frequency);
      setValue("duration", treatment.duration);
      setValue("route", treatment.route);
      setValue("routeOther", treatment.routeOther || "");
      setValue("cost", treatment.cost);
      setValue("startDate", treatment.startDate.split("T")[0]);
      setValue("endDate", treatment.endDate ? treatment.endDate.split("T")[0] : "");
      setValue("observations", treatment.observations || "");
      setValue("status", treatment.status);

      setShowTreatmentTypeOther(treatment.treatmentType === "Otro");
      setShowRouteOther(treatment.route === "Otro");
    }
  }, [treatment, setValue]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: TreatmentFormData) => updateTreatment(treatmentId!, data),
    onSuccess: () => {
      toast.success("Tratamiento actualizado", "Los cambios han sido guardados correctamente");
      queryClient.invalidateQueries({ queryKey: ["treatments", patientId] });
      queryClient.invalidateQueries({ queryKey: ["treatment", treatmentId] });
      navigate(`/patients/${patientId}/treatments/${treatmentId}`);
    },
    onError: (error: Error) => {
      toast.error("Error al actualizar", error.message);
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

  if (isLoadingTreatment) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[var(--color-vet-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!treatment) {
    return (
      <div className="text-center py-12">
        <Pill className="w-12 h-12 text-[var(--color-vet-muted)] mx-auto mb-4 opacity-30" />
        <h3 className="text-lg font-bold text-[var(--color-vet-text)] mb-2">Tratamiento no encontrado</h3>
        <button
          onClick={() => navigate(`/patients/${patientId}/treatments`)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-vet-primary)] text-white rounded-xl hover:bg-[var(--color-vet-secondary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a tratamientos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-[var(--color-hover)] text-[var(--color-vet-muted)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-vet-text)]">Editar Tratamiento</h2>
          <p className="text-sm text-[var(--color-vet-muted)]">{treatment.productName}</p>
        </div>
      </div>

      {/* Formulario */}
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
            className="flex-1 px-6 py-3 rounded-xl bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}