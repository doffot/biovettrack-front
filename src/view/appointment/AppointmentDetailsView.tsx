// src/views/appointments/AppointmentDetailsView.tsx
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAppointmentById, 
  deleteAppointment, 
  updateAppointmentStatus,
} from "../../api/appointmentAPI";
import { getPatientById } from "../../api/patientAPI";
import { useState } from "react";
import { toast } from "../../components/Toast";
import { 
  Edit, 
  Trash2,
  Scissors,
  Plus,
  Calendar,
  Phone,
  User,
  PawPrint,
  Clock,
  FileText,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import type { AppointmentStatus } from "../../types/appointment";
import StatusDropdown from "../../components/appointments/StatusDropdown";
import ConfirmationModal from "../../components/modal/ConfirmationModal";

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
  const [pendingCancelStatus, setPendingCancelStatus] = useState<AppointmentStatus | null>(null);

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
      toast.success("Cita eliminada", "La cita ha sido eliminada correctamente");
      queryClient.invalidateQueries({ queryKey: ["activeAppointments", patientId] });
      queryClient.invalidateQueries({ queryKey: ["appointments", patientId] });
      navigate(`/patients/${patientId}`);
    },
    onError: (error: Error) => {
      toast.error("Error al eliminar", error.message);
    },
  });

  const { mutate: updateStatusMutate, isPending: isUpdatingStatus } = useMutation({
    mutationFn: async ({ status, shouldRefund }: { status: AppointmentStatus; shouldRefund?: boolean }) => {
      return updateAppointmentStatus(appointmentId!, { status, shouldRefund });
    },
    onSuccess: () => {
      toast.success("Estado actualizado", "El estado de la cita ha sido actualizado");
      queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
      queryClient.invalidateQueries({ queryKey: ["activeAppointments", patientId] });
      queryClient.invalidateQueries({ queryKey: ["appointments", patientId] });
      queryClient.invalidateQueries({ queryKey: ["groomingServices", patientId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      setShowCancelModal(false);
      setPendingCancelStatus(null);
    },
    onError: (error: Error) => {
      toast.error("Error al actualizar", error.message);
    },
  });

  const handleDelete = () => {
    deleteAppointmentMutate();
  };

  const handleStatusUpdate = (status: AppointmentStatus) => {
    if (status === "Cancelada" && appointment?.prepaidAmount && appointment.prepaidAmount > 0) {
      setPendingCancelStatus(status);
      setShowCancelModal(true);
      return;
    }
    updateStatusMutate({ status });
  };

  const handleCancelWithRefund = (shouldRefund: boolean) => {
    if (pendingCancelStatus) {
      updateStatusMutate({ status: pendingCancelStatus, shouldRefund });
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[var(--color-vet-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-vet-muted)]">Cargando cita...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error || !appointment) {
    return (
      <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-[var(--color-vet-text)] font-medium mb-1">
            {error ? "Error al cargar la cita" : "Cita no encontrada"}
          </p>
          <p className="text-sm text-[var(--color-vet-muted)] mb-4">
            No pudimos encontrar la información solicitada
          </p>
          <button
            onClick={() => navigate(`/patients/${patientId}`)}
            className="text-[var(--color-vet-primary)] hover:text-[var(--color-vet-secondary)] text-sm font-medium transition-colors"
          >
            Volver al paciente
          </button>
        </div>
      </div>
    );
  }

  // Formatear fecha y hora
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

  // Owner data
  const owner = patient?.owner && typeof patient.owner === "object" 
    ? (patient.owner as PopulatedOwner) 
    : null;
  const ownerName = owner ? `${owner.name} ${owner.lastName || ""}`.trim() : null;
  const ownerPhone = owner?.contact || null;
  const ownerId = owner?._id || (typeof patient?.owner === "string" ? patient.owner : null);

  return (
    <>
      {/* Card única */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
        
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Info principal */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg font-montserrat">{appointment.type}</h1>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formattedTime}</span>
                  <span className="text-white/50">•</span>
                  <span className="capitalize">{formattedDate}</span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate(`/patients/${patientId}/appointments/${appointmentId}/edit`)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Editar cita"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
                className="p-2 rounded-lg bg-white/10 hover:bg-red-500/80 text-white transition-colors disabled:opacity-50"
                title="Eliminar cita"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal - Grid responsive */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            
            {/* Columna izquierda - Paciente, Propietario, Estado */}
            <div className="space-y-4">
              
              {/* Estado */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-hover)] border border-[var(--color-border)]">
                <span className="text-sm font-medium text-[var(--color-vet-muted)]">Estado</span>
                <StatusDropdown
                  currentStatus={appointment.status}
                  onStatusChange={handleStatusUpdate}
                  isUpdating={isUpdatingStatus}
                />
              </div>

              {/* Paciente */}
              <Link 
                to={`/patients/${patientId}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-hover)] hover:bg-[var(--color-border)] transition-colors border border-[var(--color-border)] group"
              >
                {patient?.photo ? (
                  <img 
                    src={patient.photo} 
                    alt={patient.name} 
                    className="w-11 h-11 rounded-xl object-cover border border-[var(--color-border)]"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-[var(--color-vet-primary)]/10 flex items-center justify-center border border-[var(--color-vet-primary)]/20">
                    <PawPrint className="w-5 h-5 text-[var(--color-vet-accent)]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-[var(--color-vet-muted)] uppercase tracking-wider font-medium">Paciente</p>
                  <p className="font-semibold text-[var(--color-vet-text)] truncate group-hover:text-[var(--color-vet-accent)] transition-colors">
                    {patient?.name || "—"}
                  </p>
                  <p className="text-xs text-[var(--color-vet-muted)]">{patient?.species} · {patient?.breed}</p>
                </div>
              </Link>

              {/* Propietario */}
              {ownerName && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-hover)] border border-[var(--color-border)]">
                  <div className="w-11 h-11 rounded-xl bg-[var(--color-vet-primary)]/10 flex items-center justify-center border border-[var(--color-vet-primary)]/20">
                    <User className="w-5 h-5 text-[var(--color-vet-accent)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[var(--color-vet-muted)] uppercase tracking-wider font-medium">Propietario</p>
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
                        className="text-xs text-[var(--color-vet-accent)] hover:text-[var(--color-vet-primary)] flex items-center gap-1 mt-0.5 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        {ownerPhone}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Prepago */}
              {appointment.prepaidAmount && appointment.prepaidAmount > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Anticipo</span>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ${appointment.prepaidAmount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Columna derecha - Motivo y Observaciones */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Motivo */}
              <div className="p-4 rounded-xl bg-[var(--color-hover)] border border-[var(--color-border)]">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-[var(--color-vet-primary)]" />
                  <h3 className="text-xs font-semibold text-[var(--color-vet-muted)] uppercase tracking-wider">
                    Motivo de la cita
                  </h3>
                </div>
                <p className="text-[var(--color-vet-text)] leading-relaxed">
                  {appointment.reason || (
                    <span className="text-[var(--color-vet-muted)] italic">Sin especificar</span>
                  )}
                </p>
              </div>

              {/* Observaciones */}
              {appointment.observations && (
                <div className="p-4 rounded-xl bg-[var(--color-hover)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-semibold text-[var(--color-vet-muted)] uppercase tracking-wider">
                      Observaciones
                    </h3>
                  </div>
                  <p className="text-[var(--color-vet-text)] leading-relaxed whitespace-pre-wrap">
                    {appointment.observations}
                  </p>
                </div>
              )}

              {/* Acción: Crear servicio de peluquería */}
              {canCreateService && (
                <Link
                  to={`/patients/${patientId}/grooming-services/create?appointmentId=${appointmentId}`}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white font-medium transition-colors"
                >
                  <Scissors className="w-4 h-4" />
                  <Plus className="w-3 h-3 -ml-1" />
                  Crear servicio de peluquería
                </Link>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-[var(--color-vet-muted)] pt-2">
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
        </div>
      </div>

      {/* Modal de eliminación */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar cita"
        message={
          <p className="text-[var(--color-vet-muted)]">
            ¿Estás seguro de eliminar la cita del <span className="font-semibold text-[var(--color-vet-text)]">{formattedDate}</span>? Esta acción no se puede deshacer.
          </p>
        }
        confirmText="Eliminar"
        confirmIcon={Trash2}
        variant="danger"
        isLoading={isDeleting}
        loadingText="Eliminando..."
      />

      {/* Modal de cancelación con prepago */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setPendingCancelStatus(null);
        }}
        onConfirm={() => handleCancelWithRefund(true)}
        title="Cancelar cita con anticipo"
        message={
          <div className="space-y-4">
            <p className="text-[var(--color-vet-muted)]">
              Esta cita tiene un anticipo de <span className="font-bold text-emerald-500">${appointment?.prepaidAmount?.toFixed(2)}</span>
            </p>
            <p className="text-[var(--color-vet-muted)]">¿Qué deseas hacer con el anticipo?</p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => handleCancelWithRefund(true)}
                disabled={isUpdatingStatus}
                className="w-full py-2.5 px-4 rounded-lg bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white font-medium transition-colors disabled:opacity-50"
              >
                Reembolsar anticipo
              </button>
              <button
                onClick={() => handleCancelWithRefund(false)}
                disabled={isUpdatingStatus}
                className="w-full py-2.5 px-4 rounded-lg bg-[var(--color-hover)] hover:bg-[var(--color-border)] text-[var(--color-vet-text)] font-medium transition-colors border border-[var(--color-border)] disabled:opacity-50"
              >
                Mantener como crédito
              </button>
            </div>
          </div>
        }
        confirmText=""
        variant="warning"
        isLoading={isUpdatingStatus}
        loadingText="Procesando..."
      />
    </>
  );
}