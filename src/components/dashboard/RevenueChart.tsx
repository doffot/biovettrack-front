// src/views/dashboard/components/RevenueChart.tsx
import { TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../../utils/dashboardUtils";

import type { RevenueChartItem } from "../../hooks/useDashboardData";

interface RevenueChartProps {
  data: RevenueChartItem[];
  weekRevenue: number;
  monthRevenue: number;
}

export function RevenueChart({ data, weekRevenue, monthRevenue }: RevenueChartProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-vet-primary" />
          Ingresos Últimos 7 Días
        </h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Semana:</span>
            <span className="font-bold text-gray-900">{formatCurrency(weekRevenue)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Mes:</span>
            <span className="font-bold text-gray-900">{formatCurrency(monthRevenue)}</span>
          </div>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Ingresos"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            />
            <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}