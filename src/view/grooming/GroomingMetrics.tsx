interface GroomingMetricsProps {
  totalServices: number;
  completedServices: number;
  pendingServices: number;
}

export function GroomingMetrics({
  totalServices,
  completedServices,
  pendingServices,
}: GroomingMetricsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Total */}
      <div className="bg-card border border-border rounded-md p-4 text-center shadow-sm">
        <p className="text-3xl font-bold text-vet-text">{totalServices}</p>
        <p className="text-xs text-vet-muted mt-1">Total</p>
      </div>

      {/* Pagados */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md p-4 text-center shadow-sm">
        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{completedServices}</p>
        <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-1">Pagados</p>
      </div>

      {/* Pendientes */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-4 text-center shadow-sm">
        <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{pendingServices}</p>
        <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-1">Pendientes</p>
      </div>
    </div>
  );
}