// src/components/patients/PatientStats.tsx
import { FileText, Dog, Cat, Calendar } from "lucide-react";
import type { Patient } from "../../types";

interface PatientStatsProps {
  patients: Patient[];
  isVisible: boolean;
}

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "primary" | "blue" | "purple" | "green";
  delay: string;
  isVisible: boolean;
}

const colorClasses = {
  primary: {
    bg: "bg-gradient-to-br from-vet-light to-vet-light/50",
    iconBg: "bg-vet-primary/10",
    icon: "text-vet-primary",
    value: "text-vet-primary",
    border: "border-vet-primary/20",
  },
  blue: {
    bg: "bg-gradient-to-br from-blue-50 to-blue-50/50",
    iconBg: "bg-blue-500/10",
    icon: "text-blue-600",
    value: "text-blue-600",
    border: "border-blue-200",
  },
  purple: {
    bg: "bg-gradient-to-br from-purple-50 to-purple-50/50",
    iconBg: "bg-purple-500/10",
    icon: "text-purple-600",
    value: "text-purple-600",
    border: "border-purple-200",
  },
  green: {
    bg: "bg-gradient-to-br from-emerald-50 to-emerald-50/50",
    iconBg: "bg-emerald-500/10",
    icon: "text-emerald-600",
    value: "text-emerald-600",
    border: "border-emerald-200",
  },
};

function StatItem({ icon: Icon, label, value, color, delay, isVisible }: StatItemProps) {
  const classes = colorClasses[color];

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl p-4 border transition-all duration-500
        ${classes.bg} ${classes.border}
        hover:shadow-card hover:scale-[1.02] hover:-translate-y-0.5
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      style={{ transitionDelay: delay }}
    >
      {/* Decorative circle */}
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/40 blur-2xl" />
      
      <div className="relative flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${classes.iconBg} backdrop-blur-sm`}>
          <Icon className={`w-5 h-5 ${classes.icon}`} />
        </div>
        <div>
          <p className="text-xs text-vet-muted font-medium tracking-wide uppercase">{label}</p>
          <p className={`text-2xl font-bold ${classes.value} font-montserrat`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function PatientStats({ patients, isVisible }: PatientStatsProps) {
  const stats = {
    total: patients.length,
    caninos: patients.filter((p) => p.species.toLowerCase() === "canino").length,
    felinos: patients.filter((p) => p.species.toLowerCase() === "felino").length,
    thisMonth: patients.filter((p) => {
      const patientDate = new Date(p.birthDate);
      const now = new Date();
      return patientDate.getMonth() === now.getMonth() && patientDate.getFullYear() === now.getFullYear();
    }).length,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatItem
        icon={FileText}
        label="Total"
        value={stats.total}
        color="primary"
        delay="0ms"
        isVisible={isVisible}
      />
      <StatItem
        icon={Dog}
        label="Caninos"
        value={stats.caninos}
        color="blue"
        delay="50ms"
        isVisible={isVisible}
      />
      <StatItem
        icon={Cat}
        label="Felinos"
        value={stats.felinos}
        color="purple"
        delay="100ms"
        isVisible={isVisible}
      />
      <StatItem
        icon={Calendar}
        label="Este Mes"
        value={stats.thisMonth}
        color="green"
        delay="150ms"
        isVisible={isVisible}
      />
    </div>
  );
}