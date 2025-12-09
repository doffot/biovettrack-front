// src/views/settings/CreateStaffView.tsx
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { createStaff } from "../../api/staffAPI";

// Types
import type { StaffFormData } from "../../types/staff";
import { toast } from "../../components/Toast";
import StaffForm from "../../components/staff/StaffForm";

export default function CreateStaffView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffFormData>({
    defaultValues: {
      name: "",
      lastName: "",
      role: "groomer",
      phone: "",
      active: true,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: StaffFormData) => {
      // Limpia phone: si está vacío, envía undefined (no string vacío)
      const cleanData = {
        ...data,
        phone: data.phone?.trim() || undefined,
      };
      return await createStaff(cleanData);
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al crear el miembro del staff");
    },
    onSuccess: () => {
      toast.success("Miembro del staff creado con éxito");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      navigate("/staff");
    },
  });

  const onSubmit = (data: StaffFormData) => {
    mutate(data);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-vet-text">Crear Nuevo Staff</h1>
          <p className="text-vet-muted">Agrega un nuevo miembro a tu equipo clínico</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <StaffForm register={register} errors={errors} />

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
                  "Crear Staff"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}