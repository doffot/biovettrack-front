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
  onClick?: () => void;
}

export function DualCurrencyCard({
  title,
  amounts,
  subtitle,
  icon: Icon,
  color,
  bgColor,
  onClick,
}: DualCurrencyCardProps) {
  const formatUSD = (amount: number) => `$${amount.toFixed(2)}`;
  const formatBs = (amount: number) =>
    `Bs ${amount.toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const isClickable = !!onClick;

  return (
    <div
      className={`
        ${bgColor} rounded-xl p-3 border border-vet-light shadow-soft 
        transition-all duration-200 animate-scale-in group
        ${isClickable
          ? "cursor-pointer hover:shadow-card hover:scale-[1.02] active:scale-[0.98] hover:border-orange-200"
          : "hover:shadow-card"
        }
      `}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[10px] font-semibold text-vet-muted uppercase tracking-wide">
            {title}
          </p>

          {/* USD */}
          <p className={`text-lg font-bold ${color} mt-0.5`}>
            {formatUSD(amounts.USD)}
          </p>

          {/* Bolívares */}
          <p className="text-xs font-semibold text-vet-muted">
            {formatBs(amounts.Bs)}
          </p>

          {/* Subtitle con indicador de clickeable */}
          {subtitle && (
            <p className="text-[10px] text-vet-muted mt-0.5 flex items-center gap-1">
              {subtitle}
              {isClickable && (
                <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  • Ver detalles
                </span>
              )}
            </p>
          )}
        </div>
        
        <div className={`p-2 rounded-lg bg-white/50 group-hover:bg-white/70 transition-colors`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}