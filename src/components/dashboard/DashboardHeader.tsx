// src/components/dashboard/DashboardHeader.tsx
import { Clock } from "lucide-react";
import { formatLongDate } from "../../utils/dashboardUtils";

interface DashboardHeaderProps {
  userName: string;
  authData?: {
    isLegacyUser?: boolean;
    planType?: 'trial' | 'basic' | 'premium';
    trialEndedAt?: string; // ISO string
    patientCount?: number;
  };
}

export function DashboardHeader({ userName, authData }: DashboardHeaderProps) {
  // Calcular días restantes (solo para trial)
  const getTrialInfo = () => {
    if (!authData || authData.isLegacyUser) return null;
    if (authData.planType === 'trial' && authData.trialEndedAt) {
      const now = new Date();
      const end = new Date(authData.trialEndedAt);
      const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        return `${diffDays} día${diffDays !== 1 ? 's' : ''} restante${diffDays !== 1 ? 's' : ''}`;
      } else {
        return "Trial expirado";
      }
    }
    return null;
  };

  const getPatientInfo = () => {
    if (!authData || authData.isLegacyUser) return null;
    const limit = authData.planType === 'trial' ? 20 :
                  authData.planType === 'basic' ? 100 : 500;
    return `${authData.patientCount || 0}/${limit} pacientes`;
  };

  const trialInfo = getTrialInfo();
  const patientInfo = getPatientInfo();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          ¡Bienvenido, <span className="text-vet-accent">{userName}</span>!
        </h1>
        <p className="text-slate-400 mt-1">Panel de control de tu clínica veterinaria</p>
        
        {/* 👇 Mostrar estado del plan */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {authData?.isLegacyUser ? (
            <span className="text-xs px-2 py-1 bg-purple-900/50 text-purple-300 rounded-full border border-purple-800/50">
              Versión Platinum VIP
            </span>
          ) : (
            <>
              <span className="text-xs px-2 py-1 bg-green-900/50 text-green-300 rounded-full border border-green-800/50">
                Versión Gratuita
              </span>
              {trialInfo && (
                <span className="text-xs px-2 py-1 bg-yellow-900/50 text-yellow-300 rounded-full border border-yellow-800/50">
                  {trialInfo}
                </span>
              )}
              {patientInfo && (
                <span className="text-xs px-2 py-1 bg-blue-900/50 text-blue-300 rounded-full border border-blue-800/50">
                  {patientInfo}
                </span>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 bg-slate-800/60 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10 shadow-lg">
        <Clock className="w-4 h-4 text-vet-accent animate-pulse-slow" />
        <span className="text-sm font-medium text-slate-300">{formatLongDate(new Date())}</span>
      </div>
    </div>
  );
}