import { Calendar, ChevronRight } from "lucide-react";
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
    <div className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border overflow-hidden animate-fade-in-up shadow-card">
      {/* Header */}
      <div className="px-4 py-3 bg-vet-light/50 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-vet-text flex items-center gap-2">
          <div className="p-1.5 bg-card/50 rounded-lg border border-border">
            <Calendar className="w-4 h-4 text-vet-accent" />
          </div>
          Citas de Hoy
        </h2>
        
        <div className="flex items-center gap-2">
          {/* Badge contador */}
          <span className="text-xs bg-vet-accent/10 text-vet-accent px-2.5 py-1 rounded-full font-semibold border border-vet-accent/20">
            {appointments.length} {appointments.length === 1 ? 'cita' : 'citas'}
          </span>
          
          {/* Link "Ver todas" */}
          <Link
            to="/appointments"
            className="text-xs text-vet-accent hover:text-vet-text font-medium flex items-center gap-0.5 transition-colors group"
          >
            Ver todas
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {isEmpty ? (
          /* Estado vacío */
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-vet-light rounded-full flex items-center justify-center animate-gentle-pulse border border-border">
              <Calendar className="w-8 h-8 text-vet-muted" />
            </div>
            <p className="text-vet-text text-sm font-medium">No hay citas programadas</p>
            <p className="text-vet-muted text-xs mt-1">Agenda libre para hoy</p>
            
            {/* Botón para crear cita */}
            <Link
              to="/appointments"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-vet-accent/10 hover:bg-vet-accent/20 text-vet-accent rounded-lg text-sm font-medium transition-colors border border-vet-accent/20"
            >
              <Calendar className="w-4 h-4" />
              Crear primera cita
            </Link>
          </div>
        ) : (
          /* Lista de citas */
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
            {/* Primeras 3 citas */}
            {appointments.slice(0, 3).map((apt) => {
              const patientInfo = getPatientInfo(apt.patient);
              return (
                <div 
                  key={apt._id} 
                  onClick={() => handleAppointmentClick(apt)}
                  className="cursor-pointer"
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
            
            {/* Separador si hay más de 3 */}
            {appointments.length > 3 && (
              <>
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-3 py-1 text-vet-muted rounded-full border border-border shadow-sm">
                      +{appointments.length - 3} más
                    </span>
                  </div>
                </div>
                
                {/* Resto de citas */}
                {appointments.slice(3).map((apt) => {
                  const patientInfo = getPatientInfo(apt.patient);
                  return (
                    <div 
                      key={apt._id} 
                      onClick={() => handleAppointmentClick(apt)}
                      className="cursor-pointer"
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