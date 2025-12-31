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
      <div className="bg-white border border-gray-200 rounded-md p-4 text-center">
        <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        <p className="text-xs text-gray-500 mt-1">Total</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-4 text-center">
        <p className="text-3xl font-bold text-emerald-600">{stats.paid}</p>
        <p className="text-xs text-gray-500 mt-1">Pagados</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-4 text-center">
        <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
        <p className="text-xs text-gray-500 mt-1">Pendientes</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-4 text-center">
        <p className="text-3xl font-bold text-gray-400">{stats.notInvoiced}</p>
        <p className="text-xs text-gray-500 mt-1">Sin facturar</p>
      </div>
    </div>
  );
}