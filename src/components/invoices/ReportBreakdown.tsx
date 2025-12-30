// src/components/invoices/ReportBreakdown.tsx
import { getItemTypeLabel } from "../../utils/reportUtils";

interface ReportBreakdownProps {
  byService: Record<string, { count: number; total: number }>;
  byPaymentMethod: Record<string, { count: number; totalUSD: number; totalBs: number }>;
}

interface BreakdownListProps {
  title: string;
  items: Array<{ label: string; value: number; secondary?: string }>;
}

function BreakdownList({ title, items }: BreakdownListProps) {
  if (items.length === 0) {
    return null;
  }

  const maxValue = Math.max(...items.map((item) => item.value));

  return (
    <div className="bg-white border border-gray-200 rounded-md">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-4 space-y-3">
        {items.map((item) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">{item.label}</span>
                <div className="flex items-center gap-2">
                  {item.secondary && (
                    <span className="text-xs text-gray-400">{item.secondary}</span>
                  )}
                  <span className="text-sm font-semibold text-gray-900 tabular-nums">
                    {item.value}
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0A7EA4]/20 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ReportBreakdown({ byService, byPaymentMethod }: ReportBreakdownProps) {
  const serviceItems = Object.entries(byService)
    .map(([type, data]) => ({
      label: getItemTypeLabel(type),
      value: data.count,
    }))
    .sort((a, b) => b.value - a.value);

  const paymentItems = Object.entries(byPaymentMethod)
    .map(([method, data]) => ({
      label: method,
      value: data.count,
    }))
    .sort((a, b) => b.value - a.value);

  if (serviceItems.length === 0 && paymentItems.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <BreakdownList title="Por Servicio" items={serviceItems} />
      <BreakdownList title="Por Método de Pago" items={paymentItems} />
    </div>
  );
}