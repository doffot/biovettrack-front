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
    const limit = authData.planType === 'trial' ? 50 :
                  authData.planType === 'basic' ? 100 : 500;
    return `${authData.patientCount || 0}/${limit} pacientes`;
  };

  const trialInfo = getTrialInfo();
  const patientInfo = getPatientInfo();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-vet-text">
          ¡Bienvenido, <span className="text-vet-accent">{userName}</span>!
        </h1>
        <p className="text-vet-muted mt-1">Panel de control de tu clínica veterinaria</p>
        
       
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {authData?.isLegacyUser ? (
            <span className="text-xs px-2 py-1 bg-purple-500/10 text-purple-500 rounded-full border border-purple-500/20 font-medium">
              Versión Platinum VIP
            </span>
          ) : (
            <>
              <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20 font-medium">
                Versión Gratuita
              </span>
              {trialInfo && (
                <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/20 font-medium">
                  {trialInfo}
                </span>
              )}
              {patientInfo && (
                <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/20 font-medium">
                  {patientInfo}
                </span>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 bg-card/60 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-border shadow-soft">
        <Clock className="w-4 h-4 text-vet-accent animate-pulse-slow" />
        <span className="text-sm font-medium text-vet-text">{formatLongDate(new Date())}</span>
      </div>
    </div>
  );
}