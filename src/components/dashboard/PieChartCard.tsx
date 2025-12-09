// src/views/dashboard/components/PieChartCard.tsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

import type { LucideIcon } from "lucide-react";
import { CHART_COLORS } from "../../constants/dashboardConstants";

interface PieChartCardProps {
  title: string;
  icon: LucideIcon;
  data: readonly { name: string; value: number }[];
  tooltipLabel: string;
  emptyMessage?: string;
}

export function PieChartCard({
  title,
  icon: Icon,
  data,
  tooltipLabel,
  emptyMessage = "Sin datos disponibles",
}: PieChartCardProps) {
  const isEmpty = data.length === 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 lg:p-6">
      <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5 text-vet-primary" />
        {title}
      </h2>

      <div className="h-64">
        {isEmpty ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400 text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[...data]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value, tooltipLabel]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}