// src/views/invoices/components/ReportIncomeCards.tsx
import { DollarSign, Banknote, Clock } from "lucide-react";
import { formatCurrency } from "../../utils/dashboardUtils";

interface ReportIncomeCardsProps {
  totalCobradoUSD: number;
  totalCobradoBs: number;
  totalPendienteUSD: number;
}

export function ReportIncomeCards({
  totalCobradoUSD,
  totalCobradoBs,
  totalPendienteUSD,
}: ReportIncomeCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* USD */}
      <div className="bg-white rounded-2xl border-2 border-emerald-200 p-5 hover:shadow-soft transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-vet-muted uppercase tracking-wide">
            Cobrado USD
          </span>
          <div className="p-2 bg-emerald-100 rounded-xl">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
        <p className="text-2xl font-bold text-emerald-600">
          {formatCurrency(totalCobradoUSD, "USD")}
        </p>
      </div>

      {/* Bs */}
      <div className="bg-white rounded-2xl border-2 border-vet-accent/30 p-5 hover:shadow-soft transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-vet-muted uppercase tracking-wide">
            Cobrado Bs
          </span>
          <div className="p-2 bg-vet-light rounded-xl">
            <Banknote className="w-5 h-5 text-vet-primary" />
          </div>
        </div>
        <p className="text-2xl font-bold text-vet-primary">
          {formatCurrency(totalCobradoBs, "Bs")}
        </p>
      </div>

      {/* Pendiente */}
      <div className="bg-white rounded-2xl border-2 border-amber-200 p-5 hover:shadow-soft transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-vet-muted uppercase tracking-wide">
            Pendiente
          </span>
          <div className="p-2 bg-amber-100 rounded-xl">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
        </div>
        <p className="text-2xl font-bold text-amber-600">
          {formatCurrency(totalPendienteUSD, "USD")}
        </p>
      </div>
    </div>
  );
}