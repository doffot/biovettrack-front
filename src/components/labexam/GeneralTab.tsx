// src/components/labexam/GeneralTab.tsx
import { 
  Calendar, 
  DollarSign, 
  Stethoscope, 
  Droplets,
  Activity,
  Beaker,
  CircleDot,
  AlertCircle,
  CheckCircle2,
  Percent,
} from "lucide-react";
import type { FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form";
import type { LabExamFormData } from "../../types";

interface GeneralTabProps {
  species: 'canino' | 'felino';
  register: UseFormRegister<LabExamFormData>;
  errors: FieldErrors<LabExamFormData>;
  watch: UseFormWatch<LabExamFormData>;
}

const normalValues = {
  canino: {
    hematocrit: [37, 55],
    whiteBloodCells: [6000, 17000],
    totalProtein: [5.4, 7.8],
    platelets: [200000, 500000],
  },
  felino: {
    hematocrit: [30, 45],
    whiteBloodCells: [5000, 19500],
    totalProtein: [5.7, 8.9],
    platelets: [300000, 800000],
  }
};

export function GeneralTab({ 
  species,
  register, 
  errors, 
  watch,
}: GeneralTabProps) {
  const currentNormalValues = normalValues[species];

  const hemogramFields = [
    { 
      name: "hematocrit" as const, 
      label: "Hematocrito", 
      unit: "%", 
      step: "0.1", 
      rangeKey: 'hematocrit' as const,
      icon: Droplets,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    { 
      name: "whiteBloodCells" as const, 
      label: "Glóbulos Blancos", 
      unit: "células/µL", 
      step: "1", 
      rangeKey: 'whiteBloodCells' as const,
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    { 
      name: "totalProtein" as const, 
      label: "Proteína Total", 
      unit: "g/dL", 
      step: "0.1", 
      rangeKey: 'totalProtein' as const,
      icon: Beaker,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    { 
      name: "platelets" as const, 
      label: "Plaquetas", 
      unit: "células/µL", 
      step: "1", 
      rangeKey: 'platelets' as const,
      icon: CircleDot,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  const getValueStatus = (value: number | undefined, rangeKey: keyof typeof normalValues.canino) => {
    if (value === undefined || value === null || value === 0) return 'empty';
    const range = currentNormalValues[rangeKey];
    if (value < range[0]) return 'low';
    if (value > range[1]) return 'high';
    return 'normal';
  };

  const inputStyle = { backgroundColor: "var(--color-vet-sidebar)" };

  // Calcular total con descuento
  const cost = watch("cost") || 0;
  const discount = watch("discount") || 0;
  const totalCost = Math.max(0, cost - discount);

  return (
    <div className="space-y-5">
      {/* Información del Examen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Fecha */}
        <div className="relative">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-vet-text mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-vet-primary" />
            Fecha
            <span className="text-vet-danger">*</span>
          </label>
          <input
            type="date"
            style={inputStyle}
            {...register("date", { required: "Requerido" })}
            className={`w-full px-3 py-2 rounded-lg border text-sm transition-all
              ${errors.date 
                ? 'border-vet-danger focus:border-vet-danger focus:ring-vet-danger/20' 
                : 'border-border hover:border-vet-primary/50 focus:border-vet-primary focus:ring-vet-primary/20'
              } focus:outline-none focus:ring-2 text-vet-text`}
          />
          {errors.date && (
            <p className="mt-1 text-[10px] text-vet-danger flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.date.message}
            </p>
          )}
        </div>

        {/* Costo */}
        <div className="relative">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-vet-text mb-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            Costo
            <span className="text-vet-danger">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-vet-muted">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              style={inputStyle}
              {...register("cost", { 
                required: "Requerido",
                min: { value: 0.01, message: "Mayor a 0" },
                valueAsNumber: true,
              })}
              className={`w-full pl-7 pr-3 py-2 rounded-lg border text-sm transition-all
                ${errors.cost 
                  ? 'border-vet-danger focus:border-vet-danger focus:ring-vet-danger/20' 
                  : 'border-border hover:border-vet-primary/50 focus:border-vet-primary focus:ring-vet-primary/20'
                } focus:outline-none focus:ring-2 text-vet-text`}
              placeholder="0.00"
            />
          </div>
          {errors.cost && (
            <p className="mt-1 text-[10px] text-vet-danger flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.cost.message}
            </p>
          )}
        </div>

        {/* Descuento */}
        <div className="relative">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-vet-text mb-1.5">
            <Percent className="w-3.5 h-3.5 text-amber-500" />
            Descuento
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-vet-muted">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              style={inputStyle}
              {...register("discount", { 
                valueAsNumber: true,
                min: { value: 0, message: "No puede ser negativo" },
              })}
              className="w-full pl-7 pr-3 py-2 rounded-lg border border-border text-sm transition-all text-vet-text
                hover:border-vet-primary/50 focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20 focus:outline-none"
              placeholder="0.00"
            />
          </div>
          {/* Mostrar total si hay descuento */}
          {discount > 0 && (
            <p className="mt-1 text-[10px] text-emerald-500 font-medium">
              Total: ${totalCost.toFixed(2)}
            </p>
          )}
        </div>

        {/* Veterinario */}
        <div className="relative">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-vet-text mb-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-cyan-500" />
            Veterinario
          </label>
          <input
            type="text"
            style={inputStyle}
            {...register("treatingVet")}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm transition-all text-vet-text
              hover:border-vet-primary/50 focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20 focus:outline-none"
            placeholder="Dr. Nombre"
          />
        </div>
      </div>

      {/* Valores del Hemograma */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-vet-text flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-vet-primary"></div>
            Valores del Hemograma
          </h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {hemogramFields.map((field) => {
            const Icon = field.icon;
            const value = watch(field.name);
            const status = getValueStatus(value, field.rangeKey);
            const range = currentNormalValues[field.rangeKey];
            const hasError = errors[field.name];

            return (
              <div 
                key={field.name} 
                className={`relative p-3 rounded-xl border-2 transition-all duration-200 bg-card ${
                  hasError 
                    ? 'border-vet-danger/50' 
                    : status === 'low' || status === 'high'
                      ? 'border-amber-500/50'
                      : status === 'normal'
                        ? 'border-emerald-500/50'
                        : 'border-border hover:border-vet-muted'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-7 h-7 rounded-lg ${field.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${field.color}`} />
                  </div>
                  {status !== 'empty' && (
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                      status === 'normal' 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : status === 'low'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-red-500/10 text-red-500'
                    }`}>
                      {status === 'normal' ? (
                        <><CheckCircle2 className="w-2.5 h-2.5" /> OK</>
                      ) : status === 'low' ? (
                        <><AlertCircle className="w-2.5 h-2.5" /> Bajo</>
                      ) : (
                        <><AlertCircle className="w-2.5 h-2.5" /> Alto</>
                      )}
                    </div>
                  )}
                </div>

                <label className="block text-[10px] font-semibold text-vet-muted mb-1.5 truncate">
                  {field.label}
                </label>

                <div className="relative">
                  <input
                    type="number"
                    step={field.step}
                    style={inputStyle}
                    {...register(field.name, {
                      required: "Requerido",
                      min: { value: 0, message: "≥0" },
                      valueAsNumber: true,
                    })}
                    className={`w-full px-2 py-1.5 pr-12 rounded-lg border text-sm font-semibold transition-all
                      ${hasError 
                        ? 'border-vet-danger text-vet-danger' 
                        : status === 'low' || status === 'high'
                          ? 'border-amber-500/50 text-amber-500'
                          : status === 'normal'
                            ? 'border-emerald-500/50 text-emerald-500'
                            : 'border-border text-vet-text'
                      } focus:outline-none focus:ring-2 focus:ring-vet-primary/30`}
                    placeholder="0"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-vet-muted font-medium">
                    {field.unit}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[9px] text-vet-muted">
                    Ref: {range[0]} - {range[1]}
                  </span>
                  {hasError && (
                    <span className="text-[9px] text-vet-danger font-medium">
                      {errors[field.name]?.message}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}