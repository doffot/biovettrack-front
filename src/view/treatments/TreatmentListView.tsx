// src/views/treatments/TreatmentListView.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Plus, Pill, Calendar, Clock, AlertCircle, Edit, Trash2, Eye } from "lucide-react";
import { getTreatmentsByPatient, deleteTreatment } from "../../api/treatmentAPI";
import { toast } from "../../components/Toast";
import ConfirmationModal from "../../components/modal/ConfirmationModal";

export default function TreatmentListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
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
      toast.success("Tratamiento eliminado", "El registro ha sido eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["treatments", patientId] });
      setDeleteModal({ isOpen: false, treatmentId: null, treatmentName: "" });
    },
    onError: (error: Error) => {
      toast.error("Error al eliminar", error.message);
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[var(--color-vet-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    const styles = {
      Activo: "bg-green-600/10 text-green-400 border border-green-500/20",
      Completado: "bg-blue-600/10 text-blue-400 border border-blue-500/20",
      Suspendido: "bg-red-600/10 text-red-400 border border-red-500/20",
    };
    return styles[status as keyof typeof styles] || "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-vet-text)]">Tratamientos</h2>
          <p className="text-sm text-[var(--color-vet-muted)]">
            {treatments.length} registro{treatments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          to={`/patients/${patientId}/treatments/create`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white font-semibold rounded-xl transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Nuevo Tratamiento
        </Link>
      </div>

      {/* Lista vacía */}
      {treatments.length === 0 ? (
        <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-12 text-center">
          <Pill className="w-12 h-12 text-[var(--color-vet-muted)] mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-bold text-[var(--color-vet-text)] mb-2">Sin tratamientos</h3>
          <p className="text-[var(--color-vet-muted)] mb-6">
            No hay tratamientos registrados para este paciente
          </p>
          <Link
            to={`/patients/${patientId}/treatments/create`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white font-medium rounded-xl transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Registrar primer tratamiento
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {treatments.map((treatment) => (
            <div
              key={treatment._id}
              className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-4 hover:border-[var(--color-vet-accent)] hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Contenido principal */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-vet-primary)]/10 flex items-center justify-center flex-shrink-0">
                    <Pill className="w-6 h-6 text-[var(--color-vet-accent)]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-[var(--color-vet-text)] truncate">
                        {treatment.productName}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusStyle(treatment.status)}`}>
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

                  {/* Botones de acción */}
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/patients/${patientId}/treatments/${treatment._id}`}
                      className="p-2 rounded-lg text-[var(--color-vet-muted)] hover:text-[var(--color-vet-accent)] hover:bg-[var(--color-hover)] transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <Link
                      to={`/patients/${patientId}/treatments/${treatment._id}/edit`}
                      className="p-2 rounded-lg text-[var(--color-vet-muted)] hover:text-blue-500 hover:bg-[var(--color-hover)] transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDeleteClick(treatment._id, treatment.productName)}
                      className="p-2 rounded-lg text-[var(--color-vet-muted)] hover:text-red-500 hover:bg-[var(--color-hover)] transition-colors"
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
            <p>
              ¿Estás seguro de que deseas eliminar el tratamiento{" "}
              <span className="font-semibold text-[var(--color-vet-text)]">{deleteModal.treatmentName}</span>?
            </p>
            <p className="text-sm text-[var(--color-vet-muted)]">
              Esta acción no se puede deshacer.
            </p>
          </div>
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        confirmIcon={Trash2}
        isLoading={isDeleting}
        loadingText="Eliminando..."
      />
    </div>
  );
}