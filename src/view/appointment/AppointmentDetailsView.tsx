// src/views/appointment/AppointmentDetailsView.tsx

import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAppointmentById, deleteAppointment, updateAppointmentStatus } from "../../api/appointmentAPI";
import { useState, useEffect } from "react";
import { toast } from "../../components/Toast";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { 
  Calendar, 
  Clock, 
  FileText,
  Edit, 
  Trash2,
  ArrowLeft,
  XCircle,
  ClipboardList,
  MessageSquareText,
} from "lucide-react";
import type { AppointmentStatus } from "../../types/appointment";
import StatusDropdown from "../../components/appointments/StatusDropdown";

export default function AppointmentDetailsView() {
  const { appointmentId, patientId } = useParams<{ appointmentId: string; patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Query para obtener los detalles de la cita
  const { data: appointment, isLoading, error } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: () => getAppointmentById(appointmentId!),
    enabled: !!appointmentId,
  });

  // Mutation para eliminar la cita
  const { mutate: deleteAppointmentMutate, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteAppointment(appointmentId!),
    onSuccess: () => {
      toast.success("✅ Cita eliminada con éxito");
      queryClient.invalidateQueries({ queryKey: ["activeAppointments", patientId] });
      queryClient.invalidateQueries({ queryKey: ["appointments", patientId] });
      navigate(`/patients/${patientId}`);
    },
    onError: (error: Error) => {
      toast.error(` ${error.message}`);
    },
  });

  // Mutation para actualizar el estado
  const { mutate: updateStatusMutate, isPending: isUpdatingStatus } = useMutation({
    mutationFn: (status: AppointmentStatus) => 
      updateAppointmentStatus(appointmentId!, { status }),
    onSuccess: () => {
      toast.success("Estado actualizado con éxito");
      queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
      queryClient.invalidateQueries({ queryKey: ["activeAppointments", patientId] });
      queryClient.invalidateQueries({ queryKey: ["appointments", patientId] });
    },
    onError: (error: Error) => {
      toast.error(` ${error.message}`);
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
    updateStatusMutate(status);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-vet-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Error al cargar la cita</h2>
        <p className="text-gray-500 mb-6">{(error as Error).message}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      </div>
    );
  }

  // Not Found State
  if (!appointment) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Cita no encontrada</h2>
        <p className="text-gray-500 mb-6">La cita que buscas no existe o fue eliminada</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      </div>
    );
  }

  // Formatear fecha y hora
  const appointmentDate = new Date(appointment.date);
  const formattedDate = appointmentDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = appointmentDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Configuración de colores por estado (para el header)
  const statusColors: Record<string, { bg: string; border: string }> = {
    'Programada': { bg: 'bg-blue-50', border: 'border-blue-200' },
    'Completada': { bg: 'bg-emerald-50', border: 'border-emerald-200' },
    'Cancelada': { bg: 'bg-red-50', border: 'border-red-200' },
    'No asistió': { bg: 'bg-amber-50', border: 'border-amber-200' },
  };

  const currentStatusColors = statusColors[appointment.status] || statusColors['Programada'];

  return (
    <div className={`max-w-4xl mx-auto transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      
      {/* Card Principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        
        {/* Header con Estado y Dropdown */}
        <div className={`px-6 py-4 ${currentStatusColors.bg} border-b ${currentStatusColors.border}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Estado de la cita</p>
              <p className="text-lg font-semibold text-gray-800">Gestionar Estado</p>
            </div>
            
            {/* Dropdown de Estado */}
            <StatusDropdown
              currentStatus={appointment.status}
              onStatusChange={handleStatusUpdate}
              isUpdating={isUpdatingStatus}
            />
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="p-6">
          
          {/* Fecha y Hora - Destacado */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 rounded-xl bg-vet-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-7 h-7 text-vet-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-0.5">Fecha programada</p>
                <p className="text-lg font-semibold text-gray-800 capitalize">{formattedDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:border-l sm:pl-6 border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-vet-accent/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-7 h-7 text-vet-accent" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-0.5">Hora</p>
                <p className="text-lg font-semibold text-gray-800">{formattedTime}</p>
              </div>
            </div>
          </div>

          {/* Tipo de Cita */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="w-5 h-5 text-vet-primary" />
              <h3 className="font-semibold text-gray-800">Tipo de Cita</h3>
            </div>
            <div className="inline-flex items-center px-4 py-2 rounded-lg bg-vet-primary/10 text-vet-primary font-medium">
              {appointment.type}
            </div>
          </div>

          {/* Motivo */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-vet-primary" />
              <h3 className="font-semibold text-gray-800">Motivo de la Consulta</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {appointment.reason || (
                  <span className="text-gray-400 italic">Sin motivo especificado</span>
                )}
              </p>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquareText className="w-5 h-5 text-vet-primary" />
              <h3 className="font-semibold text-gray-800">Observaciones</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {appointment.observations || (
                  <span className="text-gray-400 italic">Sin observaciones adicionales</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <button
          onClick={() => navigate(`/patients/${patientId}`)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors order-2 sm:order-1"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al Paciente
        </button>
        
        <div className="flex gap-3 order-1 sm:order-2">
          <button
            onClick={() => navigate(`/patients/${patientId}/appointments/${appointmentId}/edit`)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-vet-primary hover:bg-vet-primary/90 text-white font-medium transition-colors shadow-lg shadow-vet-primary/25"
          >
            <Edit className="w-5 h-5" />
            Editar Cita
          </button>
          
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border-2 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 font-medium transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
            <span className="hidden sm:inline">{isDeleting ? 'Eliminando...' : 'Eliminar'}</span>
          </button>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        petName={`la cita del ${formattedDate} a las ${formattedTime}`}
        isDeleting={isDeleting}
      />
    </div>
  );
}