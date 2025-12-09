// src/views/staff/EditStaffView.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { getStaffById, updateStaff } from "../../api/staffAPI";

// Types
import type { StaffFormData } from "../../types/staff";
import { toast } from "../../components/Toast";
import StaffForm from "../../components/staff/StaffForm";

export default function EditStaffView() {
  const { staffId } = useParams<{ staffId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StaffFormData>();

  const {  data:staff, isLoading } = useQuery({
    queryKey: ["staff", staffId],
    queryFn: () => (staffId ? getStaffById(staffId) : Promise.reject("ID inválido")),
    enabled: !!staffId,
  });

  useEffect(() => {
    if (staff) {
      reset({
        name: staff.name,
        lastName: staff.lastName,
        role: staff.role,
        phone: staff.phone || "",
        active: staff.active,
      });
    }
  }, [staff, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: StaffFormData) => {
      if (!staffId) throw new Error("ID de staff no encontrado");
      
      // Limpiar phone
      const cleanData = {
        ...data,
        phone: data.phone?.trim() || undefined,
      };
      
      return await updateStaff({ formData: cleanData, staffId });
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al actualizar el staff");
    },
    onSuccess: () => {
      toast.success("Staff actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      navigate("/staff");
    },
  });

  const onSubmit = (data: StaffFormData) => {
    mutate(data);
  };

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-vet-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-vet-text">Editar Staff</h1>
          <p className="text-vet-muted">Modifica la información del miembro del equipo</p>
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
                  "Guardar Cambios"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}