// src/views/medicalStudies/MedicalStudyListView.tsx
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Calendar, 
  User, 
  Trash2,
  Eye,
  Search,
  FolderOpen,
  ChevronRight,
  X
} from "lucide-react";
import { getMedicalStudiesByPatient, deleteMedicalStudy } from "../../api/medicalStudyAPI";
import { toast } from "../../components/Toast";
import type { MedicalStudy } from "../../types/medicalStudy";
import ConfirmationModal from "../../components/modal/ConfirmationModal";
import MedicalStudyModal from "../../components/medicalStudies/MedicalStudyModal";

const studyTypeIcons: Record<string, string> = {
  "Radiografía": "🩻",
  "Ecografía": "📡",
  "Hemograma externo": "🩸",
  "Química sanguínea": "🧪",
  "Otro": "📄",
};

const studyTypeColors: Record<string, string> = {
  "Radiografía": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  "Ecografía": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
  "Hemograma externo": "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
  "Química sanguínea": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  "Otro": "bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20",
};

export default function MedicalStudyListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudy, setSelectedStudy] = useState<MedicalStudy | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studyToDelete, setStudyToDelete] = useState<MedicalStudy | null>(null);

  const { data: studies = [], isLoading } = useQuery({
    queryKey: ["medicalStudies", patientId],
    queryFn: () => getMedicalStudiesByPatient(patientId!),
    enabled: !!patientId,
  });

  const { mutate: removeStudy, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteMedicalStudy(id),
    onSuccess: () => {
      toast.success(
        "Estudio eliminado",
        "El registro ha sido removido del historial de estudios"
      );
      queryClient.invalidateQueries({ queryKey: ["medicalStudies", patientId] });
      setShowDeleteModal(false);
      setStudyToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(
        "Error al eliminar",
        error.message || "No se pudo eliminar el estudio"
      );
    },
  });

  const filteredStudies = studies.filter((study) =>
    study.studyType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    study.professional.toLowerCase().includes(searchQuery.toLowerCase()) ||
    study.presumptiveDiagnosis?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleView = (study: MedicalStudy) => {
    setSelectedStudy(study);
    setShowViewModal(true);
  };

  const handleDeleteClick = (study: MedicalStudy) => {
    setStudyToDelete(study);
    setShowDeleteModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-[var(--color-vet-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--color-vet-text)]">Estudios Médicos</h2>
          <p className="text-xs sm:text-sm text-[var(--color-vet-muted)] mt-0.5">
            {studies.length} estudio{studies.length !== 1 ? "s" : ""} registrado{studies.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Link
          to="create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] hover:shadow-lg hover:scale-105 active:scale-95 text-white text-sm font-semibold rounded-lg transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Estudio</span>
        </Link>
      </div>

      {/* Buscador */}
      {studies.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-vet-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por tipo, profesional o diagnóstico..."
            className="w-full pl-10 pr-10 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--color-hover)] transition-colors"
              title="Limpiar"
            >
              <X className="w-3.5 h-3.5 text-[var(--color-vet-muted)]" />
            </button>
          )}
        </div>
      )}

      {/* Lista de estudios */}
      {filteredStudies.length > 0 ? (
        <div className="space-y-3">
          {filteredStudies.map((study) => (
            <div
              key={study._id}
              className="group bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-vet-primary)] transition-all overflow-hidden"
            >
              {/* Desktop Layout */}
              <div className="hidden md:flex items-start gap-4 p-4">
                {/* Icono del tipo */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${studyTypeColors[study.studyType] || studyTypeColors["Otro"]}`}>
                  {studyTypeIcons[study.studyType] || "📄"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--color-vet-text)]">{study.studyType}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-vet-muted)] flex-wrap">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {study.professional}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(study.date)}
                    </span>
                  </div>

                  {study.presumptiveDiagnosis && (
                    <p className="mt-2 text-sm text-[var(--color-vet-text)] line-clamp-2">
                      <span className="font-medium text-[var(--color-vet-primary)]">Dx:</span> {study.presumptiveDiagnosis}
                    </p>
                  )}

                  {study.notes && (
                    <p className="mt-1 text-xs text-[var(--color-vet-muted)] line-clamp-1">
                      {study.notes}
                    </p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleView(study)}
                    className="p-2 rounded-lg text-[var(--color-vet-muted)] hover:text-[var(--color-vet-accent)] hover:bg-[var(--color-vet-primary)]/10 transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(study)}
                    className="p-2 rounded-lg text-[var(--color-vet-muted)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile/Tablet Layout */}
              <div className="md:hidden">
                <div className="flex items-start gap-3 p-3 sm:p-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 ${studyTypeColors[study.studyType] || studyTypeColors["Otro"]}`}>
                    {studyTypeIcons[study.studyType] || "📄"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[var(--color-vet-text)] text-sm sm:text-base">
                      {study.studyType}
                    </h3>

                    <div className="space-y-1 mt-1.5">
                      <div className="flex items-center gap-2 text-xs text-[var(--color-vet-muted)]">
                        <User className="w-3 h-3" />
                        <span className="truncate">{study.professional}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--color-vet-muted)]">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(study.date)}</span>
                      </div>
                    </div>

                    {study.presumptiveDiagnosis && (
                      <p className="mt-2 text-xs sm:text-sm text-[var(--color-vet-text)] line-clamp-2">
                        <span className="font-medium text-[var(--color-vet-primary)]">Dx:</span> {study.presumptiveDiagnosis}
                      </p>
                    )}

                    {study.notes && (
                      <p className="mt-1 text-[10px] sm:text-xs text-[var(--color-vet-muted)] bg-[var(--color-hover)] px-2 py-1 rounded line-clamp-1">
                        {study.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Acciones móvil */}
                <div className="border-t border-[var(--color-border)] bg-[var(--color-hover)]/50 px-3 py-2 sm:px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(study)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white text-sm font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Estudio</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(study)}
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
      ) : studies.length > 0 ? (
        // Sin resultados de búsqueda
        <div className="text-center py-12 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)]">
          <Search className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-[var(--color-vet-muted)] opacity-50 mb-3" />
          <p className="text-[var(--color-vet-muted)] mb-3 px-4">No se encontraron estudios con "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery("")}
            className="text-sm text-[var(--color-vet-primary)] hover:underline font-medium"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        // Lista vacía
        <div className="text-center py-12 sm:py-16 bg-[var(--color-card)] rounded-xl border-2 border-dashed border-[var(--color-border)]">
          <FolderOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-[var(--color-vet-muted)] opacity-50 mb-3" />
          <h3 className="text-base sm:text-lg font-semibold text-[var(--color-vet-text)] mb-2 px-4">
            Sin estudios registrados
          </h3>
          <p className="text-sm text-[var(--color-vet-muted)] mb-6 max-w-sm mx-auto px-4">
            Agrega radiografías, ecografías, hemogramas y otros estudios externos.
          </p>
          <Link
            to="create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Agregar primer estudio
          </Link>
        </div>
      )}

      {/* Modal para ver estudio */}
      {selectedStudy && (
        <MedicalStudyModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedStudy(null);
          }}
          study={selectedStudy}
        />
      )}

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setStudyToDelete(null);
        }}
        onConfirm={() => studyToDelete?._id && removeStudy(studyToDelete._id)}
        title="¿Eliminar estudio médico?"
        message={
          <div className="space-y-2">
            <p className="text-[var(--color-vet-text)]">
              ¿Estás seguro de eliminar el estudio de{" "}
              <strong className="text-[var(--color-vet-primary)]">
                {studyToDelete?.studyType}
              </strong>
              ?
            </p>
            {studyToDelete && (
              <div className="text-sm text-[var(--color-vet-muted)] bg-[var(--color-hover)] p-3 rounded-lg">
                <p className="font-medium mb-1">
                  Realizado por: {studyToDelete.professional}
                </p>
                <p>Fecha: {formatDate(studyToDelete.date)}</p>
              </div>
            )}
            <p className="text-sm text-[var(--color-vet-muted)]">
              Se perderá toda la información incluyendo imágenes adjuntas.
            </p>
          </div>
        }
        confirmText="Sí, eliminar estudio"
        cancelText="Cancelar"
        confirmIcon={Trash2}
        variant="danger"
        isLoading={isDeleting}
        loadingText="Eliminando..."
      />
    </div>
  );
}