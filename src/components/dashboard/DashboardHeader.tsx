// src/components/dashboard/DashboardHeader.tsx
import { Clock } from "lucide-react";
import { formatLongDate } from "../../utils/dashboardUtils";

interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          ¡Bienvenido, <span className="text-vet-accent">{userName}</span>!
        </h1>
        <p className="text-slate-400 mt-1">Panel de control de tu clínica veterinaria</p>
      </div>
      
      <div className="flex items-center gap-2 bg-slate-800/60 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10 shadow-lg">
        <Clock className="w-4 h-4 text-vet-accent animate-pulse-slow" />
        <span className="text-sm font-medium text-slate-300">{formatLongDate(new Date())}</span>
      </div>
    </div>
  );
}