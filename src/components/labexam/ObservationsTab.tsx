// src/components/labexam/ObservationsTab.tsx
import { 
  Save, 
  FileText, 
  Microscope, 
  AlertCircle,
  Sparkles
} from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { LabExamFormData } from "../../types";

interface ObservationsTabProps {
  register: UseFormRegister<LabExamFormData>; 
  errors: FieldErrors<LabExamFormData>;       
  isPending: boolean;
  onSubmit: () => void;
}

export function ObservationsTab({ 
  register, 
  errors, 
  isPending, 
  onSubmit 
}: ObservationsTabProps) {
  return (
    <div className="space-y-4">
      {/* Header minimalista */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vet-primary to-vet-secondary flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-vet-text">Observaciones Finales</h3>
            <p className="text-xs text-vet-muted">Añade notas clínicas importantes</p>
          </div>
        </div>
      </div>

      {/* Grid de 2 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hemotrópico */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-vet-text">
            <Microscope className="w-3.5 h-3.5 text-purple-400" />
            Hemotrópico
            <span className="text-[9px] font-medium text-purple-400 bg-purple-900/20 px-1.5 py-0.5 rounded">
              Opcional
            </span>
          </label>
          <textarea
            {...register("hemotropico")}
            placeholder="Ej: Mycoplasma hemofelis observado..."
            className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 resize-none transition-all text-vet-text ${
              errors.hemotropico 
                ? 'border-red-700/50 focus:border-red-500 focus:ring-red-900/30' 
                : 'border-slate-700 hover:border-purple-700/50 focus:border-purple-500 focus:ring-purple-900/30'
            }`}
            rows={2}
          />
          {errors.hemotropico && (
            <p className="text-[10px] text-red-400 flex items-center gap-1">
              <AlertCircle className="w-2.5 h-2.5" />
              {errors.hemotropico.message}
            </p>
          )}
        </div>

        {/* Observación General */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-vet-text">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            Observaciones Clínicas
            <span className="text-[9px] font-medium text-amber-400 bg-amber-900/20 px-1.5 py-0.5 rounded">
              Opcional
            </span>
          </label>
          <textarea
            {...register("observacion")}
            placeholder="Ej: Muestra con ligera hemólisis..."
            className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 resize-none transition-all text-vet-text ${
              errors.observacion 
                ? 'border-red-700/50 focus:border-red-500 focus:ring-red-900/30' 
                : 'border-slate-700 hover:border-amber-700/50 focus:border-amber-500 focus:ring-amber-900/30'
            }`}
            rows={2}
          />
          {errors.observacion && (
            <p className="text-[10px] text-red-400 flex items-center gap-1">
              <AlertCircle className="w-2.5 h-2.5" />
              {errors.observacion.message}
            </p>
          )}
        </div>
      </div>

      {/* Tip compacto */}
      <div className="p-2.5 rounded-lg bg-vet-light/30 border border-vet-primary/20 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-vet-primary flex-shrink-0" />
        <p className="text-[11px] text-vet-muted">
          Las observaciones ayudan a correlacionar hallazgos de laboratorio con la clínica
        </p>
      </div>

      {/* Botón Guardar */}
      <div className="pt-3 flex justify-end border-t border-slate-700">
        <button
          type="submit"
          onClick={onSubmit}
          disabled={isPending}
          className={`
            relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm
            transition-all duration-300 overflow-hidden group
            ${isPending 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-vet-primary to-vet-secondary text-white shadow-lg shadow-vet-primary/30 hover:shadow-xl hover:shadow-vet-primary/40 hover:scale-[1.02] active:scale-[0.98]'
            }
          `}
        >
          {/* Efecto shine */}
          {!isPending && (
            <span className="absolute inset-0 w-full h-full">
              <span className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[100%] transition-all duration-700" />
            </span>
          )}
          
          {isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Guardar Hemograma</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}