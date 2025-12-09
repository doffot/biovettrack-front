// src/views/patient/components/ActiveAppointmentsSection.tsx
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin } from "lucide-react";
import type { Appointment } from "../../types/appointment";

interface ActiveAppointmentsSectionProps {
  appointments: Appointment[] | undefined;
  patientId: string | undefined;
  isLoading: boolean;
}

export default function ActiveAppointmentsSection({ 
  appointments, 
  patientId, 
  isLoading 
}: ActiveAppointmentsSectionProps) {
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasActiveAppointments = appointments && appointments.length > 0;
  const nextAppointment = hasActiveAppointments ? appointments[0] : null;

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-green-200 rounded w-1/2 mb-3"></div>
        <div className="space-y-2">
          <div className="h-3 bg-green-200 rounded"></div>
          <div className="h-3 bg-green-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!hasActiveAppointments || !nextAppointment) {
    return null; // No mostrar nada si no hay citas activas
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-green-600" />
          <h3 className="text-green-800 font-semibold text-sm">Próxima Cita</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-700 text-xs font-medium">
            {nextAppointment.status}
          </span>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-green-600" />
          <span className="text-green-900 font-medium">
            {formatDateTime(nextAppointment.date)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3 text-green-600" />
          <span className="text-green-900 font-medium capitalize">
            {nextAppointment.type.toLowerCase()}
          </span>
        </div>

        <div className="text-green-700 text-xs line-clamp-2">
          {nextAppointment.reason}
        </div>
        
        {nextAppointment.observations && (
          <div className="text-green-600 text-xs line-clamp-2">
            📝 {nextAppointment.observations}
          </div>
        )}
        
        <div className="pt-2 flex gap-2">
          <Link
            to={`/appointments/${nextAppointment._id}`}
            className="flex-1 text-center py-2 text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
          >
            Ver Cita
          </Link>
          <Link
            to={`/patients/${patientId}/appointments/create`}
            className="flex-1 text-center py-2 text-xs bg-white hover:bg-green-50 text-green-700 border border-green-300 rounded-lg transition-colors font-medium"
          >
            Nueva Cita
          </Link>
        </div>
      </div>
    </div>
  );
}