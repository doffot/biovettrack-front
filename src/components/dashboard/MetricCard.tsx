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
    <div className={`${bgColor} rounded-xl p-3 border border-vet-light shadow-soft hover:shadow-card transition-all duration-200 animate-scale-in group`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-vet-muted uppercase tracking-wide">
            {title}
          </p>
          <p className={`text-xl font-bold ${color} mt-0.5`}>{value}</p>
          {subtitle && <p className="text-[10px] text-vet-muted mt-0.5">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg bg-white/50 group-hover:bg-white/70 transition-colors`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}