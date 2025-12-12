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
    <div className={`${bgColor} rounded-2xl p-4 border border-gray-100`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>

          {/* USD */}
          <p className={`text-xl font-bold ${color} mt-1`}>{formatUSD(amounts.USD)}</p>

          {/* Bolívares */}
          <p className="text-sm font-semibold text-gray-600">{formatBs(amounts.Bs)}</p>

          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}