import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLabExamsByPatient, deleteLabExam } from "../../api/labExamAPI";
import {
  FlaskConical,
  Plus,
  Calendar,
  Eye,
  Trash2,
  Printer,
  Loader2,
  FileSearch,
} from "lucide-react";
import { toast } from "../../components/Toast";

// TUS COMPONENTES
import ConfirmationModal from "../../components/modal/ConfirmationModal";
import LabExamModal from "../../components/labexam/LabExamModal";
import ShareResultsModal from "../../components/ShareResultsModal";
import type { LabExam } from "../../types/labExam";
import { getPatientById } from "../../api/patientAPI";

export default function PatientLabExamListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const queryClient = useQueryClient();

  // Estados para controlar los 3 modales
  const [selectedExam, setSelectedExam] = useState<LabExam | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<LabExam | null>(null);

  // Queries
  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ["labExams", "patient", patientId],
    queryFn: () => getLabExamsByPatient(patientId!),
    enabled: !!patientId,
  });

  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  // Mutación de borrado
  const { mutate: removeExam, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteLabExam(id),
    onSuccess: () => {
      toast.success("Registro Eliminado", "El hemograma ha sido removido del historial.");
      queryClient.invalidateQueries({ queryKey: ["labExams", "patient", patientId] });
      setIsDeleteModalOpen(false);
      setExamToDelete(null);
    },
    onError: (error: Error) => toast.error("Error", error.message),
  });

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });

  if (examsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800/50">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sincronizando Laboratorio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-cyan-500 rounded-full" />
          <div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase">Laboratorio</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {exams.length} Analíticas registradas
            </p>
          </div>
        </div>
        <Link
          to="create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-cyan-900/20 uppercase tracking-widest"
        >
          <Plus size={16} /> Nuevo Registro
        </Link>
      </div>

      {/* Lista */}
      {exams.length > 0 ? (
        <div className="grid gap-3">
          {exams.map((exam) => (
            <div
              key={exam._id}
              className="group flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:border-slate-500 hover:bg-slate-800 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center flex-shrink-0 border border-slate-700">
                <FlaskConical className="w-6 h-6 text-slate-400 group-hover:text-cyan-500" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-200 uppercase text-xs tracking-wider mb-1">Hemograma Automatizado</p>
                <div className="flex items-center gap-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  <span className="flex items-center gap-1.5"><Calendar size={14} className="text-cyan-600"/> {formatDate(exam.date)}</span>
                  {exam._id && (
                    <span className="pl-3 border-l border-slate-700 font-black text-white">Ref: {exam._id.slice(-5)}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/50">
                {/* BOTÓN PARA IMPRIMIR (ShareResultsModal) */}
                <button
                  onClick={() => {
                    setSelectedExam(exam);
                    setShowShareModal(true);
                  }}
                  className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-all"
                  title="Generar PDF"
                >
                  <Printer size={18} />
                </button>

                <button
                  onClick={() => {
                    setSelectedExam(exam);
                    setShowViewModal(true);
                  }}
                  className="p-2 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                  title="Ver Detalle"
                >
                  <Eye size={18} />
                </button>

                <button
                  onClick={() => {
                    setExamToDelete(exam);
                    setIsDeleteModalOpen(true);
                  }}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/20 rounded-[2.5rem] border-2 border-dashed border-slate-800/50">
          <FileSearch className="w-12 h-12 text-slate-800 mx-auto mb-4" />
          <h3 className="text-slate-500 font-black uppercase tracking-widest text-xs">Sin Historial</h3>
        </div>
      )}

      {/* 1. MODAL DE VISTA RÁPIDA */}
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

      {/* 2. MODAL DE IMPRESIÓN (PDF) */}
      {selectedExam && patient && (
        <ShareResultsModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedExam(null);
          }}
          examData={selectedExam}
          patientData={{
            name: patient.name,
            species: patient.species,
            breed: patient.breed || '',
            owner: { 
              name: selectedExam.ownerName || (typeof patient.owner === 'object' ? patient.owner.name : ''),
              contact: selectedExam.ownerPhone || ''
            },
            mainVet: selectedExam.treatingVet || patient.mainVet
          }}
        />
      )}

      {/* 3. MODAL DE BORRADO (ConfirmationModal Variant Danger) */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setExamToDelete(null);
        }}
        onConfirm={() => examToDelete?._id && removeExam(examToDelete._id)}
        variant="danger"
        title="¿Eliminar Registro?"
        message={`¿Estás seguro de que deseas eliminar el hemograma del ${examToDelete ? formatDate(examToDelete.date) : ""}? Esta acción es permanente.`}
        confirmText="Sí, Eliminar"
        confirmIcon={Trash2}
        isLoading={isDeleting}
      />
    </div>
  );
}