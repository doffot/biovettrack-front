// src/views/dashboard/components/AlertsSection.tsx
import { AlertTriangle } from "lucide-react";
import { AlertItem } from "./AlertItem";
import type { DewormingWithDaysLeft, VaccinationWithDaysLeft } from "../../hooks/useDashboardData";


interface AlertsSectionProps {
  vaccinations: VaccinationWithDaysLeft[];
  dewormings: DewormingWithDaysLeft[];
}

export function AlertsSection({ vaccinations, dewormings }: AlertsSectionProps) {
  const totalAlerts = vaccinations.length + dewormings.length;
  const isEmpty = totalAlerts === 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Alertas
        </h2>
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-lg font-medium">
          {totalAlerts} próximas
        </span>
      </div>
      
      <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
        {isEmpty ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No hay alertas pendientes</p>
          </div>
        ) : (
          <>
            {vaccinations.map((v) => (
              <AlertItem
                key={v._id}
                title={v.vaccineType}
                subtitle={`Paciente ID: ${v.patientId}`}
                type="vacuna"
                daysLeft={v.daysLeft}
              />
            ))}
            {dewormings.map((d) => (
              <AlertItem
                key={d._id}
                title={d.productName}
                subtitle={`${d.dewormingType} - ${d.dose}`}
                type="desparasitacion"
                daysLeft={d.daysLeft}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}