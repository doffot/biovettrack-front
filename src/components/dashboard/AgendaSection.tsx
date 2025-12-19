// src/views/dashboard/components/AgendaSection.tsx
import { Calendar, ChevronRight} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AgendaItem } from "./AgendaItem";
import { formatTime } from "../../utils/dashboardUtils";
import type { Appointment } from "../../types/appointment";

interface AgendaSectionProps {
  appointments: Appointment[];
}

export function AgendaSection({ appointments }: AgendaSectionProps) {
  const navigate = useNavigate();
  const isEmpty = appointments.length === 0;

  // Obtener información del paciente y dueño
  const getPatientInfo = (patient: any) => {
    if (typeof patient === "object" && patient) {
      const ownerName = typeof patient.owner === "object" 
        ? patient.owner?.name || "Sin dueño" 
        : "Sin dueño";
      return {
        id: patient._id,
        name: patient.name || "Paciente",
        photo: patient.photo,
        owner: ownerName
      };
    }
    return { id: null, name: "Paciente", photo: null, owner: "Sin dueño" };
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    const patientInfo = getPatientInfo(appointment.patient);
    if (patientInfo.id) {
      navigate(`/patients/${patientInfo.id}/appointments/${appointment._id}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-vet-light overflow-hidden animate-fade-in-up">
      <div className="px-4 py-3 bg-gradient-to-r from-vet-light via-white to-vet-light border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-vet-text flex items-center gap-2">
          <div className="p-1.5 bg-white rounded-lg shadow-soft">
            <Calendar className="w-4 h-4 text-vet-primary" />
          </div>
          Citas de Hoy
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white px-2 py-1 rounded-full font-medium text-vet-muted shadow-soft">
            {appointments.length} {appointments.length === 1 ? 'cita' : 'citas'}
          </span>
          <Link
            to="/appointments"
            className="text-xs text-vet-primary hover:text-vet-accent font-medium flex items-center gap-0.5 transition-colors group"
          >
            Ver todas
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
      
      <div className="p-4">
        {isEmpty ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-3 bg-vet-light rounded-full flex items-center justify-center animate-gentle-pulse">
              <Calendar className="w-8 h-8 text-vet-muted" />
            </div>
            <p className="text-vet-text text-sm font-medium">No hay citas programadas</p>
            <p className="text-vet-muted text-xs mt-1">Agenda libre para hoy</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
            {appointments.slice(0, 3).map((apt) => {
              const patientInfo = getPatientInfo(apt.patient);
              return (
                <div 
                  key={apt._id} 
                  onClick={() => handleAppointmentClick(apt)}
                  className="cursor-pointer group"
                >
                  <AgendaItem
                    time={formatTime(apt.date)}
                    patientName={patientInfo.name}
                    patientPhoto={patientInfo.photo}
                    ownerName={patientInfo.owner}
                    reason={apt.reason}
                    type="cita"
                  />
                </div>
              );
            })}
            
            {appointments.length > 3 && (
              <>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-vet-light"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-vet-muted">
                      {appointments.length - 3} más
                    </span>
                  </div>
                </div>
                {appointments.slice(3).map((apt) => {
                  const patientInfo = getPatientInfo(apt.patient);
                  return (
                    <div 
                      key={apt._id} 
                      onClick={() => handleAppointmentClick(apt)}
                      className="cursor-pointer group"
                    >
                      <AgendaItem
                        time={formatTime(apt.date)}
                        patientName={patientInfo.name}
                        patientPhoto={patientInfo.photo}
                        ownerName={patientInfo.owner}
                        reason={apt.reason}
                        type="cita"
                      />
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}