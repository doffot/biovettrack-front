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

  // Combinar y ordenar por urgencia
  const allAlerts = [...vaccinations, ...dewormings].sort((a, b) => a.daysLeft - b.daysLeft);
  const urgentCount = allAlerts.filter(a => a.daysLeft <= 3).length;

  return (
    <div className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border overflow-hidden animate-fade-in-up shadow-card">
      {/* Header (Mantenemos tu lógica de badges) */}
      <div className="px-4 py-3 bg-amber-500/5 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-vet-text flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Shield className="w-4 h-4 text-amber-500" />
          </div>
          <span className="hidden sm:inline">Próximos Vencimientos</span>
          <span className="sm:hidden">Vencimientos</span>
        </h2>
        
        <div className="flex items-center gap-2">
          {urgentCount > 0 && (
            <span className="flex items-center gap-1 text-xs bg-red-500/10 px-2.5 py-1 rounded-full font-semibold text-red-500 border border-red-500/20 animate-pulse-slow">
              <AlertTriangle className="w-3 h-3" />
              {urgentCount} {urgentCount === 1 ? 'urgente' : 'urgentes'}
            </span>
          )}
          <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full font-semibold border border-amber-500/20">
            {totalAlerts}
          </span>
        </div>
      </div>
      
      {/* Lista de Alertas */}
      <div className="p-4">
        {isEmpty ? (
          <div className="text-center py-12">
             <div className="relative w-16 h-16 mx-auto mb-4">
               <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-gentle-pulse blur-xl"></div>
               <div className="relative w-16 h-16 bg-emerald-500/5 rounded-full flex items-center justify-center border border-emerald-500/20">
                 <Shield className="w-8 h-8 text-emerald-500" />
               </div>
             </div>
             <p className="text-vet-text text-sm font-semibold">¡Todo al día!</p>
             <p className="text-vet-muted text-xs mt-1">No hay vencimientos próximos</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
            {allAlerts.map((item, index) => (
              <div key={item._id}>
                {/* Insertar el separador "+X más" justo después del tercer elemento */}
                {index === 3 && (
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-3 py-1 text-vet-muted rounded-full border border-border shadow-sm font-medium">
                        +{totalAlerts - 3} vencimientos adicionales
                      </span>
                    </div>
                  </div>
                )}
                
                <AlertItem
                  title={'vaccineType' in item ? item.vaccineType : item.productName}
                  type={'vaccineType' in item ? "vacuna" : "desparasitacion"}
                  daysLeft={item.daysLeft}
                  patientData={item.patientData} // Los datos que inyectamos en el hook
                  ownerData={item.ownerData}     // Los datos que inyectamos en el hook
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}