// src/views/staff/EditStaffView.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, UserCog, Save } from "lucide-react";

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

  const { data: staff, isLoading } = useQuery({
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
      <div className="min-h-screen bg-[var(--color-vet-light)] flex items-center justify-center p-4">
        <div className="bg-[var(--color-card)] rounded-2xl shadow-sm border border-[var(--color-border)] p-8">
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-[var(--color-vet-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[var(--color-vet-muted)] text-sm mt-3 font-medium">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-vet-light)]">
      {/* Header Fijo */}
      <header className="fixed top-14 lg:top-16 left-0 right-0 lg:left-64 z-30 bg-[var(--color-card)]/95 backdrop-blur-lg border-b border-[var(--color-border)] shadow-sm">
        <div className="px-6 lg:px-8 pt-6 pb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl bg-[var(--color-hover)] hover:bg-[var(--color-vet-primary)]/10 text-[var(--color-vet-primary)] transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--color-vet-primary)]/10 rounded-lg">
                  <UserCog className="w-5 h-5 text-[var(--color-vet-primary)]" />
                </div>
                <h1 className="text-xl font-bold text-[var(--color-vet-text)]">Editar Staff</h1>
              </div>
              <p className="text-sm text-[var(--color-vet-muted)] mt-1 ml-12">
                Modifica la información del miembro del equipo
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Espaciador */}
      <div className="h-40 sm:h-44 lg:h-44"></div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6 lg:p-8">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <StaffForm register={register} errors={errors} />

              <div className="flex flex-col sm:flex-row gap-3 pt-8 mt-6 border-t border-[var(--color-border)]">
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
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}