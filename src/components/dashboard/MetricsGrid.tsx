// src/components/dashboard/MetricsGrid.tsx
import {
  DollarSign,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { DualCurrencyCard } from "./DualCurrencyCard";
import type { CurrencyAmounts } from "../../constants/dashboardConstants";

interface MetricsGridProps {
  todayAppointments: number;
  todayConsultations: number;
  todayGrooming: number;
  todayRevenue: CurrencyAmounts;
  totalPatients: number;
  totalOwners: number;
  pendingDebt: CurrencyAmounts;
  pendingInvoicesCount: number;
  monthRevenue: CurrencyAmounts;
  // Nuevo callback
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
      <DualCurrencyCard
        title="Ingresos Hoy"
        amounts={todayRevenue}
        icon={DollarSign}
        color="text-green-600"
        bgColor="bg-gradient-to-br from-green-50 to-emerald-50"
      />
      <DualCurrencyCard
        title="Por Cobrar"
        amounts={pendingDebt}
        subtitle={`${pendingInvoicesCount} facturas`}
        icon={CreditCard}
        color="text-orange-600"
        bgColor="bg-gradient-to-br from-orange-50 to-amber-50"
        onClick={onPendingDebtClick}
      />
      <DualCurrencyCard
        title="Ingresos del Mes"
        amounts={monthRevenue}
        icon={TrendingUp}
        color="text-vet-primary"
        bgColor="bg-gradient-to-br from-vet-light to-blue-50"
      />
    </div>
  );
}