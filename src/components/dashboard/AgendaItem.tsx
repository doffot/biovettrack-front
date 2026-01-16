// src/components/dashboard/AgendaItem.tsx
import { Calendar, Stethoscope, Scissors, User, Clock } from "lucide-react";

export type AgendaItemType = "cita" | "consulta" | "peluqueria";

interface AgendaItemProps {
  time: string;
  patientName: string;
  patientPhoto?: string | null;
  ownerName: string;
  reason?: string;
  type: AgendaItemType;
}

const CONFIG = {
  cita: { 
    icon: Calendar, 
    color: "text-blue-400", 
    bg: "bg-gradient-to-br from-slate-800/60 to-blue-950/40", 
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/20",
    glow: "group-hover:shadow-blue-500/20"
  },
  consulta: { 
    icon: Stethoscope, 
    color: "text-emerald-400", 
    bg: "bg-gradient-to-br from-slate-800/60 to-emerald-950/40", 
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/20",
    glow: "group-hover:shadow-emerald-500/20"
  },
  peluqueria: { 
    icon: Scissors, 
    color: "text-purple-400", 
    bg: "bg-gradient-to-br from-slate-800/60 to-purple-950/40", 
    border: "border-purple-500/20",
    iconBg: "bg-purple-500/20",
    glow: "group-hover:shadow-purple-500/20"
  },
} as const;

export function AgendaItem({ 
  time, 
  patientName, 
  patientPhoto, 
  ownerName, 
  reason, 
  type 
}: AgendaItemProps) {
  const { icon: Icon, color, bg, border, iconBg, glow } = CONFIG[type];

  return (
    <div className={`
      flex items-center gap-3 p-3 
      bg-slate-900/40 backdrop-blur-sm
      rounded-xl border ${border} 
      hover:border-opacity-60
      hover:shadow-lg ${glow}
      transition-all duration-300 
      group animate-fadeIn
    `}>
      {/* Foto del paciente */}
      <div className="relative flex-shrink-0">
        {patientPhoto ? (
          <img
            src={patientPhoto}
            alt={patientName}
            className="w-12 h-12 rounded-xl object-cover border-2 border-white/10 group-hover:border-vet-accent/50 transition-colors"
          />
        ) : (
          <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center border ${border}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        )}
        
        {/* Badge tipo de evento */}
        <div className={`
          absolute -bottom-1 -right-1 
          w-5 h-5 ${iconBg} 
          rounded-full 
          flex items-center justify-center 
          border border-slate-900
          animate-scale-in
        `}>
          <Icon className={`w-3 h-3 ${color}`} />
        </div>
      </div>

      {/* Información */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm truncate">
          {patientName}
        </p>
        
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
          <User className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{ownerName}</span>
        </div>
        
        {reason && (
          <p className="text-xs text-slate-500 mt-1 truncate italic">
            "{reason}"
          </p>
        )}
      </div>

      {/* Hora con badge */}
      <div className={`
        flex items-center gap-1.5 
        text-xs font-semibold 
        ${color}
        bg-slate-800/80 
        px-3 py-2 
        rounded-lg
        border border-white/10
        flex-shrink-0
      `}>
        <Clock className="w-3.5 h-3.5" />
        <span>{time}</span>
      </div>
    </div>
  );
}