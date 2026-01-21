// src/views/treatments/TreatmentListView.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Plus, Pill, Calendar, Clock, AlertCircle, Edit, Trash2, Eye, ChevronRight } from "lucide-react";
import { getTreatmentsByPatient, deleteTreatment } from "../../api/treatmentAPI";
import { toast } from "../../components/Toast";
import ConfirmationModal from "../../components/modal/ConfirmationModal";

export default function TreatmentListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const queryClient = useQueryClient();

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; treatmentId: string | null; treatmentName: string }>({
    isOpen: false,
    treatmentId: null,
    treatmentName: "",
  });

  const { data: treatments = [], isLoading } = useQuery({
    queryKey: ["treatments", patientId],
    queryFn: () => getTreatmentsByPatient(patientId!),
    enabled: !!patientId,
  });

  const { mutate: removeTreatment, isPending: isDeleting } = useMutation({
    mutationFn: deleteTreatment,
    onSuccess: () => {
      toast.success("Tratamiento eliminado", "El registro ha sido eliminado del historial médico");
      queryClient.invalidateQueries({ queryKey: ["treatments", patientId] });
      setDeleteModal({ isOpen: false, treatmentId: null, treatmentName: "" });
    },
    onError: (error: Error) => {
      toast.error("Error al eliminar", error.message || "No se pudo eliminar el tratamiento");
    },
  });

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, treatmentId: id, treatmentName: name });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.treatmentId) {
      removeTreatment(deleteModal.treatmentId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-[var(--color-vet-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    const styles = {
      Activo: "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20",
      Completado: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
      Suspendido: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
    };
    return styles[status as keyof typeof styles] || "";
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--color-vet-text)]">Tratamientos Activos</h2>
          <p className="text-xs sm:text-sm text-[var(--color-vet-muted)] mt-0.5">
            {treatments.length} registro{treatments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          to={`/patients/${patientId}/treatments/create`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] hover:shadow-lg hover:scale-105 active:scale-95 text-white text-sm font-semibold rounded-lg transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Tratamiento</span>
        </Link>
      </div>

      {/* Lista vacía */}
      {treatments.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-[var(--color-card)] rounded-xl border-2 border-dashed border-[var(--color-border)]">
          <Pill className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-[var(--color-vet-muted)] opacity-50 mb-3" />
          <p className="text-[var(--color-vet-muted)] mb-4 text-sm sm:text-base px-4">
            No hay tratamientos activos registrados
          </p>
          <Link
            to={`/patients/${patientId}/treatments/create`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Registrar primer tratamiento
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {treatments.map((treatment) => (
            <div
              key={treatment._id}
              className="group bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-vet-primary)] transition-all overflow-hidden"
            >
              {/* Desktop Layout */}
              <div className="hidden md:flex items-start gap-4 p-4">
                {/* Icono */}
                <div className="w-12 h-12 rounded-xl bg-[var(--color-vet-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <Pill className="w-6 h-6 text-[var(--color-vet-primary)]" />
                </div>

                {/* Info principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-[var(--color-vet-text)] truncate">
                      {treatment.productName}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold flex-shrink-0 ${getStatusStyle(treatment.status)}`}>
                      {treatment.status}
                    </span>
                  </div>

                  <p className="text-sm text-[var(--color-vet-muted)] mb-2">
                    {treatment.treatmentType === "Otro" && treatment.treatmentTypeOther
                      ? treatment.treatmentTypeOther
                      : treatment.treatmentType}{" "}
                    · {treatment.route === "Otro" && treatment.routeOther
                      ? treatment.routeOther
                      : treatment.route}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-vet-muted)]">
                    <div className="flex items-center gap-1">
                      <Pill className="w-3.5 h-3.5" />
                      <span>{treatment.dose}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{treatment.frequency}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{treatment.duration}</span>
                    </div>
                  </div>

                  {treatment.observations && (
                    <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-[var(--color-vet-muted)] flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-[var(--color-vet-muted)] line-clamp-2">
                          {treatment.observations}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Precio y acciones */}
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--color-vet-primary)]">
                      ${treatment.cost.toFixed(2)}
                    </p>
                    <p className="text-xs text-[var(--color-vet-muted)]">
                      {new Date(treatment.startDate).toLocaleDateString("es-ES")}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      to={`/patients/${patientId}/treatments/${treatment._id}`}
                      className="p-2 rounded-lg text-[var(--color-vet-muted)] hover:text-[var(--color-vet-accent)] hover:bg-[var(--color-vet-primary)]/10 transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <Link
                      to={`/patients/${patientId}/treatments/${treatment._id}/edit`}
                      className="p-2 rounded-lg text-[var(--color-vet-muted)] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDeleteClick(treatment._id, treatment.productName)}
                      className="p-2 rounded-lg text-[var(--color-vet-muted)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile/Tablet Layout */}
              <div className="md:hidden">
                {/* Header Card */}
                <div className="flex items-start gap-3 p-3 sm:p-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--color-vet-primary)]/10 flex items-center justify-center flex-shrink-0">
                    <Pill className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-vet-primary)]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Título y estado */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[var(--color-vet-text)] text-sm sm:text-base truncate">
                          {treatment.productName}
                        </h3>
                        <p className="text-xs text-[var(--color-vet-muted)] mt-0.5">
                          {treatment.treatmentType === "Otro" && treatment.treatmentTypeOther
                            ? treatment.treatmentTypeOther
                            : treatment.treatmentType}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${getStatusStyle(treatment.status)}`}>
                          {treatment.status}
                        </span>
                        <p className="text-sm font-bold text-[var(--color-vet-primary)]">
                          ${treatment.cost.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Detalles del tratamiento */}
                    <div className="space-y-1.5 mb-2">
                      <div className="flex items-center gap-2 text-xs text-[var(--color-vet-muted)]">
                        <Pill className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{treatment.dose}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--color-vet-muted)]">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{treatment.frequency}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--color-vet-muted)]">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{treatment.duration}</span>
                      </div>
                    </div>

                    {/* Observaciones */}
                    {treatment.observations && (
                      <div className="bg-[var(--color-hover)] p-2 rounded-lg">
                        <div className="flex items-start gap-1.5">
                          <AlertCircle className="w-3 h-3 text-[var(--color-vet-muted)] flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-[var(--color-vet-muted)] line-clamp-2">
                            {treatment.observations}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Fecha */}
                    <p className="text-[10px] text-[var(--color-vet-muted)] mt-2">
                      Inicio: {new Date(treatment.startDate).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                </div>

                {/* Acciones móvil */}
                <div className="border-t border-[var(--color-border)] bg-[var(--color-hover)]/50 px-3 py-2 sm:px-4">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/patients/${patientId}/treatments/${treatment._id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white text-sm font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Detalles</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </Link>

                    <Link
                      to={`/patients/${patientId}/treatments/${treatment._id}/edit`}
                      className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 border border-blue-500/20 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDeleteClick(treatment._id, treatment.productName)}
                      className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, treatmentId: null, treatmentName: "" })}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar tratamiento?"
        message={
          <div className="space-y-2">
            <p className="text-[var(--color-vet-text)]">
              ¿Estás seguro de eliminar el tratamiento{" "}
              <strong className="text-[var(--color-vet-primary)]">{deleteModal.treatmentName}</strong>?
            </p>
            <p className="text-sm text-[var(--color-vet-muted)]">
              Esta acción no se puede deshacer y se eliminará del historial médico del paciente.
            </p>
          </div>
        }
        confirmText="Sí, eliminar tratamiento"
        cancelText="Cancelar"
        variant="danger"
        confirmIcon={Trash2}
        isLoading={isDeleting}
        loadingText="Eliminando..."
      />
    </div>
  );
}