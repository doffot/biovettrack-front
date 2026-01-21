// src/views/grooming/CreateGroomingServiceView.tsx
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";

import { createGroomingService } from "../../api/groomingAPI";
import { getStaffList } from "../../api/staffAPI";

import type { GroomingServiceFormData } from "../../types/grooming";
import { toast } from "../../components/Toast";
import GroomingServiceForm from "../../components/grooming/groomingForm";

const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function CreateGroomingServiceView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: groomers = [], isLoading: isLoadingGroomers } = useQuery({
    queryKey: ["staff"],
    queryFn: getStaffList,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GroomingServiceFormData>({
    defaultValues: {
      date: getLocalDateString(), 
      service: undefined,
      specifications: "",
      observations: "",
      cost: undefined,
      groomer: undefined,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: GroomingServiceFormData) => {
      if (!patientId) {
        throw new Error("ID del paciente no encontrado");
      }
      if (!data.groomer) {
        throw new Error("Debes seleccionar un peluquero");
      }
      return await createGroomingService(data, patientId);
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al registrar el servicio");
    },
    onSuccess: () => {
      toast.success("Servicio registrado con éxito");
      queryClient.invalidateQueries({ queryKey: ["groomingServices", patientId] });
      queryClient.invalidateQueries({ queryKey: ["appointments", patientId] });
      queryClient.invalidateQueries({ queryKey: ["activeAppointments"] });
      navigate(-1);
    },
  });

  const onSubmit = (data: GroomingServiceFormData) => {
    mutate(data);
  };

  if (isLoadingGroomers) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[var(--color-vet-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[var(--color-vet-muted)] text-sm mt-3 font-medium">Cargando personal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* ✅ Sin card, sin borde - solo el formulario */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <GroomingServiceForm register={register} errors={errors} groomers={groomers} />
        
        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[var(--color-hover)] hover:bg-[var(--color-border)] text-[var(--color-vet-text)] font-medium transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Guardar Servicio</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}