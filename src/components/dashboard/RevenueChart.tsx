import { useState } from "react";
import { TrendingUp, DollarSign, Calendar } from "lucide-react";
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
import type { RevenueAmounts, RevenueChartItem } from "../../hooks/useDashboardData";

interface RevenueChartProps {
  data: RevenueChartItem[];
  weekRevenue: RevenueAmounts;
  monthRevenue: RevenueAmounts;
}

type CurrencyFilter = "total" | "USD" | "Bs";

export function RevenueChart({ data, weekRevenue, monthRevenue }: RevenueChartProps) {
  const [currencyFilter, setCurrencyFilter] = useState<CurrencyFilter>("total");

  const formatUSD = (amount: number) => `$${amount.toFixed(2)}`;
  const formatBs = (amount: number) =>
    `Bs ${amount.toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Tooltip personalizado adaptable
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
          <p className="text-vet-text font-medium text-sm mb-1">{label}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} className="text-vet-muted text-xs">
              {entry.name}: <span className="text-vet-accent font-semibold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border p-4 lg:p-6 shadow-card">
      <div className="flex flex-col gap-4 mb-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-semibold text-vet-text flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            Ingresos Últimos 7 Días
          </h2>

          {/* Filtro de moneda */}
          <div className="flex items-center gap-1 bg-vet-light p-1 rounded-lg border border-border">
            <button
              onClick={() => setCurrencyFilter("total")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ${
                currencyFilter === "total"
                  ? "bg-vet-accent text-white shadow-soft"
                  : "text-vet-muted hover:text-vet-text hover:bg-hover"
              }`}
            >
              Total USD
            </button>
            <button
              onClick={() => setCurrencyFilter("USD")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ${
                currencyFilter === "USD"
                  ? "bg-emerald-500 text-white shadow-soft"
                  : "text-vet-muted hover:text-vet-text hover:bg-hover"
              }`}
            >
              USD
            </button>
            <button
              onClick={() => setCurrencyFilter("Bs")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ${
                currencyFilter === "Bs"
                  ? "bg-violet-500 text-white shadow-soft"
                  : "text-vet-muted hover:text-vet-text hover:bg-hover"
              }`}
            >
              Bs
            </button>
          </div>
        </div>

        {/* Resumen */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {/* Card Semana */}
          <div className="flex items-center gap-3 bg-vet-light px-4 py-3 rounded-xl border border-border backdrop-blur-sm">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-vet-muted text-xs">Semana</span>
              <span className="font-bold text-blue-500 text-lg">{formatUSD(weekRevenue.totalUSD)}</span>
              <span className="text-[10px] text-vet-muted/80">
                {formatUSD(weekRevenue.USD)} + {formatBs(weekRevenue.Bs)}
              </span>
            </div>
          </div>

          {/* Card Mes */}
          <div className="flex items-center gap-3 bg-vet-light px-4 py-3 rounded-xl border border-border backdrop-blur-sm">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-vet-muted text-xs">Mes</span>
              <span className="font-bold text-emerald-500 text-lg">{formatUSD(monthRevenue.totalUSD)}</span>
              <span className="text-[10px] text-vet-muted/80">
                {formatUSD(monthRevenue.USD)} + {formatBs(monthRevenue.Bs)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <defs>
              {/* Gradientes para las barras (Semánticos - funcionan bien en ambos) */}
              <linearGradient id="gradient-total" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#36BCD4" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#36BCD4" stopOpacity={0.3}/>
              </linearGradient>
              <linearGradient id="gradient-usd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.3}/>
              </linearGradient>
              <linearGradient id="gradient-bs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.3}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 11, fill: "var(--color-vet-muted)" }}
              stroke="var(--color-border)"
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: "var(--color-vet-muted)" }}
              stroke="transparent"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'var(--color-hover)', opacity: 0.4 }}
            />
            {currencyFilter !== "total" && (
              <Legend 
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
                // Usamos la variable CSS directamente en el formatter no es ideal, pero el color hexadecimal gris neutro funciona
                formatter={(value) => <span style={{ color: "#94A3B8", fontSize: "12px" }}>{value}</span>}
              />
            )}

            {currencyFilter === "total" && (
              <Bar 
                dataKey="totalUSD" 
                fill="url(#gradient-total)"
                radius={[8, 8, 0, 0]} 
                name="Total USD"
                animationDuration={600}
                animationBegin={0}
              />
            )}
            {currencyFilter === "USD" && (
              <Bar 
                dataKey="USD" 
                fill="url(#gradient-usd)"
                radius={[8, 8, 0, 0]} 
                name="USD"
                animationDuration={600}
                animationBegin={0}
              />
            )}
            {currencyFilter === "Bs" && (
              <Bar 
                dataKey="Bs" 
                fill="url(#gradient-bs)"
                radius={[8, 8, 0, 0]} 
                name="Bs"
                animationDuration={600}
                animationBegin={0}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}