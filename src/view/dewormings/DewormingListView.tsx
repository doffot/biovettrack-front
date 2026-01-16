// src/views/dewormings/DewormingListView.tsx
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Bug, 
  Plus, 
  Calendar, 
  Clock,
  Trash2,
  Eye,
  AlertCircle
} from "lucide-react";
import { getDewormingsByPatient, deleteDeworming } from "../../api/dewormingAPI";
import { toast } from "../../components/Toast";
import type { Deworming } from "../../types/deworming";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import DewormingModal from "../../components/dewormings/DewormingModal";

const typeColors: Record<string, string> = {
  "Interna": "bg-purple-900/30 text-purple-400 border border-purple-700",
  "Externa": "bg-blue-900/30 text-blue-400 border border-blue-700",
  "Ambas": "bg-emerald-900/30 text-emerald-400 border border-emerald-700",
};

export default function DewormingListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const queryClient = useQueryClient();
  
  const [selectedDeworming, setSelectedDeworming] = useState<Deworming | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dewormingToDelete, setDewormingToDelete] = useState<Deworming | null>(null);

  const { data: dewormings = [], isLoading } = useQuery({
    queryKey: ["dewormings", patientId],
    queryFn: () => getDewormingsByPatient(patientId!),
    enabled: !!patientId,
  });

  const { mutate: removeDeworming, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteDeworming(id),
    onSuccess: () => {
      toast.success("Desparasitación eliminada");
      queryClient.invalidateQueries({ queryKey: ["dewormings", patientId] });
      setShowDeleteModal(false);
      setDewormingToDelete(null);
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

  const isPastDue = (dateStr?: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  const isUpcoming = (dateStr?: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
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
          <h2 className="text-lg font-bold text-vet-text">Desparasitación</h2>
          <p className="text-sm text-vet-muted">{dewormings.length} registro{dewormings.length !== 1 ? "s" : ""}</p>
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
      {dewormings.length > 0 ? (
        <div className="space-y-3">
          {dewormings.map((deworming) => (
            <div
              key={deworming._id}
              className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors"
            >
              {/* Icono */}
              <div className="w-10 h-10 rounded-lg bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                <Bug className="w-5 h-5 text-orange-400" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-vet-text">{deworming.productName}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[deworming.dewormingType]}`}>
                    {deworming.dewormingType}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-vet-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(deworming.applicationDate)}
                  </span>
                  <span>Dosis: {deworming.dose}</span>
                  {deworming.nextApplicationDate && (
                    <span className={`flex items-center gap-1 ${
                      isPastDue(deworming.nextApplicationDate)
                        ? "text-red-400"
                        : isUpcoming(deworming.nextApplicationDate)
                        ? "text-amber-400"
                        : "text-vet-muted"
                    }`}>
                      <Clock className="w-3 h-3" />
                      Próxima: {formatDate(deworming.nextApplicationDate)}
                      {isPastDue(deworming.nextApplicationDate) && (
                        <AlertCircle className="w-3 h-3" />
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Precio */}
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-vet-text">${deworming.cost.toFixed(2)}</p>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => {
                    setSelectedDeworming(deworming);
                    setShowViewModal(true);
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-vet-accent hover:bg-vet-primary/10 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setDewormingToDelete(deworming);
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
          <Bug className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-vet-muted mb-4">Sin registros de desparasitación</p>
          <Link
            to="create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-vet-primary text-white text-sm font-medium rounded-lg hover:bg-vet-secondary transition-colors"
          >
            <Plus className="w-4 h-4" />
            Registrar primera
          </Link>
        </div>
      )}

      {/* Modal Ver */}
      {selectedDeworming && (
        <DewormingModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedDeworming(null);
          }}
          deworming={selectedDeworming}
        />
      )}

      {/* Modal Eliminar */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDewormingToDelete(null);
        }}
        onConfirm={() => dewormingToDelete?._id && removeDeworming(dewormingToDelete._id)}
        petName={`la desparasitación con ${dewormingToDelete?.productName || ""}`}
        isDeleting={isDeleting}
      />
    </div>
  );
}