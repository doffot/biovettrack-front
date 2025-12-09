// src/views/dashboard/components/AgendaItem.tsx
import { Calendar, Stethoscope, Scissors } from "lucide-react";

export type AgendaItemType = "cita" | "consulta" | "peluqueria";

interface AgendaItemProps {
  time: string;
  title: string;
  subtitle?: string;
  type: AgendaItemType;
}

const CONFIG = {
  cita: { icon: Calendar, color: "text-blue-600", bg: "bg-blue-100" },
  consulta: { icon: Stethoscope, color: "text-emerald-600", bg: "bg-emerald-100" },
  peluqueria: { icon: Scissors, color: "text-purple-600", bg: "bg-purple-100" },
} as const;

export function AgendaItem({ time, title, subtitle, type }: AgendaItemProps) {
  const { icon: Icon, color, bg } = CONFIG[type];

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className={`p-2 rounded-lg ${bg}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 truncate">{subtitle}</p>}
      </div>
      <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-lg">
        {time}
      </span>
    </div>
  );
}