// src/views/invoices/components/ReportServiceTags.tsx
import { TrendingUp, Scissors, Stethoscope, Syringe, FlaskConical, Package, FileText } from "lucide-react";
import { getItemTypeLabel } from "../../utils/reportUtils";

interface ReportServiceTagsProps {
  byItemType: Record<string, { count: number; total: number }>;
}

const getIcon = (type: string): React.ElementType => {
  const icons: Record<string, React.ElementType> = {
    grooming: Scissors,
    consulta: Stethoscope,
    vacuna: Syringe,
    labExam: FlaskConical,
    producto: Package,
  };
  return icons[type] || FileText;
};

const getColors = (type: string) => {
  const colors: Record<string, string> = {
    grooming: "bg-pink-50 text-pink-700 border-pink-200",
    consulta: "bg-vet-light text-vet-primary border-vet-accent/30",
    vacuna: "bg-emerald-50 text-emerald-700 border-emerald-200",
    labExam: "bg-purple-50 text-purple-700 border-purple-200",
    producto: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return colors[type] || "bg-vet-light text-vet-text border-vet-light";
};

export function ReportServiceTags({ byItemType }: ReportServiceTagsProps) {
  if (Object.keys(byItemType).length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-vet-text mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-vet-primary" /> 
        Por Servicio
      </h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(byItemType)
          .sort((a, b) => b[1].count - a[1].count)
          .map(([type, data]) => {
            const Icon = getIcon(type);
            const colors = getColors(type);
            return (
              <div
                key={type}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium transition-all hover:shadow-soft ${colors}`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{getItemTypeLabel(type)}</span>
                <span className="text-sm font-bold">{data.count}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}