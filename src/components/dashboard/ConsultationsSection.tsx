// src/views/dashboard/components/ConsultationsSection.tsx
import { Stethoscope, ChevronRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { formatTime } from "../../utils/dashboardUtils";
import type { Consultation } from "../../types/consultation";

interface ConsultationsSectionProps {
  consultations: Consultation[];
}

export function ConsultationsSection({ consultations }: ConsultationsSectionProps) {
  const isEmpty = consultations.length === 0;

  return (
    <div className="bg-white rounded-2xl shadow-card border border-vet-light overflow-hidden animate-fade-in-up">
      <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-vet-text flex items-center gap-2">
          <div className="p-1.5 bg-white rounded-lg shadow-soft">
            <Stethoscope className="w-4 h-4 text-emerald-600" />
          </div>
          Consultas de Hoy
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white px-2 py-1 rounded-full font-medium text-vet-muted shadow-soft">
            {consultations.length} {consultations.length === 1 ? 'consulta' : 'consultas'}
          </span>
          <Link
            to="/consultations"
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
            <div className="w-16 h-16 mx-auto mb-3 bg-emerald-50 rounded-full flex items-center justify-center animate-gentle-pulse">
              <Stethoscope className="w-8 h-8 text-emerald-300" />
            </div>
            <p className="text-vet-text text-sm font-medium">Sin consultas programadas</p>
            <p className="text-vet-muted text-xs mt-1">No hay consultas para hoy</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
            {consultations.slice(0, 3).map((consultation) => (
              <ConsultationItem
                key={consultation._id}
                time={formatTime(consultation.consultationDate)}
                diagnosis={consultation.presumptiveDiagnosis}
                reason={consultation.reasonForVisit}
                cost={consultation.cost}
              />
            ))}
            
            {consultations.length > 3 && (
              <>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-vet-light"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-vet-muted">
                      {consultations.length - 3} más
                    </span>
                  </div>
                </div>
                {consultations.slice(3).map((consultation) => (
                  <ConsultationItem
                    key={consultation._id}
                    time={formatTime(consultation.consultationDate)}
                    diagnosis={consultation.presumptiveDiagnosis}
                    reason={consultation.reasonForVisit}
                    cost={consultation.cost}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente interno para cada consulta
function ConsultationItem({ time, diagnosis, reason, cost }: {
  time: string;
  diagnosis: string;
  reason: string;
  cost: number;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-emerald-200/50 hover:shadow-md transition-all duration-200 group animate-fadeIn">
      <div className="p-2 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg">
        <FileText className="w-4 h-4 text-emerald-600" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-vet-text text-sm truncate">{diagnosis}</p>
        <p className="text-xs text-vet-muted truncate">{reason}</p>
      </div>
      
      <div className="text-right">
        <p className="text-xs font-semibold text-emerald-600">${cost}</p>
        <p className="text-xs text-vet-muted">{time}</p>
      </div>
    </div>
  );
}