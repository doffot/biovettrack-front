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
  Stethoscope, 
  Edit, 
  Trash2,
  ArrowLeft,
} from "lucide-react";
import type { AppointmentStatus } from "../../types/appointment";
import UpdateStatusModal from "../../components/appointments/UpdateStatusModal";

export default function AppointmentDetailsView() {
  const { appointmentId, patientId } = useParams<{ appointmentId: string; patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Query para obtener los detalles de la cita
  const {  data:appointment, isLoading, error } = useQuery({
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
      toast.success(" Estado actualizado con éxito");
      queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
      queryClient.invalidateQueries({ queryKey: ["activeAppointments", patientId] });
      queryClient.invalidateQueries({ queryKey: ["appointments", patientId] });
      setShowStatusModal(false);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-vet-primary border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Cargando cita...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
          <Stethoscope className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Error al cargar la cita</h2>
        <p className="text-gray-400 mb-4">{(error as Error).message}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
          <Stethoscope className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Cita no encontrada</h2>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
      </div>
    );
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const { date: formattedDate, time } = formatDateTime(appointment.date);

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completada':
        return 'bg-green-500/10 text-green-500';
      case 'Cancelada':
        return 'bg-red-500/10 text-red-500';
      case 'No asistió':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'Programada':
      default:
        return 'bg-blue-500/10 text-blue-500';
    }
  };

  return (
    <div className={`max-w-7xl mx-auto transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      
      {/* Contenido principal */}
      <div className="space-y-6">
        {/* Tarjeta  */}
        <div className="bg-white rounded-xl p-6 shadow-card ">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-vet-primary">Detalles de la Cita</h2>
          </div>
          
          {/* Información de la cita  */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            {/* Fecha y Hora */}
            <div className="border-l-4 border-vet-accent pl-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-vet-primary rounded-lg text-white">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-vet-text font-medium">Fecha y Hora</h3>
              </div>
              <p className="text-vet-text font-semibold capitalize">{formattedDate}</p>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4" />
                {time}
              </p>
            </div>

            {/* Tipo de Cita */}
            <div className="border-l-4 border-vet-accent pl-4">
              <div className="flex items-center gap-3 mb-2">
                
                <h3 className="text-vet-primary font-medium">Tipo de Cita</h3>
              </div>
              <p className="text-vet-text font-semibold text-lg">{appointment.type}</p>
            </div>

            {/* Estado */}
            <div className="border-l-4 border-vet-accent pl-4">
              <div className="flex items-center gap-3 mb-2">
                
                <h3 className="text-vet-primary font-medium">Estado</h3>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold shadow-black/40 shadow-md ${getStatusColor(appointment.status)}`}>
                {appointment.status}
              </span>
            </div>
          </div>
<div className=" border border-gray-200 mb-4"></div>
          {/* Detalles */}
          <div className="grid grid-cols-1 gap-4">
            {/* Motivo */}
            <div className="border-l-4 border-vet-accent pl-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-vet-primary rounded-lg text-white">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="text-vet-text font-medium">Motivo / Detalle</h3>
              </div>
              <p className="text-vet-text whitespace-pre-wrap min-h-[60px]">
                {appointment.reason || 'Sin motivo especificado'}
              </p>
            </div>
<div className=" border border-gray-200 mb-2"></div>
            {/* Observaciones */}
            <div className="border-l-4 border-vet-accent pl-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-vet-primary rounded-lg text-white">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="text-vet-text font-medium">Observaciones</h3>
              </div>
              <p className="text-vet-text whitespace-pre-wrap min-h-[60px]">
                {appointment.observations || 'Sin observaciones'}
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción - Abajo de todo */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setShowStatusModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-vet-primary hover:bg-vet-accent text-white font-medium transition-colors"
            title="Actualizar estado"
          >
            <Edit className="w-4 h-4" />
            Actualizar Estado
          </button>
          
          <button
            onClick={() => navigate(`/patients/${patientId}/appointments/${appointmentId}/edit`)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-vet-accent hover:bg-vet-primary  text-white font-medium transition-colors"
            title="Editar cita"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
          
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-vet-danger hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-50"
            title="Eliminar cita"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        petName={`la cita del ${formattedDate} a las ${time}`}
        isDeleting={isDeleting}
      />

      {/* Modal de Actualización de Estado */}
      <UpdateStatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onSubmit={handleStatusUpdate}
        currentStatus={appointment.status}
        isUpdating={isUpdatingStatus}
      />
    </div>
  );
}