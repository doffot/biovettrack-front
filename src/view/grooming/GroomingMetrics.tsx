// src/components/grooming/GroomingMetrics.tsx

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
      <div className="bg-slate-800 border border-slate-700 rounded-md p-4 text-center">
        <p className="text-3xl font-bold text-vet-text">{totalServices}</p>
        <p className="text-xs text-vet-muted mt-1">Total</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-md p-4 text-center">
        <p className="text-3xl font-bold text-emerald-400">{completedServices}</p>
        <p className="text-xs text-vet-muted mt-1">Pagados</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-md p-4 text-center">
        <p className="text-3xl font-bold text-amber-400">{pendingServices}</p>
        <p className="text-xs text-vet-muted mt-1">Pendientes</p>
      </div>
    </div>
  );
}