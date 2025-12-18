// src/views/dashboard/components/AlertsSection.tsx
import { Shield} from "lucide-react";
import { AlertItem } from "./AlertItem";
import type { DewormingWithDaysLeft, VaccinationWithDaysLeft } from "../../hooks/useDashboardData";

interface AlertsSectionProps {
  vaccinations: VaccinationWithDaysLeft[];
  dewormings: DewormingWithDaysLeft[];
}

export function AlertsSection({ vaccinations, dewormings }: AlertsSectionProps) {
  const totalAlerts = vaccinations.length + dewormings.length;
  const isEmpty = totalAlerts === 0;

  // Ordenar por urgencia
  const allAlerts = [...vaccinations, ...dewormings].sort((a, b) => a.daysLeft - b.daysLeft);
  const urgentCount = allAlerts.filter(a => a.daysLeft <= 3).length;

  return (
    <div className="bg-white rounded-2xl shadow-card border border-vet-light overflow-hidden animate-fade-in-up">
      <div className="px-4 py-3 bg-gradient-to-r from-amber-50 via-white to-amber-50 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-vet-text flex items-center gap-2">
          <div className="p-1.5 bg-white rounded-lg shadow-soft">
            <Shield className="w-4 h-4 text-amber-600" />
          </div>
          <span className="hidden sm:inline">Próximos Vencimientos</span>
          <span className="sm:hidden">Vencimientos</span>
        </h2>
        <div className="flex items-center gap-2">
          {urgentCount > 0 && (
            <span className="text-xs bg-red-100 px-2 py-1 rounded-full font-medium text-red-700 shadow-soft animate-pulse-slow">
              {urgentCount} urgentes
            </span>
          )}
          <span className="text-xs bg-white px-2 py-1 rounded-full font-medium text-amber-700 shadow-soft">
            {totalAlerts} próximas
          </span>
        </div>
      </div>
      
      <div className="p-4">
        {isEmpty ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full flex items-center justify-center animate-gentle-pulse">
              <Shield className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-vet-text text-sm font-medium">¡Todo al día!</p>
            <p className="text-vet-muted text-xs mt-1">No hay vencimientos próximos</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
            {allAlerts.slice(0, 3).map((item) => {
              if ('vaccineType' in item) {
                return (
                  <AlertItem
                    key={item._id}
                    title={item.vaccineType}
                    subtitle={`Paciente ID: ${item.patientId}`}
                    type="vacuna"
                    daysLeft={item.daysLeft}
                  />
                );
              } else {
                return (
                  <AlertItem
                    key={item._id}
                    title={item.productName}
                    subtitle={`${item.dewormingType} - ${item.dose}`}
                    type="desparasitacion"
                    daysLeft={item.daysLeft}
                  />
                );
              }
            })}
            
            {totalAlerts > 3 && (
              <>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-vet-light"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-vet-muted">
                      {totalAlerts - 3} más
                    </span>
                  </div>
                </div>
                {allAlerts.slice(3).map((item) => {
                  if ('vaccineType' in item) {
                    return (
                      <AlertItem
                        key={item._id}
                        title={item.vaccineType}
                        subtitle={`Paciente ID: ${item.patientId}`}
                        type="vacuna"
                        daysLeft={item.daysLeft}
                      />
                    );
                  } else {
                    return (
                      <AlertItem
                        key={item._id}
                        title={item.productName}
                        subtitle={`${item.dewormingType} - ${item.dose}`}
                        type="desparasitacion"
                        daysLeft={item.daysLeft}
                      />
                    );
                  }
                })}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}