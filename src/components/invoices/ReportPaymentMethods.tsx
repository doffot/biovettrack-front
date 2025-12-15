// src/views/invoices/components/ReportPaymentMethods.tsx
import { CreditCard } from "lucide-react";
import { formatCurrency } from "../../utils/dashboardUtils";

interface ReportPaymentMethodsProps {
  byPaymentMethod: Record<string, { count: number; totalUSD: number; totalBs: number }>;
}

export function ReportPaymentMethods({ byPaymentMethod }: ReportPaymentMethodsProps) {
  if (Object.keys(byPaymentMethod).length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border-2 border-vet-light overflow-hidden mb-6 shadow-soft">
      <div className="px-5 py-4 border-b border-vet-light bg-vet-light/30 flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-vet-primary" />
        <h3 className="text-sm font-bold text-vet-text">Por Método de Pago</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-vet-light/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-vet-muted uppercase tracking-wide">
                Método
              </th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-vet-muted uppercase tracking-wide">
                Cantidad
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-vet-muted uppercase tracking-wide">
                USD
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-vet-muted uppercase tracking-wide">
                Bolívares
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vet-light">
            {Object.entries(byPaymentMethod).map(([method, data]) => (
              <tr key={method} className="hover:bg-vet-light/30 transition-colors">
                <td className="px-5 py-4 text-sm font-semibold text-vet-text">{method}</td>
                <td className="px-5 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-vet-light text-vet-primary text-sm font-bold">
                    {data.count}
                  </span>
                </td>
                <td className={`px-5 py-4 text-sm text-right font-semibold ${
                  data.totalUSD > 0 ? "text-emerald-600" : "text-vet-muted/50"
                }`}>
                  {data.totalUSD > 0 ? formatCurrency(data.totalUSD, "USD") : "—"}
                </td>
                <td className={`px-5 py-4 text-sm text-right font-semibold ${
                  data.totalBs > 0 ? "text-vet-primary" : "text-vet-muted/50"
                }`}>
                  {data.totalBs > 0 ? formatCurrency(data.totalBs, "Bs") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}