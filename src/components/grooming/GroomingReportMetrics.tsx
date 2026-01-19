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
      <div className="bg-card border border-border rounded-xl p-4 text-center shadow-soft hover:shadow-card transition-shadow">
        <p className="text-3xl font-bold text-vet-text">{stats.total}</p>
        <p className="text-xs text-vet-muted mt-1 uppercase tracking-wide">Total</p>
      </div>

      {/* Pagados */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center shadow-soft hover:shadow-emerald-500/10 transition-shadow">
        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.paid}</p>
        <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-1 uppercase tracking-wide">Pagados</p>
      </div>

      {/* Pendientes */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center shadow-soft hover:shadow-amber-500/10 transition-shadow">
        <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
        <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-1 uppercase tracking-wide">Pendientes</p>
      </div>

      {/* Sin facturar */}
      <div className="bg-vet-light border border-border rounded-xl p-4 text-center shadow-soft hover:shadow-card transition-shadow">
        <p className="text-3xl font-bold text-vet-muted">{stats.notInvoiced}</p>
        <p className="text-xs text-vet-muted/80 mt-1 uppercase tracking-wide">Sin facturar</p>
      </div>
    </div>
  );
}