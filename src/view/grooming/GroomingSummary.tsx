// src/components/grooming/GroomingReportSummary.tsx
import { useMemo } from "react";
import type { EnrichedGroomingService } from "./GroomingReportView";

interface GroomingReportSummaryProps {
  services: EnrichedGroomingService[];
}

export function GroomingReportSummary({ services }: GroomingReportSummaryProps) {
  const stats = useMemo(() => {
    let paidUSD = 0;
    let paidBs = 0;
    let paidBsInUSD = 0;
    let pendingUSD = 0;

    services.forEach((service) => {
      const cost = service.cost || 0;
      const { paymentInfo } = service;

      paidUSD += paymentInfo.amountPaidUSD;
      paidBs += paymentInfo.amountPaidBs;

      if (paymentInfo.amountPaidBs > 0 && paymentInfo.exchangeRate > 0) {
        paidBsInUSD += paymentInfo.amountPaidBs / paymentInfo.exchangeRate;
      }

      if (!paymentInfo.isPaid) {
        const totalPaidInUSD =
          paymentInfo.amountPaidUSD +
          (paymentInfo.exchangeRate > 0
            ? paymentInfo.amountPaidBs / paymentInfo.exchangeRate
            : 0);
        const pending = cost - totalPaidInUSD;
        if (pending > 0) pendingUSD += pending;
      }
    });

    const totalCobrado = paidUSD + paidBsInUSD;

    return { paidUSD, paidBs, paidBsInUSD, totalCobrado, pendingUSD };
  }, [services]);

  const formatUSD = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);

  const formatBs = (amount: number) =>
    `Bs ${amount.toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const hasPaidBs = stats.paidBs > 0;
  const hasPending = stats.pendingUSD > 0;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-md p-6">
      {/* Total General */}
      <div className="mb-6 pb-6 border-b border-slate-700">
        <p className="text-xs font-medium text-vet-muted uppercase tracking-wide mb-1">
          Total Cobrado
        </p>
        <p className="text-3xl font-bold text-vet-primary">
          {formatUSD(stats.totalCobrado)}
        </p>
        <p className="text-xs text-vet-muted mt-1">
          {formatUSD(stats.paidUSD)} USD + {formatUSD(stats.paidBsInUSD)} (Bs convertidos)
        </p>
      </div>

      {/* Desglose */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <p className="text-xs font-medium text-vet-muted uppercase tracking-wide mb-1">
            Cobrado USD
          </p>
          <p className="text-2xl font-bold text-vet-text">{formatUSD(stats.paidUSD)}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-vet-muted uppercase tracking-wide mb-1">
            Cobrado Bolívares
          </p>
          {hasPaidBs ? (
            <>
              <p className="text-lg font-bold text-vet-text">
                {formatUSD(stats.paidBsInUSD)}
              </p>
              <p className="text-sm text-vet-muted">{formatBs(stats.paidBs)}</p>
            </>
          ) : (
            <p className="text-2xl font-bold text-slate-500">—</p>
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-vet-muted uppercase tracking-wide mb-1">
            Pendiente
          </p>
          <p
            className={`text-2xl font-bold ${hasPending ? "text-amber-400" : "text-slate-500"}`}
          >
            {hasPending ? formatUSD(stats.pendingUSD) : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}