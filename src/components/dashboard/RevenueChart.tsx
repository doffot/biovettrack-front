// src/views/dashboard/components/RevenueChart.tsx
import { useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { CurrencyAmounts, RevenueChartItem } from "../../hooks/useDashboardData";


interface RevenueChartProps {
  data: RevenueChartItem[];
  weekRevenue: CurrencyAmounts;
  monthRevenue: CurrencyAmounts;
}

type CurrencyFilter = "USD" | "Bs" | "both";

export function RevenueChart({ data, weekRevenue, monthRevenue }: RevenueChartProps) {
  const [currencyFilter, setCurrencyFilter] = useState<CurrencyFilter>("both");

  const formatUSD = (amount: number) => `$${amount.toFixed(2)}`;
  const formatBs = (amount: number) =>
    `Bs ${amount.toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 lg:p-6">
      <div className="flex flex-col gap-4 mb-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-vet-primary" />
            Ingresos Últimos 7 Días
          </h2>

          {/* Filtro de moneda */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setCurrencyFilter("both")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                currencyFilter === "both"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Ambas
            </button>
            <button
              onClick={() => setCurrencyFilter("USD")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                currencyFilter === "USD"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              USD
            </button>
            <button
              onClick={() => setCurrencyFilter("Bs")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                currencyFilter === "Bs"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Bs
            </button>
          </div>
        </div>

        {/* Resumen */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
            <span className="text-gray-500">Semana:</span>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900">{formatUSD(weekRevenue.USD)}</span>
              <span className="font-semibold text-gray-600 text-xs">
                {formatBs(weekRevenue.Bs)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
            <span className="text-gray-500">Mes:</span>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900">{formatUSD(monthRevenue.USD)}</span>
              <span className="font-semibold text-gray-600 text-xs">
                {formatBs(monthRevenue.Bs)}
              </span>
            </div>
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
              formatter={(value: number, name: string) => {
                if (name === "USD") return [formatUSD(value), "Dólares"];
                if (name === "Bs") return [formatBs(value), "Bolívares"];
                return [value, name];
              }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            />
            {currencyFilter === "both" && <Legend />}

            {(currencyFilter === "both" || currencyFilter === "USD") && (
              <Bar dataKey="USD" fill="#10b981" radius={[4, 4, 0, 0]} name="USD" />
            )}
            {(currencyFilter === "both" || currencyFilter === "Bs") && (
              <Bar dataKey="Bs" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Bs" />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}