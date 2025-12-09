// src/views/dashboard/components/AgendaSection.tsx
import { Calendar } from "lucide-react";
import { AgendaItem } from "./AgendaItem";
import type { GroomingService } from "../../types";
import type { Consultation } from "../../types/consultation";
import { formatTime } from "../../utils/dashboardUtils";
import type { Appointment } from "../../types/appointment";

interface AgendaSectionProps {
  appointments: Appointment[];
  groomingServices: GroomingService[];
  consultations: Consultation[];
}

export function AgendaSection({
  appointments,
  groomingServices,
  consultations,
}: AgendaSectionProps) {
  const totalEvents = appointments.length + groomingServices.length + consultations.length;
  const isEmpty = totalEvents === 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-vet-primary" />
          Agenda de Hoy
        </h2>
        <span className="text-xs bg-vet-primary/10 text-vet-primary px-2 py-1 rounded-lg font-medium">
          {totalEvents} eventos
        </span>
      </div>
      
      <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
        {isEmpty ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No hay eventos para hoy</p>
          </div>
        ) : (
          <>
            {appointments.map((apt) => (
              <AgendaItem
                key={apt._id}
                time={formatTime(apt.date)}
                title={
                  typeof apt.patient === "object"
                    ? apt.patient?.name || "Paciente"
                    : "Paciente"
                }
                subtitle={apt.reason}
                type="cita"
              />
            ))}
            {groomingServices.map((svc) => (
              <AgendaItem
                key={svc._id}
                time={formatTime(svc.date)}
                title={svc.service}
                subtitle={svc.specifications}
                type="peluqueria"
              />
            ))}
            {consultations.map((c) => (
              <AgendaItem
                key={c._id}
                time={formatTime(c.consultationDate)}
                title={c.presumptiveDiagnosis}
                subtitle={c.reasonForVisit}
                type="consulta"
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}