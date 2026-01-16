// src/components/grooming/GroomingReportMetrics.tsx
import { useMemo } from "react";
import type { EnrichedGroomingService } from "../../view/grooming/GroomingReportView";

interface GroomingReportMetricsProps {
  services: EnrichedGroomingService[];
}

export function GroomingReportMetrics({ services }: GroomingReportMetricsProps) {
  const stats = useMemo(() => {
    const total = services.length;
    const paid = services.filter((s) => s.paymentInfo.paymentStatus === "Pagado").length;
    const pending = services.filter(
      (s) =>
        s.paymentInfo.paymentStatus === "Pendiente" ||
        s.paymentInfo.paymentStatus === "Parcial"
    ).length;
    const notInvoiced = services.filter(
      (s) => s.paymentInfo.paymentStatus === "Sin facturar"
    ).length;

    return { total, paid, pending, notInvoiced };
  }, [services]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {/* Total */}
      <div className="bg-sky-soft border border-slate-700/50 rounded-xl p-4 text-center shadow-lg shadow-black/10 hover:shadow-vet-primary/10 transition-shadow">
        <p className="text-3xl font-bold text-vet-text">{stats.total}</p>
        <p className="text-xs text-vet-muted mt-1 uppercase tracking-wide">Total</p>
      </div>

      {/* Pagados */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 rounded-xl p-4 text-center shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/20 transition-shadow">
        <p className="text-3xl font-bold text-emerald-400">{stats.paid}</p>
        <p className="text-xs text-emerald-300/80 mt-1 uppercase tracking-wide">Pagados</p>
      </div>

      {/* Pendientes */}
      <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-xl p-4 text-center shadow-lg shadow-amber-500/5 hover:shadow-amber-500/20 transition-shadow">
        <p className="text-3xl font-bold text-amber-400">{stats.pending}</p>
        <p className="text-xs text-amber-300/80 mt-1 uppercase tracking-wide">Pendientes</p>
      </div>

      {/* Sin facturar */}
      <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/30 border border-slate-600/50 rounded-xl p-4 text-center shadow-lg shadow-black/10 hover:shadow-black/20 transition-shadow">
        <p className="text-3xl font-bold text-slate-400">{stats.notInvoiced}</p>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">Sin facturar</p>
      </div>
    </div>
  );
}