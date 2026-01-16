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
} from "lucide-react";
import type { FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form";
import type { LabExamFormData } from "../../types";

interface GeneralTabProps {
  species: 'canino' | 'felino';
  register: UseFormRegister<LabExamFormData>;
  errors: FieldErrors<LabExamFormData>;
  watch: UseFormWatch<LabExamFormData>;
}

//  Rangos normales en células/µL (modo manual)
const normalValues = {
  canino: {
    hematocrit: [37, 55],           // %
    whiteBloodCells: [6000, 17000],  // células/µL
    totalProtein: [5.4, 7.8],       // g/dL
    platelets: [200000, 500000],   // células/µL
  },
  felino: {
    hematocrit: [30, 45],          // %
    whiteBloodCells: [5000, 19500], // células/µL
    totalProtein: [5.7, 8.9],       // g/dL
    platelets: [300000, 800000],   // células/µL
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
      color: "text-red-400",
      bgColor: "bg-red-900/20",
    },
    { 
      name: "whiteBloodCells" as const, 
      label: "Glóbulos Blancos", 
      unit: "células/µL", 
      step: "1", 
      rangeKey: 'whiteBloodCells' as const,
      icon: Activity,
      color: "text-blue-400",
      bgColor: "bg-blue-900/20",
    },
    { 
      name: "totalProtein" as const, 
      label: "Proteína Total", 
      unit: "g/dL", 
      step: "0.1", 
      rangeKey: 'totalProtein' as const,
      icon: Beaker,
      color: "text-purple-400",
      bgColor: "bg-purple-900/20",
    },
    { 
      name: "platelets" as const, 
      label: "Plaquetas", 
      unit: "células/µL", 
      step: "1", 
      rangeKey: 'platelets' as const,
      icon: CircleDot,
      color: "text-amber-400",
      bgColor: "bg-amber-900/20",
    },
  ];

  const getValueStatus = (value: number | undefined, rangeKey: keyof typeof normalValues.canino) => {
    if (value === undefined || value === null || value === 0) return 'empty';
    const range = currentNormalValues[rangeKey];
    if (value < range[0]) return 'low';
    if (value > range[1]) return 'high';
    return 'normal';
  };

  return (
    <div className="space-y-5">
      {/* Información del Examen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Fecha */}
        <div className="relative">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-vet-text mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-vet-primary" />
            Fecha
            <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            {...register("date", { required: "Requerido" })}
            className={`w-full px-3 py-2 rounded-lg border text-sm transition-all
              ${errors.date 
                ? 'border-red-700/50 bg-red-900/20 focus:border-red-500 focus:ring-red-900/30' 
                : 'border-slate-700 bg-slate-800 hover:border-vet-primary/50 focus:border-vet-primary focus:ring-vet-primary/20'
              } focus:outline-none focus:ring-2 text-vet-text`}
          />
          {errors.date && (
            <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.date.message}
            </p>
          )}
        </div>

        {/* Costo */}
        <div className="relative">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-vet-text mb-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Costo
            <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register("cost", { 
                required: "Requerido",
                min: { value: 0.01, message: "Mayor a 0" },
                valueAsNumber: true,
              })}
              className={`w-full pl-7 pr-3 py-2 rounded-lg border text-sm transition-all
                ${errors.cost 
                  ? 'border-red-700/50 bg-red-900/20 focus:border-red-500 focus:ring-red-900/30' 
                  : 'border-slate-700 bg-slate-800 hover:border-vet-primary/50 focus:border-vet-primary focus:ring-vet-primary/20'
                } focus:outline-none focus:ring-2 text-vet-text`}
              placeholder="0.00"
            />
          </div>
          {errors.cost && (
            <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.cost.message}
            </p>
          )}
        </div>

        {/* Veterinario */}
        <div className="relative">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-vet-text mb-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
            Veterinario
          </label>
          <input
            type="text"
            {...register("treatingVet")}
            className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-sm transition-all text-vet-text
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
                className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                  hasError 
                    ? 'border-red-700/50 bg-red-900/20' 
                    : status === 'low' || status === 'high'
                      ? 'border-amber-700/50 bg-amber-900/20'
                      : status === 'normal'
                        ? 'border-emerald-700/50 bg-emerald-900/20'
                        : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-7 h-7 rounded-lg ${field.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${field.color}`} />
                  </div>
                  {status !== 'empty' && (
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                      status === 'normal' 
                        ? 'bg-emerald-900/30 text-emerald-400' 
                        : status === 'low'
                          ? 'bg-blue-900/30 text-blue-400'
                          : 'bg-red-900/30 text-red-400'
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
                    {...register(field.name, {
                      required: "Requerido",
                      min: { value: 0, message: "≥0" },
                      valueAsNumber: true,
                    })}
                    className={`w-full px-2 py-1.5 pr-12 rounded-lg border text-sm font-semibold transition-all
                      ${hasError 
                        ? 'border-red-700/50 bg-slate-800 text-red-400' 
                        : status === 'low' || status === 'high'
                          ? 'border-amber-700/50 bg-slate-800 text-amber-400'
                          : status === 'normal'
                            ? 'border-emerald-700/50 bg-slate-800 text-emerald-400'
                            : 'border-slate-700 bg-slate-800 text-vet-text'
                      } focus:outline-none focus:ring-2 focus:ring-vet-primary/30`}
                    placeholder="0"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">
                    {field.unit}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[9px] text-slate-400">
                    Ref: {range[0]} - {range[1]}
                  </span>
                  {hasError && (
                    <span className="text-[9px] text-red-400 font-medium">
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