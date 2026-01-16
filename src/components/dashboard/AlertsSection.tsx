// src/components/dashboard/AlertsSection.tsx
import { Shield, AlertTriangle } from "lucide-react";
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
    <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden animate-fade-in-up shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-amber-900/30 via-slate-800/40 to-amber-900/30 border-b border-white/10 flex items-center justify-between">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/20 rounded-lg border border-amber-500/30">
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <span className="hidden sm:inline">Próximos Vencimientos</span>
          <span className="sm:hidden">Vencimientos</span>
        </h2>
        
        <div className="flex items-center gap-2">
          {/* Badge urgentes */}
          {urgentCount > 0 && (
            <span className="flex items-center gap-1 text-xs bg-red-500/20 px-2.5 py-1 rounded-full font-semibold text-red-300 border border-red-500/30 animate-pulse-slow">
              <AlertTriangle className="w-3 h-3" />
              {urgentCount} {urgentCount === 1 ? 'urgente' : 'urgentes'}
            </span>
          )}
          
          {/* Badge total */}
          <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-semibold border border-amber-500/30">
            {totalAlerts} {totalAlerts === 1 ? 'próxima' : 'próximas'}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {isEmpty ? (
          /* Estado vacío - Todo al día */
          <div className="text-center py-12">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-green-500/30 rounded-full animate-gentle-pulse blur-xl"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
            <p className="text-white text-sm font-semibold">¡Todo al día!</p>
            <p className="text-slate-400 text-xs mt-1">No hay vencimientos próximos</p>
            
            {/* Badge decorativo */}
            <div className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-emerald-400 font-medium">Sistema protegido</span>
            </div>
          </div>
        ) : (
          /* Lista de alertas */
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
            {/* Primeras 3 alertas */}
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
            
            {/* Separador si hay más de 3 */}
            {totalAlerts > 3 && (
              <>
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-slate-900/80 px-3 py-1 text-slate-400 rounded-full border border-white/10">
                      +{totalAlerts - 3} más
                    </span>
                  </div>
                </div>
                
                {/* Resto de alertas */}
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