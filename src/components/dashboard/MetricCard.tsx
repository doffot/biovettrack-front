// src/views/dashboard/components/MetricCard.tsx
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bgColor,
}: MetricCardProps) {
  return (
    <div className={`${bgColor} rounded-2xl p-4 border border-gray-100`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}