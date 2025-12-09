// src/views/dashboard/components/MetricsGrid.tsx
import {
  Calendar,
  Stethoscope,
  Scissors,
  DollarSign,
  PawPrint,
  Users,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import { formatCurrency } from "../../utils/currencyUtils";

interface MetricsGridProps {
  todayAppointments: number;
  todayConsultations: number;
  todayGrooming: number;
  todayRevenue: number;
  totalPatients: number;
  totalOwners: number;
  pendingDebt: number;
  pendingInvoicesCount: number;
  monthRevenue: number;
}

export function MetricsGrid({
  todayAppointments,
  todayConsultations,
  todayGrooming,
  todayRevenue,
  totalPatients,
  totalOwners,
  pendingDebt,
  pendingInvoicesCount,
  monthRevenue,
}: MetricsGridProps) {
  return (
    <>
      {/* Métricas de hoy */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Citas Hoy"
          value={todayAppointments}
          icon={Calendar}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <MetricCard
          title="Consultas Hoy"
          value={todayConsultations}
          icon={Stethoscope}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <MetricCard
          title="Peluquería Hoy"
          value={todayGrooming}
          icon={Scissors}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <MetricCard
          title="Ingresos Hoy"
          value={formatCurrency(todayRevenue)}
          icon={DollarSign}
          color="text-green-600"
          bgColor="bg-green-50"
        />
      </div>

      {/* Resumen general */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Pacientes"
          value={totalPatients}
          icon={PawPrint}
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
        <MetricCard
          title="Total Propietarios"
          value={totalOwners}
          icon={Users}
          color="text-indigo-600"
          bgColor="bg-indigo-50"
        />
        <MetricCard
          title="Deuda Pendiente"
          value={formatCurrency(pendingDebt)}
          subtitle={`${pendingInvoicesCount} facturas`}
          icon={CreditCard}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <MetricCard
          title="Ingresos Mes"
          value={formatCurrency(monthRevenue)}
          subtitle="Últimos 30 días"
          icon={TrendingUp}
          color="text-teal-600"
          bgColor="bg-teal-50"
        />
      </div>
    </>
  );
}