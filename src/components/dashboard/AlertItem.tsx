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
        hover:scale-[1.01] hover:shadow-md
        ${
          isUrgent 
            ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40 hover:shadow-red-500/10" 
            : "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40 hover:shadow-amber-500/10"
        }
      `}
    >
      {/* Icono del tipo de alerta */}
      <div className={`
        relative p-2.5 rounded-xl border
        ${
          isUrgent 
            ? "bg-red-500/10 border-red-500/20 text-red-500" 
            : "bg-amber-500/10 border-amber-500/20 text-amber-500"
        }
      `}>
        <Icon className="w-5 h-5" />
        
        {/* Indicador pulsante para alertas urgentes */}
        {isUrgent && (
          <div className="absolute -top-1 -right-1">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </div>
          </div>
        )}
      </div>

      {/* Información */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-vet-text text-sm truncate flex items-center gap-1.5">
          {title}
          {isUrgent && <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
        </p>
        <p className="text-xs text-vet-muted truncate mt-0.5">{subtitle}</p>
      </div>

      {/* Badge de días restantes */}
      <span
        className={`
          text-xs font-bold px-3 py-1.5 rounded-lg 
          border flex-shrink-0
          ${
            isUrgent 
              ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" 
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
          }
        `}
      >
        {getDaysLabel()}
      </span>
    </div>
  );
}