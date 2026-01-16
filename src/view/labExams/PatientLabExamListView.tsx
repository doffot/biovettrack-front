// src/views/labExams/PatientLabExamListView.tsx
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLabExamsByPatient, deleteLabExam } from "../../api/labExamAPI";
import {
  FlaskConical,
  Plus,
  Calendar,
  AlertCircle,
  Eye,
  Trash2,
} from "lucide-react";
import { toast } from "../../components/Toast";
import type { LabExam } from "../../types/labExam";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import LabExamModal from "../../components/labexam/LabExamModal";

export default function PatientLabExamListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const queryClient = useQueryClient();

  const [selectedExam, setSelectedExam] = useState<LabExam | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState<LabExam | null>(null);

  const {  data:exams = [], isLoading, isError } = useQuery({
    queryKey: ["labExams", "patient", patientId],
    queryFn: () => getLabExamsByPatient(patientId!),
    enabled: !!patientId,
  });

  const { mutate: removeExam, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteLabExam(id),
    onSuccess: () => {
      toast.success("Examen eliminado");
      queryClient.invalidateQueries({ queryKey: ["labExams", "patient", patientId] });
      setShowDeleteModal(false);
      setExamToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-vet-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-vet-muted">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p className="text-sm">Error al cargar exámenes</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-vet-text">Exámenes de Laboratorio</h2>
          <p className="text-sm text-vet-muted">
            {exams.length} registrado{exams.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          to="create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-vet-primary hover:bg-vet-secondary text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo
        </Link>
      </div>

      {/* Lista */}
      {exams.length > 0 ? (
        <div className="space-y-3">
          {exams.map((exam) => (
            <div
              key={exam._id}
              className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors"
            >
              {/* Icono */}
              <div className="w-10 h-10 rounded-lg bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <FlaskConical className="w-5 h-5 text-purple-400" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-vet-text">Hemograma</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-vet-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(exam.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    Hct: {exam.hematocrit}%
                  </span>
                  <span className="flex items-center gap-1">
                    WBC: {exam.whiteBloodCells}
                  </span>
                </div>
              </div>

              {/* Precio */}
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-vet-text">${exam.cost.toFixed(2)}</p>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => {
                    setSelectedExam(exam);
                    setShowViewModal(true);
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-vet-accent hover:bg-vet-primary/10 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setExamToDelete(exam);
                    setShowDeleteModal(true);
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-700">
          <FlaskConical className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-vet-muted mb-4">Sin exámenes registrados</p>
          <Link
            to="create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-vet-primary text-white text-sm font-medium rounded-lg hover:bg-vet-secondary transition-colors"
          >
            <Plus className="w-4 h-4" />
            Registrar primer examen
          </Link>
        </div>
      )}

      {/* Modal Ver */}
      {selectedExam && (
        <LabExamModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedExam(null);
          }}
          exam={selectedExam}
        />
      )}

      {/* Modal Eliminar */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setExamToDelete(null);
        }}
        onConfirm={() => examToDelete?._id && removeExam(examToDelete._id)}
        petName={`el examen de ${examToDelete?.patientName || ""}`}
        isDeleting={isDeleting}
      />
    </div>
  );
}