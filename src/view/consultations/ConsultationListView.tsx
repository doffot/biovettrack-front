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
  Clock,
} from "lucide-react";
import { 
  getConsultationsByPatient, 
  deleteConsultation,
  getDraft 
} from "../../api/consultationAPI";
import { toast } from "../../components/Toast";
import type { Consultation } from "../../types/consultation";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import ConsultationModal from "../../components/consultations/ConsultationModal";
import ConfirmationModal from "../../components/modal/ConfirmationModal";

export default function ConsultationListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDiscardDraftModal, setShowDiscardDraftModal] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState<Consultation | null>(null);
  const [isDeletingDraft, setIsDeletingDraft] = useState(false);

  // Obtener consultas finalizadas
  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ["consultations", patientId],
    queryFn: () => getConsultationsByPatient(patientId!),
    enabled: !!patientId,
  });

  // Verificar si hay borrador
  const { data: draft } = useQuery({
    queryKey: ["consultationDraft", patientId],
    queryFn: () => getDraft(patientId!),
    enabled: !!patientId,
    retry: false,
  });

  const { mutate: removeConsultation, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteConsultation(id),
    onSuccess: () => {
      toast.success(
        "Consulta eliminada",
        "El registro ha sido eliminado permanentemente"
      );
      queryClient.invalidateQueries({ queryKey: ["consultations", patientId] });
      setShowDeleteModal(false);
      setConsultationToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(
        "Error al eliminar",
        error.message || "No se pudo eliminar la consulta"
      );
    },
  });

  // Manejar descarte de borrador
  const handleDiscardDraft = async () => {
    if (!draft) return;

    setIsDeletingDraft(true);
    
    try {
      await deleteConsultation(draft._id);
      toast.success(
        "Borrador descartado",
        "El borrador ha sido eliminado correctamente"
      );
      queryClient.invalidateQueries({ queryKey: ["consultationDraft", patientId] });
      setShowDiscardDraftModal(false);
    } catch (error: any) {
      toast.error(
        "Error al descartar",
        error.message || "No se pudo eliminar el borrador"
      );
    } finally {
      setIsDeletingDraft(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Calcular progreso del borrador
  const getDraftProgress = () => {
    if (!draft) return null;

    const hasAnamnesis = !!(draft.reasonForVisit && draft.symptomOnset);
    const hasPhysicalExam = !!(draft.temperature && draft.heartRate);
    const hasDiagnosis = !!(draft.presumptiveDiagnosis && draft.definitiveDiagnosis);

    const completed = [hasAnamnesis, hasPhysicalExam, hasDiagnosis].filter(Boolean).length;
    const percentage = Math.round((completed / 3) * 100);

    return {
      anamnesis: hasAnamnesis,
      physicalExam: hasPhysicalExam,
      diagnosis: hasDiagnosis,
      percentage,
      completed,
      total: 3,
    };
  };

  const draftProgress = getDraftProgress();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-[var(--color-vet-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-vet-text)]">Consultas Médicas</h2>
          <p className="text-sm text-[var(--color-vet-muted)]">
            {consultations.length} consulta{consultations.length !== 1 ? "s" : ""} finalizada{consultations.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          to="create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          Nueva Consulta
        </Link>
      </div>

      {/* Banner de borrador pendiente */}
      {draft && draftProgress && (
        <div className="mb-4 rounded-xl border-2 border-amber-500/30 bg-gradient-to-r from-amber-600/10 to-orange-600/10 overflow-hidden shadow-sm">
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Icono */}
              <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center flex-shrink-0 shadow-sm border border-amber-500/20">
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                {/* Título */}
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-amber-300">
                    Consulta sin finalizar
                  </h3>
                  <span className="px-2 py-0.5 bg-amber-600/20 text-amber-400 text-xs font-medium rounded-full border border-amber-500/30">
                    Borrador
                  </span>
                </div>

                {/* Información */}
                <div className="flex items-center gap-3 text-xs text-amber-400/80 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Iniciada: {formatDate(draft.consultationDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {draftProgress.completed} de {draftProgress.total} secciones completadas
                  </span>
                </div>

                {/* Barra de progreso */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-amber-400/80 mb-1">
                    <span>Progreso general</span>
                    <span className="font-semibold">{draftProgress.percentage}%</span>
                  </div>
                  <div className="w-full bg-amber-950/30 rounded-full h-2 overflow-hidden border border-amber-500/20">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 rounded-full"
                      style={{ width: `${draftProgress.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Indicadores de secciones */}
                <div className="flex items-center gap-4 mb-3 text-xs">
                  <span className={`flex items-center gap-1.5 ${draftProgress.anamnesis ? 'text-green-400 font-medium' : 'text-[var(--color-vet-muted)]'}`}>
                    {draftProgress.anamnesis ? '✅' : '⭕'} 
                    <span>Anamnesis</span>
                  </span>
                  <span className={`flex items-center gap-1.5 ${draftProgress.physicalExam ? 'text-green-400 font-medium' : 'text-[var(--color-vet-muted)]'}`}>
                    {draftProgress.physicalExam ? '✅' : '⭕'} 
                    <span>Examen Físico</span>
                  </span>
                  <span className={`flex items-center gap-1.5 ${draftProgress.diagnosis ? 'text-green-400 font-medium' : 'text-[var(--color-vet-muted)]'}`}>
                    {draftProgress.diagnosis ? '✅' : '⭕'} 
                    <span>Diagnóstico</span>
                  </span>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate("create")}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-1.5"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    Continuar consulta
                  </button>
                  <button
                    onClick={() => setShowDiscardDraftModal(true)}
                    className="px-4 py-2 bg-[var(--color-card)] hover:bg-[var(--color-hover)] border-2 border-amber-500/30 text-amber-400 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Descartar borrador
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de consultas */}
      {consultations.length > 0 ? (
        <div className="space-y-3">
          {consultations.map((consultation) => (
            <div
              key={consultation._id}
              className="group flex items-center gap-4 p-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-vet-accent)]/50 hover:shadow-md transition-all"
            >
              {/* Icono */}
              <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600/20 transition-colors border border-blue-500/20">
                <Stethoscope className="w-5 h-5 text-blue-400" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--color-vet-text)] truncate group-hover:text-[var(--color-vet-accent)] transition-colors">
                  {consultation.presumptiveDiagnosis}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-vet-muted)]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(consultation.consultationDate)}
                  </span>
                  <span className="truncate max-w-[200px]">
                    {consultation.reasonForVisit}
                  </span>
                </div>
              </div>

              {/* Precio */}
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-green-400 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {consultation.cost ? consultation.cost.toFixed(2) : "0.00"}
                </p>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setSelectedConsultation(consultation);
                    setShowViewModal(true);
                  }}
                  className="p-2 rounded-lg text-[var(--color-vet-muted)] hover:text-[var(--color-vet-accent)] hover:bg-[var(--color-vet-accent)]/10 transition-colors"
                  title="Ver detalles"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setConsultationToDelete(consultation);
                    setShowDeleteModal(true);
                  }}
                  className="p-2 rounded-lg text-[var(--color-vet-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Eliminar consulta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gradient-to-br from-[var(--color-hover)] to-blue-600/10 rounded-xl border-2 border-dashed border-[var(--color-border)]">
          <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-hover)] rounded-full flex items-center justify-center border border-[var(--color-border)]">
            <Stethoscope className="w-8 h-8 text-[var(--color-vet-muted)]" />
          </div>
          <h3 className="text-[var(--color-vet-text)] font-semibold mb-2">Sin consultas finalizadas</h3>
          <p className="text-[var(--color-vet-muted)] text-sm mb-6">
            {draft 
              ? "Tienes un borrador sin finalizar. Complétalo para verlo aquí." 
              : "Registra la primera consulta médica de este paciente"
            }
          </p>
          <Link
            to="create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-vet-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-vet-secondary)] transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            {draft ? "Continuar borrador" : "Registrar primera consulta"}
          </Link>
        </div>
      )}

      {/* Modal Descartar Borrador */}
      <ConfirmationModal
        isOpen={showDiscardDraftModal}
        onClose={() => setShowDiscardDraftModal(false)}
        onConfirm={handleDiscardDraft}
        title="Descartar borrador"
        message={
          <div className="space-y-2">
            <p className="text-[var(--color-vet-text)]">
              ¿Estás seguro de que deseas eliminar este borrador?
            </p>
            <div className="text-sm text-[var(--color-vet-muted)] bg-amber-600/10 p-3 rounded-lg border border-amber-500/30">
              <p className="font-medium text-amber-400 mb-1">Se perderá:</p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-400/80">
                {draft?.reasonForVisit && <li>Motivo de consulta registrado</li>}
                {draft?.temperature && <li>Datos del examen físico</li>}
                {draft?.presumptiveDiagnosis && <li>Diagnóstico preliminar</li>}
              </ul>
            </div>
            <p className="text-sm text-red-400 font-medium">
              ⚠️ Esta acción no se puede deshacer
            </p>
          </div>
        }
        confirmText="Sí, descartar"
        cancelText="Cancelar"
        confirmIcon={Trash2}
        variant="danger"
        isLoading={isDeletingDraft}
        loadingText="Eliminando..."
      />

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

      {/* Modal Eliminar Consulta */}
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