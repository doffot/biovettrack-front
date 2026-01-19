import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { LucideIcon } from "lucide-react";

interface PieChartCardProps {
  title: string;
  icon: LucideIcon;
  data: readonly { name: string; value: number }[];
  tooltipLabel: string;
  emptyMessage?: string;
}

// Colores modernos que funcionan bien en ambos modos
const CHART_COLORS = [
  "#36BCD4", // Cyan (Accent)
  "#10B981", // Emerald
  "#8B5CF6", // Violet
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#14B8A6", // Teal
  "#F97316", // Orange
];

export function PieChartCard({
  title,
  icon: Icon,
  data,
  tooltipLabel,
  emptyMessage = "Sin datos disponibles",
}: PieChartCardProps) {
  const isEmpty = data.length === 0;

  // Tooltip personalizado adaptable
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
          <p className="text-vet-text font-medium text-sm">{payload[0].name}</p>
          <p className="text-vet-muted text-xs">
            {tooltipLabel}: <span className="text-vet-accent font-semibold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Legend personalizada adaptable
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-1.5">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-vet-muted font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border p-4 lg:p-6 shadow-card">
      {/* Header */}
      <h2 className="font-semibold text-vet-text mb-4 flex items-center gap-2">
        <div className="p-1.5 bg-vet-accent/10 rounded-lg border border-vet-accent/20">
          <Icon className="w-4 h-4 text-vet-accent" />
        </div>
        {title}
      </h2>

      {/* Chart */}
      <div className="h-64">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-vet-light rounded-full flex items-center justify-center mb-3 border border-border">
              <Icon className="w-6 h-6 text-vet-muted" />
            </div>
            <p className="text-vet-muted text-sm">{emptyMessage}</p>
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
                stroke="transparent" // Borde transparente para limpieza en ambos modos
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    style={{
                      filter: `drop-shadow(0 0 2px ${CHART_COLORS[index % CHART_COLORS.length]}40)`,
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