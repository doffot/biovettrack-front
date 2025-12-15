// src/views/invoices/components/ReportStats.tsx
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import type {ReportStats as Stats } from "../../types/reportTypes";

interface ReportStatsProps {
  stats: Stats ;
}

interface StatCardProps {
  label: string;
  value: number;
  sublabel?: string;
  icon: React.ElementType;
  variant?: "default" | "success" | "warning" | "info";
}

function StatCard({ label, value, sublabel, icon: Icon, variant = "default" }: StatCardProps) {
  const variants = {
    default: "bg-white border-vet-light",
    success: "bg-emerald-50 border-emerald-200",
    warning: "bg-amber-50 border-amber-200",
    info: "bg-vet-light border-vet-accent/30",
  };

  const iconVariants = {
    default: "text-vet-muted bg-vet-light",
    success: "text-emerald-600 bg-emerald-100",
    warning: "text-amber-600 bg-amber-100",
    info: "text-vet-primary bg-vet-light",
  };

  const valueVariants = {
    default: "text-vet-text",
    success: "text-emerald-600",
    warning: "text-amber-600",
    info: "text-vet-primary",
  };

  return (
    <div className={`rounded-2xl border-2 p-5 transition-all hover:shadow-soft ${variants[variant]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-vet-muted uppercase tracking-wide">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${valueVariants[variant]}`}>{value}</p>
          {sublabel && <p className="text-xs text-vet-muted mt-1">{sublabel}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${iconVariants[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export function ReportStats({ stats }: ReportStatsProps) {
  const paidPercentage = stats.totalInvoices > 0 
    ? Math.round((stats.paidCount / stats.totalInvoices) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard label="Facturas" value={stats.totalInvoices} icon={FileText} />
      <StatCard 
        label="Pagadas" 
        value={stats.paidCount} 
        sublabel={`${paidPercentage}%`} 
        icon={CheckCircle} 
        variant="success" 
      />
      <StatCard label="Pendientes" value={stats.pendingCount} icon={Clock} variant="warning" />
      <StatCard label="Parciales" value={stats.partialCount} icon={AlertCircle} variant="info" />
    </div>
  );
}