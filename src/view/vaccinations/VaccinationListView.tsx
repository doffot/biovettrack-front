// src/views/vaccinations/VaccinationListView.tsx
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Syringe, 
  Plus, 
  Calendar, 
  Clock,
  Trash2,
  Eye,
  AlertCircle,
} from "lucide-react";
import { getVaccinationsByPatient, deleteVaccination } from "../../api/vaccinationAPI";
import { toast } from "../../components/Toast";
import type { Vaccination } from "../../types/vaccination";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import VaccinationModal from "../../components/vaccinations/VaccinationModal";

export default function VaccinationListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const queryClient = useQueryClient();
  
  const [selectedVaccination, setSelectedVaccination] = useState<Vaccination | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vaccinationToDelete, setVaccinationToDelete] = useState<Vaccination | null>(null);

  const { data: vaccinations = [], isLoading } = useQuery({
    queryKey: ["vaccinations", patientId],
    queryFn: () => getVaccinationsByPatient(patientId!),
    enabled: !!patientId,
  });

  const { mutate: removeVaccination, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteVaccination(id),
    onSuccess: () => {
      toast.success("Vacuna eliminada");
      queryClient.invalidateQueries({ queryKey: ["vaccinations", patientId] });
      setShowDeleteModal(false);
      setVaccinationToDelete(null);
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

  const isUpcoming = (dateStr?: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  };

  const isPastDue = (dateStr?: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
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
          <h2 className="text-lg font-bold text-gray-900">Vacunas</h2>
          <p className="text-sm text-gray-500">{vaccinations.length} registrada{vaccinations.length !== 1 ? "s" : ""}</p>
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
      {vaccinations.length > 0 ? (
        <div className="space-y-3">
          {vaccinations.map((vaccination) => (
            <div
              key={vaccination._id}
              className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
            >
              {/* Icono */}
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Syringe className="w-5 h-5 text-emerald-600" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{vaccination.vaccineType}</p>
                  {vaccination.laboratory && (
                    <span className="text-xs text-gray-400">• {vaccination.laboratory}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(vaccination.vaccinationDate)}
                  </span>
                  {vaccination.nextVaccinationDate && (
                    <span className={`flex items-center gap-1 ${
                      isPastDue(vaccination.nextVaccinationDate)
                        ? "text-red-600"
                        : isUpcoming(vaccination.nextVaccinationDate)
                        ? "text-amber-600"
                        : "text-gray-500"
                    }`}>
                      <Clock className="w-3 h-3" />
                      Próxima: {formatDate(vaccination.nextVaccinationDate)}
                      {isPastDue(vaccination.nextVaccinationDate) && (
                        <AlertCircle className="w-3 h-3" />
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Precio */}
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-gray-900">${vaccination.cost.toFixed(2)}</p>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => {
                    setSelectedVaccination(vaccination);
                    setShowViewModal(true);
                  }}
                  className="p-2 rounded-lg text-gray-400 hover:text-vet-primary hover:bg-vet-primary/10 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setVaccinationToDelete(vaccination);
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
          <Syringe className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">Sin vacunas registradas</p>
          <Link
            to="create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-vet-primary text-white text-sm font-medium rounded-lg hover:bg-vet-secondary transition-colors"
          >
            <Plus className="w-4 h-4" />
            Registrar primera vacuna
          </Link>
        </div>
      )}

      {/* Modal Ver */}
      {selectedVaccination && (
        <VaccinationModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedVaccination(null);
          }}
          vaccination={selectedVaccination}
        />
      )}

      {/* Modal Eliminar */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setVaccinationToDelete(null);
        }}
        onConfirm={() => vaccinationToDelete?._id && removeVaccination(vaccinationToDelete._id)}
        petName={`la vacuna ${vaccinationToDelete?.vaccineType || ""}`}
        isDeleting={isDeleting}
      />
    </div>
  );
}