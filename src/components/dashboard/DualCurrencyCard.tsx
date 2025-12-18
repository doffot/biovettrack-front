// src/views/dashboard/components/DualCurrencyCard.tsx
import type { LucideIcon } from "lucide-react";
import type { CurrencyAmounts } from "../../constants/dashboardConstants";

interface DualCurrencyCardProps {
  title: string;
  amounts: CurrencyAmounts;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export function DualCurrencyCard({
  title,
  amounts,
  subtitle,
  icon: Icon,
  color,
  bgColor,
}: DualCurrencyCardProps) {
  const formatUSD = (amount: number) => `$${amount.toFixed(2)}`;
  const formatBs = (amount: number) =>
    `Bs ${amount.toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className={`${bgColor} rounded-xl p-3 border border-vet-light shadow-soft hover:shadow-card transition-all duration-200 animate-scale-in group`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[10px] font-semibold text-vet-muted uppercase tracking-wide">
            {title}
          </p>

          {/* USD */}
          <p className={`text-lg font-bold ${color} mt-0.5`}>{formatUSD(amounts.USD)}</p>

          {/* Bolívares */}
          <p className="text-xs font-semibold text-vet-muted">{formatBs(amounts.Bs)}</p>

          {subtitle && <p className="text-[10px] text-vet-muted mt-0.5">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg bg-white/50 group-hover:bg-white/70 transition-colors`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}