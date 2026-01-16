import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAppointmentById, 
  deleteAppointment, 
  updateAppointmentStatus,
} from "../../api/appointmentAPI";
import { getPatientById } from "../../api/patientAPI";
import { useState, useEffect } from "react";
import { toast } from "../../components/Toast";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { 
  Edit, 
  Trash2,
  ArrowLeft,
  Scissors,
  Plus,
  AlertTriangle,
  Calendar,
  Phone,
  User,
  PawPrint,
} from "lucide-react";
import type { AppointmentStatus } from "../../types/appointment";
import StatusDropdown from "../../components/appointments/StatusDropdown";

type PopulatedOwner = {
  _id: string;
  name: string;
  lastName?: string;
  contact?: string;
  email?: string;
  address?: string;
};

export default function AppointmentDetailsView() {
  const { appointmentId, patientId } = useParams<{ appointmentId: string; patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { data: appointment, isLoading, error } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: () => getAppointmentById(appointmentId!),
    enabled: !!appointmentId,
  });

  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  const { mutate: deleteAppointmentMutate, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteAppointment(appointmentId!),
    onSuccess: () => {
      toast.success("Cita eliminada con éxito");
      queryClient.invalidateQueries({ queryKey: ["activeAppointments", patientId] });
      queryClient.invalidateQueries({ queryKey: ["appointments", patientId] });
      navigate(`/patients/${patientId}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const { mutate: updateStatusMutate, isPending: isUpdatingStatus } = useMutation({
    mutationFn: async ({ status, shouldRefund }: { status: AppointmentStatus; shouldRefund?: boolean }) => {
      return updateAppointmentStatus(appointmentId!, { status, shouldRefund });
    },
    onSuccess: () => {
      toast.success("Estado actualizado");
      queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
      queryClient.invalidateQueries({ queryKey: ["activeAppointments", patientId] });
      queryClient.invalidateQueries({ queryKey: ["appointments", patientId] });
      queryClient.invalidateQueries({ queryKey: ["groomingServices", patientId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      setShowCancelModal(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = () => {
    deleteAppointmentMutate();
    setShowDeleteModal(false);
  };

  const handleStatusUpdate = (status: AppointmentStatus) => {
    if (status === "Cancelada" && appointment?.prepaidAmount && appointment.prepaidAmount > 0) {
      setShowCancelModal(true);
      return;
    }
    updateStatusMutate({ status });
  };

  const handleCancelWithRefund = (shouldRefund: boolean) => {
    updateStatusMutate({ status: "Cancelada", shouldRefund });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[var(--color-vet-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--color-vet-muted)] mb-4">
          {error ? "Error al cargar la cita" : "Cita no encontrada"}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="text-[var(--color-vet-primary)] hover:underline text-sm font-medium"
        >
          ← Volver
        </button>
      </div>
    );
  }

  const appointmentDate = new Date(appointment.date);
  const formattedDate = appointmentDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const formattedTime = appointmentDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const canCreateService = appointment.type === "Peluquería" && 
                          (appointment.status === "Programada" || appointment.status === "Completada");

  const owner = patient?.owner && typeof patient.owner === "object" 
    ? (patient.owner as PopulatedOwner) 
    : null;
  const ownerName = owner ? `${owner.name} ${owner.lastName || ""}`.trim() : null;
  const ownerPhone = owner?.contact || null;
  const ownerId = owner?._id || (typeof patient?.owner === "string" ? patient.owner : null);

  return (
    <div className={`max-w-2xl mx-auto transition-all duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(`/patients/${patientId}`)}
          className="text-[var(--color-vet-muted)] hover:text-[var(--color-vet-text)] transition-colors text-sm font-medium flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/patients/${patientId}/appointments/${appointmentId}/edit`)}
            className="p-2 rounded-lg hover:bg-[var(--color-hover)] text-[var(--color-vet-muted)] hover:text-[var(--color-vet-accent)] transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            className="p-2 rounded-lg hover:bg-red-600/10 text-[var(--color-vet-muted)] hover:text-red-400 transition-colors disabled:opacity-50"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card principal */}
      <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-soft overflow-hidden">
        
        {/* Header de la card */}
        <div className="bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] px-6 py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Cita</p>
              <h1 className="text-white font-bold text-lg">{appointment.type}</h1>
            </div>
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <p className="text-white font-semibold capitalize">{formattedDate}</p>
              <p className="text-white/80 text-sm">{formattedTime}</p>
            </div>
            
            <StatusDropdown
              currentStatus={appointment.status}
              onStatusChange={handleStatusUpdate}
              isUpdating={isUpdatingStatus}
            />
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">

          {/* Paciente y Propietario */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Paciente */}
            <Link 
              to={`/patients/${patientId}`}
              className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-[var(--color-hover)] hover:bg-[var(--color-border)] transition-colors group border border-[var(--color-border)]"
            >
              {patient?.photo ? (
                <img 
                  src={patient.photo} 
                  alt={patient.name} 
                  className="w-12 h-12 rounded-xl object-cover border border-[var(--color-border)]"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[var(--color-vet-primary)]/10 flex items-center justify-center border border-[var(--color-vet-primary)]/20">
                  <PawPrint className="w-5 h-5 text-[var(--color-vet-accent)]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-[var(--color-vet-muted)] uppercase tracking-wider">Paciente</p>
                <p className="font-semibold text-[var(--color-vet-text)] truncate group-hover:text-[var(--color-vet-accent)] transition-colors">
                  {patient?.name || "—"}
                </p>
                <p className="text-xs text-[var(--color-vet-muted)]">{patient?.species} · {patient?.breed}</p>
              </div>
            </Link>

            {/* Propietario */}
            {ownerName && (
              <div className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-[var(--color-hover)] border border-[var(--color-border)]">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-vet-primary)]/10 flex items-center justify-center border border-[var(--color-vet-primary)]/20">
                  <User className="w-5 h-5 text-[var(--color-vet-accent)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-[var(--color-vet-muted)] uppercase tracking-wider">Propietario</p>
                  {ownerId ? (
                    <Link 
                      to={`/owners/${ownerId}`}
                      className="font-semibold text-[var(--color-vet-text)] truncate hover:text-[var(--color-vet-accent)] transition-colors block"
                    >
                      {ownerName}
                    </Link>
                  ) : (
                    <p className="font-semibold text-[var(--color-vet-text)] truncate">{ownerName}</p>
                  )}
                  {ownerPhone && (
                    <a 
                      href={`tel:${ownerPhone}`}
                      className="text-xs text-[var(--color-vet-accent)] hover:text-[var(--color-vet-primary)] flex items-center gap-1 mt-0.5"
                    >
                      <Phone className="w-3 h-3" />
                      {ownerPhone}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Prepago */}
          {appointment.prepaidAmount && appointment.prepaidAmount > 0 && (
            <div className="flex items-center justify-between py-3 px-4 bg-emerald-600/10 rounded-xl border border-emerald-500/20">
              <span className="text-sm font-medium text-emerald-400">Anticipo</span>
              <span className="font-bold text-emerald-300">
                ${appointment.prepaidAmount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Motivo */}
          <div>
            <h3 className="text-xs font-semibold text-[var(--color-vet-muted)] uppercase tracking-wider mb-2">
              Motivo de la cita
            </h3>
            <p className="text-[var(--color-vet-text)] leading-relaxed">
              {appointment.reason || (
                <span className="text-[var(--color-vet-muted)] italic">Sin especificar</span>
              )}
            </p>
          </div>

          {/* Observaciones */}
          {appointment.observations && (
            <div>
              <h3 className="text-xs font-semibold text-[var(--color-vet-muted)] uppercase tracking-wider mb-2">
                Observaciones
              </h3>
              <p className="text-[var(--color-vet-text)] leading-relaxed whitespace-pre-wrap">
                {appointment.observations}
              </p>
            </div>
          )}

          {/* Crear servicio de peluquería */}
          {canCreateService && (
            <div className="pt-4 border-t border-[var(--color-border)]">
              <Link
                to={`/patients/${patientId}/grooming-services/create?appointmentId=${appointmentId}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-vet-primary)]/10 hover:bg-[var(--color-vet-accent)] hover:text-white text-[var(--color-vet-accent)] text-sm font-medium transition-all"
              >
                <Scissors className="w-4 h-4" />
                <Plus className="w-3 h-3 -ml-1" />
                Crear servicio de peluquería
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[var(--color-hover)] border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between text-xs text-[var(--color-vet-muted)]">
            <span>
              Creada el {new Date(appointment.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
            {appointment.updatedAt !== appointment.createdAt && (
              <span>
                Editada el {new Date(appointment.updatedAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Modal de eliminación */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        petName={`la cita del ${formattedDate}`}
        isDeleting={isDeleting}
      />

      {/* Modal de cancelación con prepago */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[var(--color-card)] rounded-2xl shadow-xl max-w-sm w-full overflow-hidden border border-[var(--color-border)]">
            
            {/* Header del modal */}
            <div className="bg-amber-600/10 px-6 py-4 border-b border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600/20 flex items-center justify-center border border-amber-500/20">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-vet-text)]">Cancelar cita</h3>
                  <p className="text-sm text-[var(--color-vet-muted)]">
                    Anticipo de ${appointment?.prepaidAmount?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <p className="text-sm text-[var(--color-vet-muted)] mb-6">
                ¿Qué deseas hacer con el anticipo al cancelar esta cita?
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => handleCancelWithRefund(true)}
                  disabled={isUpdatingStatus}
                  className="w-full py-3 px-4 rounded-xl bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isUpdatingStatus ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Reembolsar anticipo"
                  )}
                </button>
                
                <button
                  onClick={() => handleCancelWithRefund(false)}
                  disabled={isUpdatingStatus}
                  className="w-full py-3 px-4 rounded-xl bg-[var(--color-hover)] hover:bg-[var(--color-border)] text-[var(--color-vet-text)] font-medium transition-colors disabled:opacity-50 border border-[var(--color-border)]"
                >
                  Mantener como crédito
                </button>

                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={isUpdatingStatus}
                  className="w-full py-2 text-sm text-[var(--color-vet-muted)] hover:text-[var(--color-vet-text)] transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}