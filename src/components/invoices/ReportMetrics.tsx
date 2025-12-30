// src/components/invoices/ReportMetrics.tsx

interface ReportMetricsProps {
  total: number;
  paid: number;
  pending: number;
  partial: number;
}

interface MetricItemProps {
  value: number;
  label: string;
  variant?: "default" | "success" | "warning" | "info";
}

function MetricItem({ value, label, variant = "default" }: MetricItemProps) {
  const valueColors = {
    default: "text-gray-900",
    success: "text-emerald-600",
    warning: "text-amber-600",
    info: "text-[#0A7EA4]",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4 text-center">
      <p className={`text-3xl font-bold ${valueColors[variant]}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export function ReportMetrics({ total, paid, pending, partial }: ReportMetricsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <MetricItem value={total} label="Total" />
      <MetricItem value={paid} label="Pagadas" variant="success" />
      <MetricItem value={pending} label="Pendientes" variant="warning" />
      <MetricItem value={partial} label="Parciales" variant="info" />
    </div>
  );
}