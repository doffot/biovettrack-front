// src/components/dashboard/MetricsGrid.tsx
import {
  DollarSign,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { DualCurrencyCard } from "./DualCurrencyCard";
import type { CurrencyAmounts } from "../../constants/dashboardConstants";
import type { RevenueAmounts } from "../../hooks/useDashboardData";

interface MetricsGridProps {
  todayAppointments: number;
  todayConsultations: number;
  todayGrooming: number;
  todayRevenue: RevenueAmounts;
  totalPatients: number;
  totalOwners: number;
  pendingDebt: CurrencyAmounts;
  pendingInvoicesCount: number;
  monthRevenue: RevenueAmounts;
  onPendingDebtClick?: () => void;
}

export function MetricsGrid({
  todayRevenue,
  pendingDebt,
  pendingInvoicesCount,
  monthRevenue,
  onPendingDebtClick,
}: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Ingresos Hoy - Verde esmeralda */}
      <DualCurrencyCard
        title="Ingresos Hoy"
        amounts={todayRevenue}
        icon={DollarSign}
        iconBgColor="bg-slate-800/80"
        color="text-emerald-400"
        bgColor="bg-gradient-to-br from-slate-900/80 to-emerald-950/40 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300"
      />
      
      {/* Por Cobrar - Ámbar con alerta */}
      <DualCurrencyCard
        title="Por Cobrar"
        amounts={pendingDebt}
        subtitle={`${pendingInvoicesCount} facturas pendientes`}
        icon={CreditCard}
        iconBgColor="bg-slate-800/80"
        color="text-amber-400"
        bgColor="bg-gradient-to-br from-slate-900/80 to-amber-950/40 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300"
        onClick={onPendingDebtClick}
      />
      
      {/* Ingresos del Mes - Azul vet neón */}
      <DualCurrencyCard
        title="Ingresos del Mes"
        amounts={monthRevenue}
        icon={TrendingUp}
        iconBgColor="bg-slate-800/80"
        color="text-vet-accent"
        bgColor="bg-gradient-to-br from-slate-900/80 to-vet-primary/30 border border-vet-accent/20 hover:border-vet-accent/40 transition-all duration-300"
      />
    </div>
  );
}