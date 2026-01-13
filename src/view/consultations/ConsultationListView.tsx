// src/views/consultations/ConsultationListView.tsx
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Stethoscope,
  Plus,
  Calendar,
  Trash2,
  Eye,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { 
  getConsultationsByPatient, 
  deleteConsultation,
  getDraft // ✅ NUEVO
} from "../../api/consultationAPI";
import { toast } from "../../components/Toast";
import type { Consultation } from "../../types/consultation";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import ConsultationModal from "../../components/consultations/ConsultationModal";

export default function ConsultationListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState<Consultation | null>(null);

  // ✅ Obtener consultas finalizadas
  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ["consultations", patientId],
    queryFn: () => getConsultationsByPatient(patientId!),
    enabled: !!patientId,
  });

  // ✅ NUEVO: Verificar si hay borrador
  const { data: draft } = useQuery({
    queryKey: ["consultationDraft", patientId],
    queryFn: () => getDraft(patientId!),
    enabled: !!patientId,
    retry: false, // No reintentar si no hay borrador (404)
  });

  const { mutate: removeConsultation, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteConsultation(id),
    onSuccess: () => {
      toast.success("Consulta eliminada");
      queryClient.invalidateQueries({ queryKey: ["consultations", patientId] });
      setShowDeleteModal(false);
      setConsultationToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ NUEVO: Calcular progreso del borrador
  const getDraftProgress = () => {
    if (!draft) return null;

    const hasAnamnesis = !!(draft.reasonForVisit && draft.symptomOnset);
    const hasPhysicalExam = !!(draft.temperature && draft.heartRate);
    const hasDiagnosis = !!(draft.presumptiveDiagnosis && draft.definitiveDiagnosis);

    return {
      anamnesis: hasAnamnesis,
      physicalExam: hasPhysicalExam,
      diagnosis: hasDiagnosis,
    };
  };

  const draftProgress = getDraftProgress();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-vet-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Consultas</h2>
          <p className="text-sm text-gray-500">
            {consultations.length} finalizada{consultations.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          to="create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-vet-primary hover:bg-vet-secondary text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva
        </Link>
      </div>

      {/* ✅ NUEVO: Banner de borrador pendiente */}
      {draft && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-amber-900">
                  Tienes una consulta sin terminar
                </h3>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-medium rounded">
                  Borrador
                </span>
              </div>
              <p className="text-sm text-amber-700 mb-3">
                Iniciada: {formatDate(draft.consultationDate)}
              </p>

              {/* Progreso */}
              {draftProgress && (
                <div className="flex items-center gap-3 mb-3 text-xs">
                  <span className={`flex items-center gap-1 ${draftProgress.anamnesis ? 'text-green-600' : 'text-gray-400'}`}>
                    {draftProgress.anamnesis ? '✅' : '⭕'} Anamnesis
                  </span>
                  <span className={`flex items-center gap-1 ${draftProgress.physicalExam ? 'text-green-600' : 'text-gray-400'}`}>
                    {draftProgress.physicalExam ? '✅' : '⭕'} Examen
                  </span>
                  <span className={`flex items-center gap-1 ${draftProgress.diagnosis ? 'text-green-600' : 'text-gray-400'}`}>
                    {draftProgress.diagnosis ? '✅' : '⭕'} Diagnóstico
                  </span>
                </div>
              )}

              {/* Acciones */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("create")}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  📝 Continuar consulta
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("¿Estás seguro de descartar este borrador?")) {
                      deleteConsultation(draft._id).then(() => {
                        toast.success("Borrador descartado");
                        queryClient.invalidateQueries({ queryKey: ["consultationDraft", patientId] });
                      });
                    }
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-amber-300 text-amber-700 text-sm font-medium rounded-lg transition-colors"
                >
                  🗑️ Descartar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de consultas finalizadas */}
      {consultations.length > 0 ? (
        <div className="space-y-3">
          {consultations.map((consultation) => (
            <div
              key={consultation._id}
              className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
            >
              {/* Icono */}
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-5 h-5 text-blue-600" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {consultation.presumptiveDiagnosis}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(consultation.consultationDate)}
                  </span>
                  <span className="truncate">{consultation.reasonForVisit}</span>
                </div>
              </div>

              {/* Precio - ✅ Manejo de null */}
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-gray-900 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {consultation.cost ? consultation.cost.toFixed(2) : "0.00"}
                </p>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => {
                    setSelectedConsultation(consultation);
                    setShowViewModal(true);
                  }}
                  className="p-2 rounded-lg text-gray-400 hover:text-vet-primary hover:bg-vet-primary/10 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setConsultationToDelete(consultation);
                    setShowDeleteModal(true);
                  }}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <Stethoscope className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">Sin consultas finalizadas</p>
          <Link
            to="create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-vet-primary text-white text-sm font-medium rounded-lg hover:bg-vet-secondary transition-colors"
          >
            <Plus className="w-4 h-4" />
            Registrar primera consulta
          </Link>
        </div>
      )}

      {/* Modal Ver */}
      {selectedConsultation && (
        <ConsultationModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedConsultation(null);
          }}
          consultation={selectedConsultation}
        />
      )}

      {/* Modal Eliminar */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setConsultationToDelete(null);
        }}
        onConfirm={() =>
          consultationToDelete?._id && removeConsultation(consultationToDelete._id)
        }
        petName={`la consulta del ${
          consultationToDelete
            ? formatDate(consultationToDelete.consultationDate)
            : ""
        }`}
        isDeleting={isDeleting}
      />
    </div>
  );
}