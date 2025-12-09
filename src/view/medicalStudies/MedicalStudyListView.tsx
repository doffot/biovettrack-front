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
  FolderOpen
} from "lucide-react";
import { getMedicalStudiesByPatient, deleteMedicalStudy } from "../../api/medicalStudyAPI";
import { toast } from "../../components/Toast";
import type { MedicalStudy } from "../../types/medicalStudy";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import MedicalStudyModal from "../../components/medicalStudies/MedicalStudyModal";

// Iconos por tipo de estudio
const studyTypeIcons: Record<string, string> = {
  "Radiografía": "🩻",
  "Ecografía": "📡",
  "Hemograma externo": "🩸",
  "Química sanguínea": "🧪",
  "Otro": "📄",
};

const studyTypeColors: Record<string, string> = {
  "Radiografía": "bg-blue-100 text-blue-700 border-blue-200",
  "Ecografía": "bg-purple-100 text-purple-700 border-purple-200",
  "Hemograma externo": "bg-red-100 text-red-700 border-red-200",
  "Química sanguínea": "bg-amber-100 text-amber-700 border-amber-200",
  "Otro": "bg-gray-100 text-gray-700 border-gray-200",
};

export default function MedicalStudyListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudy, setSelectedStudy] = useState<MedicalStudy | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studyToDelete, setStudyToDelete] = useState<MedicalStudy | null>(null);

  // Query para obtener estudios
  const { data: studies = [], isLoading } = useQuery({
    queryKey: ["medicalStudies", patientId],
    queryFn: () => getMedicalStudiesByPatient(patientId!),
    enabled: !!patientId,
  });

  // Mutation para eliminar
  const { mutate: removeStudy, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteMedicalStudy(id),
    onSuccess: () => {
      toast.success("Estudio eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["medicalStudies", patientId] });
      setShowDeleteModal(false);
      setStudyToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Filtrar estudios
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
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-3 border-3 border-vet-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Cargando estudios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Estudios Médicos</h2>
          <p className="text-sm text-gray-500 mt-1">
            {studies.length} estudio{studies.length !== 1 ? "s" : ""} registrado{studies.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Link
          to="create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-vet-primary hover:bg-vet-secondary text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>Agregar Estudio</span>
        </Link>
      </div>

      {/* Buscador */}
      {studies.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por tipo, profesional o diagnóstico..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
          />
        </div>
      )}

      {/* Lista de estudios */}
      {filteredStudies.length > 0 ? (
        <div className="grid gap-4">
          {filteredStudies.map((study) => (
            <div
              key={study._id}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Icono del tipo */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border ${studyTypeColors[study.studyType] || studyTypeColors["Otro"]}`}>
                  {studyTypeIcons[study.studyType] || "📄"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{study.studyType}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {study.professional}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(study.date)}
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleView(study)}
                        className="p-2 rounded-lg text-gray-400 hover:text-vet-primary hover:bg-vet-primary/10 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(study)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Diagnóstico presuntivo */}
                  {study.presumptiveDiagnosis && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      <span className="font-medium">Dx:</span> {study.presumptiveDiagnosis}
                    </p>
                  )}

                  {/* Notas */}
                  {study.notes && (
                    <p className="mt-1 text-xs text-gray-400 line-clamp-1">
                      {study.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : studies.length > 0 ? (
        // Sin resultados de búsqueda
        <div className="text-center py-12">
          <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No se encontraron estudios</p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-2 text-sm text-vet-primary hover:underline"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        // Lista vacía
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <FolderOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Sin estudios registrados</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Agrega radiografías, ecografías, hemogramas externos y otros estudios de laboratorios externos.
          </p>
          <Link
            to="create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-vet-primary hover:bg-vet-secondary text-white font-semibold rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
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

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setStudyToDelete(null);
        }}
        onConfirm={() => studyToDelete?._id && removeStudy(studyToDelete._id)}
        petName={`el estudio de ${studyToDelete?.studyType || ""}`}
        isDeleting={isDeleting}
      />
    </div>
  );
}