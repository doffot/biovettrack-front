// src/components/invoices/ReportSummary.tsx

interface ReportSummaryProps {
  totalCobradoUSD: number;
  totalCobradoBs: number;
  cobradoBsEnUSD: number;
  totalCobradoGeneral: number;
  pendienteUSD: number;
  pendienteBs: number;
  totalFacturado: number;
}

export function ReportSummary({
  totalCobradoUSD,
  totalCobradoBs,
  cobradoBsEnUSD,
  totalCobradoGeneral,
  pendienteUSD,
  pendienteBs,
  totalFacturado,
}: ReportSummaryProps) {
  const totalPendiente = pendienteUSD + pendienteBs;

  const porcentajeCobrado =
    totalFacturado > 0
      ? Math.round(((totalFacturado - totalPendiente) / totalFacturado) * 100)
      : 0;

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

  const hasPendingUSD = pendienteUSD > 0;
  const hasPendingBs = pendienteBs > 0;
  const hasCobradoBs = totalCobradoBs > 0;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-md p-6">
      {/* Total General */}
      <div className="mb-6 pb-6 border-b border-slate-700">
        <p className="text-xs font-medium text-vet-muted uppercase tracking-wide mb-1">
          Total Cobrado
        </p>
        <p className="text-3xl font-bold text-vet-primary">
          {formatUSD(totalCobradoGeneral)}
        </p>
        <p className="text-xs text-vet-muted mt-1">
          {formatUSD(totalCobradoUSD)} USD + {formatUSD(cobradoBsEnUSD)} (Bs convertidos)
        </p>
      </div>

      {/* Desglose */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Cobrado USD */}
        <div>
          <p className="text-xs font-medium text-vet-muted uppercase tracking-wide mb-1">
            Cobrado USD
          </p>
          <p className="text-2xl font-bold text-vet-text">
            {formatUSD(totalCobradoUSD)}
          </p>
        </div>

        {/* Cobrado Bolívares */}
        <div>
          <p className="text-xs font-medium text-vet-muted uppercase tracking-wide mb-1">
            Cobrado Bolívares
          </p>
          {hasCobradoBs ? (
            <>
              <p className="text-lg font-bold text-vet-text">
                {formatUSD(cobradoBsEnUSD)}
              </p>
              <p className="text-sm text-vet-muted">
                {formatBs(totalCobradoBs)}
              </p>
            </>
          ) : (
            <p className="text-2xl font-bold text-slate-500">—</p>
          )}
        </div>

        {/* Pendiente USD */}
        <div>
          <p className="text-xs font-medium text-vet-muted uppercase tracking-wide mb-1">
            Pendiente USD
          </p>
          <p className={`text-2xl font-bold ${hasPendingUSD ? "text-amber-400" : "text-slate-500"}`}>
            {hasPendingUSD ? formatUSD(pendienteUSD) : "—"}
          </p>
        </div>

        {/* Pendiente Bolívares */}
        <div>
          <p className="text-xs font-medium text-vet-muted uppercase tracking-wide mb-1">
            Pendiente Bolívares
          </p>
          <p className={`text-2xl font-bold ${hasPendingBs ? "text-amber-400" : "text-slate-500"}`}>
            {hasPendingBs ? formatBs(pendienteBs) : "—"}
          </p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-vet-muted">Progreso de cobro</span>
          <span className="text-sm font-semibold text-vet-text">
            {porcentajeCobrado}%
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-vet-primary rounded-full transition-all duration-500"
            style={{ width: `${Math.min(porcentajeCobrado, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}