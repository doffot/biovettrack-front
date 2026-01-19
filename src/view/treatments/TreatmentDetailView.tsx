// src/views/treatments/TreatmentDetailView.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Pill,
  Calendar,
  Activity,
  FileText,
} from "lucide-react";
import { getTreatmentById, deleteTreatment } from "../../api/treatmentAPI";
import { toast } from "../../components/Toast";
import ConfirmationModal from "../../components/modal/ConfirmationModal";

export default function TreatmentDetailView() {
  const { patientId, treatmentId } = useParams<{ patientId: string; treatmentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: treatment, isLoading } = useQuery({
    queryKey: ["treatment", treatmentId],
    queryFn: () => getTreatmentById(treatmentId!),
    enabled: !!treatmentId,
  });

  const { mutate: removeTreatment, isPending: isDeleting } = useMutation({
    mutationFn: deleteTreatment,
    onSuccess: () => {
      toast.success("Tratamiento eliminado", "El registro ha sido eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["treatments", patientId] });
      navigate(`/patients/${patientId}/treatments`);
    },
    onError: (error: Error) => {
      toast.error("Error al eliminar", error.message);
      setShowDeleteModal(false);
    },
  });

  const handleDelete = () => {
    if (treatmentId) {
      removeTreatment(treatmentId);
    }
  };

  if (isLoading) {
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
        <p className="text-[var(--color-vet-muted)] mb-6">
          El tratamiento que buscas no existe o fue eliminado
        </p>
        <Link
          to={`/patients/${patientId}/treatments`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-vet-primary)] text-white rounded-xl hover:bg-[var(--color-vet-secondary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a tratamientos
        </Link>
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
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/patients/${patientId}/treatments`)}
            className="p-2 rounded-lg hover:bg-[var(--color-hover)] text-[var(--color-vet-muted)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-vet-text)]">Detalles del Tratamiento</h2>
            <p className="text-sm text-[var(--color-vet-muted)]">{treatment.productName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/patients/${patientId}/treatments/${treatmentId}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white font-semibold rounded-xl transition-colors shadow-lg"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Link>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
        {/* Header del card */}
        <div className="bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Pill className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 text-white">
              <h3 className="text-xl font-bold mb-1">{treatment.productName}</h3>
              <p className="text-sm text-white/80">
                {treatment.treatmentType === "Otro" && treatment.treatmentTypeOther
                  ? treatment.treatmentTypeOther
                  : treatment.treatmentType}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(treatment.status)}`}>
                  {treatment.status}
                </span>
                <span className="text-xl font-bold">${treatment.cost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información */}
        <div className="p-6 space-y-6">
          {/* Dosificación */}
          <div>
            <h4 className="text-sm font-bold text-[var(--color-vet-text)] mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--color-vet-accent)]" />
              Dosificación
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[var(--color-hover)] p-4 rounded-xl">
                <p className="text-xs text-[var(--color-vet-muted)] mb-1">Dosis</p>
                <p className="font-semibold text-[var(--color-vet-text)]">{treatment.dose}</p>
              </div>
              <div className="bg-[var(--color-hover)] p-4 rounded-xl">
                <p className="text-xs text-[var(--color-vet-muted)] mb-1">Frecuencia</p>
                <p className="font-semibold text-[var(--color-vet-text)]">{treatment.frequency}</p>
              </div>
              <div className="bg-[var(--color-hover)] p-4 rounded-xl">
                <p className="text-xs text-[var(--color-vet-muted)] mb-1">Duración</p>
                <p className="font-semibold text-[var(--color-vet-text)]">{treatment.duration}</p>
              </div>
            </div>
          </div>

          {/* Vía de administración */}
          <div>
            <h4 className="text-sm font-bold text-[var(--color-vet-text)] mb-3 flex items-center gap-2">
              <Pill className="w-4 h-4 text-[var(--color-vet-accent)]" />
              Vía de Administración
            </h4>
            <p className="text-[var(--color-vet-text)] bg-[var(--color-hover)] p-4 rounded-xl">
              {treatment.route === "Otro" && treatment.routeOther ? treatment.routeOther : treatment.route}
            </p>
          </div>

          {/* Fechas */}
          <div>
            <h4 className="text-sm font-bold text-[var(--color-vet-text)] mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--color-vet-accent)]" />
              Fechas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[var(--color-hover)] p-4 rounded-xl">
                <p className="text-xs text-[var(--color-vet-muted)] mb-1">Fecha de Inicio</p>
                <p className="font-semibold text-[var(--color-vet-text)]">
                  {new Date(treatment.startDate).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              {treatment.endDate && (
                <div className="bg-[var(--color-hover)] p-4 rounded-xl">
                  <p className="text-xs text-[var(--color-vet-muted)] mb-1">Fecha de Fin</p>
                  <p className="font-semibold text-[var(--color-vet-text)]">
                    {new Date(treatment.endDate).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Observaciones */}
          {treatment.observations && (
            <div>
              <h4 className="text-sm font-bold text-[var(--color-vet-text)] mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--color-vet-accent)]" />
                Observaciones
              </h4>
              <div className="bg-[var(--color-hover)] p-4 rounded-xl">
                <p className="text-[var(--color-vet-text)] whitespace-pre-wrap">{treatment.observations}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-[var(--color-border)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[var(--color-vet-muted)]">
              <div>
                <span className="font-medium">Creado:</span>{" "}
                {new Date(treatment.createdAt).toLocaleString("es-ES")}
              </div>
              <div>
                <span className="font-medium">Actualizado:</span>{" "}
                {new Date(treatment.updatedAt).toLocaleString("es-ES")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="¿Eliminar tratamiento?"
        message={
          <div className="space-y-2">
            <p>
              ¿Estás seguro de que deseas eliminar el tratamiento{" "}
              <span className="font-semibold text-[var(--color-vet-text)]">{treatment.productName}</span>?
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