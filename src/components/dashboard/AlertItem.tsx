// src/components/dashboard/AlertItem.tsx
import { Syringe, Bug, AlertCircle } from "lucide-react";

export type AlertType = "vacuna" | "desparasitacion";

interface AlertItemProps {
  title: string;
  subtitle: string;
  type: AlertType;
  daysLeft: number;
}

export function AlertItem({ title, subtitle, type, daysLeft }: AlertItemProps) {
  const isUrgent = daysLeft <= 3;
  const Icon = type === "vacuna" ? Syringe : Bug;

  const getDaysLabel = () => {
    if (daysLeft === 0) return "Hoy";
    if (daysLeft === 1) return "Mañana";
    return `${daysLeft}d`;
  };

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-xl 
        border backdrop-blur-sm
        transition-all duration-300
        hover:scale-[1.01]
        ${
          isUrgent 
            ? "bg-gradient-to-br from-red-950/40 to-red-900/20 border-red-500/30 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20" 
            : "bg-gradient-to-br from-amber-950/40 to-amber-900/20 border-amber-500/30 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/20"
        }
      `}
    >
      {/* Icono del tipo de alerta */}
      <div className={`
        relative p-2.5 rounded-xl 
        ${isUrgent ? "bg-red-500/20" : "bg-amber-500/20"}
      `}>
        <Icon className={`
          w-5 h-5 
          ${isUrgent ? "text-red-400" : "text-amber-400"}
        `} />
        
        {/* Indicador pulsante para alertas urgentes */}
        {isUrgent && (
          <div className="absolute -top-1 -right-1">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </div>
          </div>
        )}
      </div>

      {/* Información */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm truncate flex items-center gap-1.5">
          {title}
          {isUrgent && <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
        </p>
        <p className="text-xs text-slate-400 truncate mt-0.5">{subtitle}</p>
      </div>

      {/* Badge de días restantes */}
      <span
        className={`
          text-xs font-bold px-3 py-1.5 rounded-lg 
          border flex-shrink-0
          ${
            isUrgent 
              ? "bg-red-500/30 text-red-300 border-red-500/50" 
              : "bg-amber-500/30 text-amber-300 border-amber-500/50"
          }
        `}
      >
        {getDaysLabel()}
      </span>
    </div>
  );
}