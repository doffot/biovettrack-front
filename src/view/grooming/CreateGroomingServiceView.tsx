// src/views/grooming/CreateGroomingServiceView.tsx
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createGroomingService } from "../../api/groomingAPI";
import { getStaffList } from "../../api/staffAPI";

import type { GroomingServiceFormData } from "../../types/grooming";
import { toast } from "../../components/Toast";
import GroomingServiceForm from "../../components/grooming/groomingForm";

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
      date: new Date().toISOString().split("T")[0],
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
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-6 h-6 border-2 border-vet-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-2 text-vet-text">Cargando peluqueros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-4xl mx-auto">
        <div>
          <form id="grooming-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <GroomingServiceForm register={register} errors={errors} groomers={groomers} />
            <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold transition-all duration-200 disabled:opacity-50"
              >
                {isPending ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Guardar Servicio"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}