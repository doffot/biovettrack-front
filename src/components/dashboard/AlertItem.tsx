// src/views/dashboard/components/AlertItem.tsx
import { Syringe, Bug } from "lucide-react";

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
      className={`flex items-center gap-3 p-3 rounded-xl border ${
        isUrgent ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
      }`}
    >
      <div className={`p-2 rounded-lg ${isUrgent ? "bg-red-100" : "bg-amber-100"}`}>
        <Icon className={`w-4 h-4 ${isUrgent ? "text-red-600" : "text-amber-600"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">{title}</p>
        <p className="text-xs text-gray-500 truncate">{subtitle}</p>
      </div>
      <span
        className={`text-xs font-bold px-2 py-1 rounded-lg ${
          isUrgent ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
        }`}
      >
        {getDaysLabel()}
      </span>
    </div>
  );
}