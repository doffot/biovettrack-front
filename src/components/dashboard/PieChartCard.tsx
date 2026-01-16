// src/components/dashboard/PieChartCard.tsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { LucideIcon } from "lucide-react";

interface PieChartCardProps {
  title: string;
  icon: LucideIcon;
  data: readonly { name: string; value: number }[];
  tooltipLabel: string;
  emptyMessage?: string;
}

// Colores adaptados para dark mode (más brillantes)
const DARK_CHART_COLORS = [
  "#36BCD4", // vet-accent (cyan)
  "#10B981", // emerald-500
  "#8B5CF6", // violet-500
  "#F59E0B", // amber-500
  "#EC4899", // pink-500
  "#6366F1", // indigo-500
  "#14B8A6", // teal-500
  "#F97316", // orange-500
];

export function PieChartCard({
  title,
  icon: Icon,
  data,
  tooltipLabel,
  emptyMessage = "Sin datos disponibles",
}: PieChartCardProps) {
  const isEmpty = data.length === 0;

  // Tooltip personalizado para dark mode
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-white/20 rounded-lg px-3 py-2 shadow-xl">
          <p className="text-white font-medium text-sm">{payload[0].name}</p>
          <p className="text-slate-300 text-xs">
            {tooltipLabel}: <span className="text-vet-accent font-semibold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Legend personalizada para dark mode
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-1.5">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-slate-400">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/10 p-4 lg:p-6 shadow-xl">
      {/* Header */}
      <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
        <div className="p-1.5 bg-vet-accent/20 rounded-lg border border-vet-accent/30">
          <Icon className="w-4 h-4 text-vet-accent" />
        </div>
        {title}
      </h2>

      {/* Chart */}
      <div className="h-64">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-slate-800/60 rounded-full flex items-center justify-center mb-3 border border-white/10">
              <Icon className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-slate-500 text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {/* Glow effect para cada color */}
                {DARK_CHART_COLORS.map(( index) => (
                  <filter key={`glow-${index}`} id={`glow-${index}`}>
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                ))}
              </defs>
              <Pie
                data={[...data]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                stroke="rgba(15, 23, 42, 0.8)"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}-${index}`}
                    fill={DARK_CHART_COLORS[index % DARK_CHART_COLORS.length]}
                    style={{
                      filter: `drop-shadow(0 0 6px ${DARK_CHART_COLORS[index % DARK_CHART_COLORS.length]}40)`,
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}