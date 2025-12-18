// src/views/dashboard/components/AgendaItem.tsx
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
    color: "text-vet-primary", 
    bg: "bg-gradient-to-br from-blue-50 to-sky-50", 
    border: "border-vet-primary/20",
    iconBg: "bg-vet-primary/10"
  },
  consulta: { 
    icon: Stethoscope, 
    color: "text-emerald-600", 
    bg: "bg-gradient-to-br from-emerald-50 to-green-50", 
    border: "border-emerald-200",
    iconBg: "bg-emerald-100"
  },
  peluqueria: { 
    icon: Scissors, 
    color: "text-purple-600", 
    bg: "bg-gradient-to-br from-purple-50 to-pink-50", 
    border: "border-purple-200",
    iconBg: "bg-purple-100"
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
  const { icon: Icon, color, bg, border, iconBg } = CONFIG[type];

  return (
    <div className={`flex items-center gap-3 p-3 bg-white rounded-xl border ${border} hover:shadow-card transition-all duration-200 group animate-fadeIn`}>
      {/* Foto del paciente */}
      <div className="relative">
        {patientPhoto ? (
          <img
            src={patientPhoto}
            alt={patientName}
            className="w-12 h-12 rounded-full object-cover border-2 border-vet-light group-hover:border-vet-accent transition-colors"
          />
        ) : (
          <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center border-2 ${border}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        )}
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${iconBg} rounded-full flex items-center justify-center animate-scale-in`}>
          <Icon className={`w-3 h-3 ${color}`} />
        </div>
      </div>

      {/* Información */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-vet-text text-sm truncate">{patientName}</p>
        <div className="flex items-center gap-1 text-xs text-vet-muted">
          <User className="w-3 h-3" />
          <span className="truncate">{ownerName}</span>
        </div>
        {reason && (
          <p className="text-xs text-vet-muted mt-0.5 truncate italic">{reason}</p>
        )}
      </div>

      {/* Hora */}
      <div className="flex items-center gap-1 text-xs font-medium text-vet-primary bg-vet-light px-2 py-1.5 rounded-lg">
        <Clock className="w-3 h-3" />
        <span>{time}</span>
      </div>
    </div>
  );
}