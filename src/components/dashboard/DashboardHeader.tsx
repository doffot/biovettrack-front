// src/views/dashboard/components/DashboardHeader.tsx
import { Clock } from "lucide-react";
import { formatLongDate } from "../../utils/dashboardUtils";

interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          ¡Bienvenido, <span className="text-vet-primary">{userName}</span>!
        </h1>
        <p className="text-gray-500 mt-1">Panel de control de tu clínica veterinaria</p>
      </div>
      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
        <Clock className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600">{formatLongDate(new Date())}</span>
      </div>
    </div>
  );
}