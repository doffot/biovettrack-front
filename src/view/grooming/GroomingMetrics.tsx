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
      <div className="bg-white border border-gray-200 rounded-md p-4 text-center">
        <p className="text-3xl font-bold text-gray-900">{totalServices}</p>
        <p className="text-xs text-gray-500 mt-1">Total</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-4 text-center">
        <p className="text-3xl font-bold text-emerald-600">{completedServices}</p>
        <p className="text-xs text-gray-500 mt-1">Pagados</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-4 text-center">
        <p className="text-3xl font-bold text-amber-600">{pendingServices}</p>
        <p className="text-xs text-gray-500 mt-1">Pendientes</p>
      </div>
    </div>
  );
}