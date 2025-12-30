// src/components/invoices/ReportSummary.tsx

interface ReportSummaryProps {
  totalCobradoUSD: number;
  totalCobradoBs: number;
  pendienteUSD: number;
  pendienteBs: number;
  totalFacturado: number;
}

export function ReportSummary({
  totalCobradoUSD,
  totalCobradoBs,
  pendienteUSD,
  pendienteBs,
  totalFacturado,
}: ReportSummaryProps) {
  const totalPendiente = pendienteUSD + pendienteBs;
  
  const porcentajeCobrado = totalFacturado > 0
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

  return (
    <div className="bg-white border border-gray-200 rounded-md p-6">
      {/* Montos cobrados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Cobrado USD
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {formatUSD(totalCobradoUSD)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Cobrado Bolívares
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {formatBs(totalCobradoBs)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Pendiente USD
          </p>
          <p className={`text-2xl font-bold ${hasPendingUSD ? "text-amber-600" : "text-gray-300"}`}>
            {hasPendingUSD ? formatUSD(pendienteUSD) : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Pendiente Bolívares
          </p>
          <p className={`text-2xl font-bold ${hasPendingBs ? "text-amber-600" : "text-gray-300"}`}>
            {hasPendingBs ? formatBs(pendienteBs) : "—"}
          </p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progreso de cobro</span>
          <span className="text-sm font-semibold text-gray-900">
            {porcentajeCobrado}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0A7EA4] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(porcentajeCobrado, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}