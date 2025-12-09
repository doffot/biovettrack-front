// src/views/consultations/ConsultationListView.tsx
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Stethoscope,
  Plus,
  Calendar,
  Trash2,
  Eye,
  DollarSign,
} from "lucide-react";
import { getConsultationsByPatient, deleteConsultation } from "../../api/consultationAPI";
import { toast } from "../../components/Toast";
import type { Consultation } from "../../types/consultation";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import ConsultationModal from "../../components/consultations/ConsultationModal";

export default function ConsultationListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const queryClient = useQueryClient();

  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState<Consultation | null>(null);

  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ["consultations", patientId],
    queryFn: () => getConsultationsByPatient(patientId!),
    enabled: !!patientId,
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
            {consultations.length} registrada{consultations.length !== 1 ? "s" : ""}
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

      {/* Lista */}
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

              {/* Precio */}
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-gray-900 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {consultation.cost.toFixed(2)}
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
          <p className="text-gray-500 mb-4">Sin consultas registradas</p>
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