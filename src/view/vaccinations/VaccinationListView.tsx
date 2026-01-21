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
  ChevronRight,
  Building2,
} from "lucide-react";
import { getVaccinationsByPatient, deleteVaccination } from "../../api/vaccinationAPI";
import { toast } from "../../components/Toast";
import type { Vaccination } from "../../types/vaccination";
import ConfirmationModal from "../../components/modal/ConfirmationModal";
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
      toast.success(
        "Vacuna eliminada",
        "El registro ha sido removido del esquema de vacunación"
      );
      queryClient.invalidateQueries({ queryKey: ["vaccinations", patientId] });
      setShowDeleteModal(false);
      setVaccinationToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(
        "Error al eliminar",
        error.message || "No se pudo eliminar la vacuna"
      );
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
    const diffDays = Math.ceil(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays >= 0 && diffDays <= 30;
  };

  const isPastDue = (dateStr?: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
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
          <h2 className="text-lg sm:text-xl font-bold text-[var(--color-vet-text)]">Esquema de Vacunación</h2>
          <p className="text-xs sm:text-sm text-[var(--color-vet-muted)] mt-0.5">
            {vaccinations.length} vacuna{vaccinations.length !== 1 ? "s" : ""} registrada{vaccinations.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          to="create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] hover:shadow-lg hover:scale-105 active:scale-95 text-white text-sm font-semibold rounded-lg transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Vacuna</span>
        </Link>
      </div>

      {/* Lista */}
      {vaccinations.length > 0 ? (
        <div className="space-y-3">
          {vaccinations.map((vaccination) => (
            <div
              key={vaccination._id}
              className="group bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-vet-primary)] transition-all overflow-hidden"
            >
              {/* Desktop Layout */}
              <div className="hidden md:flex items-center gap-4 p-4">
                {/* Icono */}
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Syringe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[var(--color-vet-text)]">
                      {vaccination.vaccineType}
                    </p>
                    {vaccination.laboratory && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <Building2 className="w-3 h-3" />
                        {vaccination.laboratory}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-vet-muted)] flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(vaccination.vaccinationDate)}
                    </span>
                    {vaccination.nextVaccinationDate && (
                      <span
                        className={`flex items-center gap-1 font-medium ${
                          isPastDue(vaccination.nextVaccinationDate)
                            ? "text-red-600 dark:text-red-400"
                            : isUpcoming(vaccination.nextVaccinationDate)
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-[var(--color-vet-muted)]"
                        }`}
                      >
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
                  <p className="font-semibold text-[var(--color-vet-text)]">
                    ${vaccination.cost.toFixed(2)}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => {
                      setSelectedVaccination(vaccination);
                      setShowViewModal(true);
                    }}
                    className="p-2 rounded-lg text-[var(--color-vet-muted)] hover:text-[var(--color-vet-accent)] hover:bg-[var(--color-vet-primary)]/10 transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setVaccinationToDelete(vaccination);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 rounded-lg text-[var(--color-vet-muted)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile/Tablet Layout */}
              <div className="md:hidden">
                {/* Header Card */}
                <div className="flex items-start gap-3 p-3 sm:p-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Syringe className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Título y precio */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[var(--color-vet-text)] text-sm sm:text-base">
                          {vaccination.vaccineType}
                        </h3>
                        {vaccination.laboratory && (
                          <div className="flex items-center gap-1 mt-1">
                            <Building2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                              {vaccination.laboratory}
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="font-bold text-[var(--color-vet-primary)] text-sm sm:text-base flex-shrink-0">
                        ${vaccination.cost.toFixed(2)}
                      </p>
                    </div>

                    {/* Fechas */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-[var(--color-vet-muted)]">
                        <Calendar className="w-3 h-3" />
                        <span>Aplicada: {formatDate(vaccination.vaccinationDate)}</span>
                      </div>

                      {vaccination.nextVaccinationDate && (
                        <div
                          className={`flex items-center gap-2 text-xs font-medium ${
                            isPastDue(vaccination.nextVaccinationDate)
                              ? "text-red-600 dark:text-red-400"
                              : isUpcoming(vaccination.nextVaccinationDate)
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-[var(--color-vet-muted)]"
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>Próxima: {formatDate(vaccination.nextVaccinationDate)}</span>
                          {isPastDue(vaccination.nextVaccinationDate) && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10">
                              <AlertCircle className="w-3 h-3" />
                              <span className="text-[10px] font-semibold">Vencida</span>
                            </div>
                          )}
                          {isUpcoming(vaccination.nextVaccinationDate) && !isPastDue(vaccination.nextVaccinationDate) && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10">
                              <span className="text-[10px] font-semibold">Próxima</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Lote si existe */}
                    {vaccination.batchNumber && (
                      <p className="text-[10px] text-[var(--color-vet-muted)] mt-2">
                        Lote: {vaccination.batchNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Acciones móvil */}
                <div className="border-t border-[var(--color-border)] bg-[var(--color-hover)]/50 px-3 py-2 sm:px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedVaccination(vaccination);
                        setShowViewModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white text-sm font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Detalles</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </button>
                    <button
                      onClick={() => {
                        setVaccinationToDelete(vaccination);
                        setShowDeleteModal(true);
                      }}
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
      ) : (
        <div className="text-center py-12 sm:py-16 bg-[var(--color-card)] rounded-xl border-2 border-dashed border-[var(--color-border)]">
          <Syringe className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-[var(--color-vet-muted)] opacity-50 mb-3" />
          <p className="text-[var(--color-vet-muted)] mb-4 text-sm sm:text-base px-4">
            Sin vacunas registradas en el esquema
          </p>
          <Link
            to="create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
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
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setVaccinationToDelete(null);
        }}
        onConfirm={() =>
          vaccinationToDelete?._id && removeVaccination(vaccinationToDelete._id)
        }
        title="¿Eliminar vacuna?"
        message={
          <div className="space-y-2">
            <p className="text-[var(--color-vet-text)]">
              ¿Estás seguro de eliminar la vacuna{" "}
              <strong className="text-[var(--color-vet-primary)]">
                {vaccinationToDelete?.vaccineType}
              </strong>
              ?
            </p>
            {vaccinationToDelete?.nextVaccinationDate && (
              <div className="text-sm text-[var(--color-vet-muted)] bg-[var(--color-hover)] p-3 rounded-lg">
                <p className="font-medium mb-1">
                  Próxima dosis programada para:{" "}
                  {formatDate(vaccinationToDelete.nextVaccinationDate)}
                </p>
                <p>También se perderá esta información.</p>
              </div>
            )}
            <p className="text-sm text-[var(--color-vet-muted)]">
              Esta acción no se puede deshacer.
            </p>
          </div>
        }
        confirmText="Sí, eliminar vacuna"
        cancelText="Cancelar"
        confirmIcon={Trash2}
        variant="danger"
        isLoading={isDeleting}
        loadingText="Eliminando..."
      />
    </div>
  );
}