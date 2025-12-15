// src/views/invoices/components/ReportFilters.tsx
import { X, ChevronDown } from "lucide-react";
import type { DateRangeType, FilterState, PaymentCurrencyFilter, StatusFilter } from "../../types/reportTypes";


interface ReportFiltersProps {
  filters: FilterState;
  onUpdateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onReset: () => void;
}

export function ReportFilters({ filters, onUpdateFilter, onReset }: ReportFiltersProps) {
  const selectClasses = "w-full appearance-none pl-3 pr-8 py-2.5 bg-vet-light/50 border-2 border-vet-light rounded-xl text-sm text-vet-text focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all";
  const inputClasses = "w-full px-3 py-2.5 bg-vet-light/50 border-2 border-vet-light rounded-xl text-sm text-vet-text focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all";
  const labelClasses = "block text-xs font-semibold text-vet-muted uppercase tracking-wide mb-1.5";

  return (
    <div className="bg-white rounded-2xl border border-vet-light p-5 mb-6 shadow-soft animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-vet-text">Filtros de búsqueda</span>
        <button
          onClick={onReset}
          className="text-sm text-vet-primary hover:text-vet-secondary font-medium flex items-center gap-1 transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Limpiar
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Período */}
        <div>
          <label className={labelClasses}>Período</label>
          <div className="relative">
            <select
              value={filters.dateRange}
              onChange={(e) => onUpdateFilter("dateRange", e.target.value as DateRangeType)}
              className={selectClasses}
            >
              <option value="today">Hoy</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
              <option value="year">Año</option>
              <option value="all">Todo</option>
              <option value="custom">Personalizado</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted pointer-events-none" />
          </div>
        </div>

        {/* Custom dates */}
        {filters.dateRange === "custom" && (
          <>
            <div>
              <label className={labelClasses}>Desde</label>
              <input
                type="date"
                value={filters.customFrom}
                onChange={(e) => onUpdateFilter("customFrom", e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>Hasta</label>
              <input
                type="date"
                value={filters.customTo}
                onChange={(e) => onUpdateFilter("customTo", e.target.value)}
                className={inputClasses}
              />
            </div>
          </>
        )}

        {/* Estado */}
        <div>
          <label className={labelClasses}>Estado</label>
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => onUpdateFilter("status", e.target.value as StatusFilter)}
              className={selectClasses}
            >
              <option value="all">Todos</option>
              <option value="Pagado">Pagado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Parcial">Parcial</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted pointer-events-none" />
          </div>
        </div>

        {/* Pagado con */}
        <div>
          <label className={labelClasses}>Pagado con</label>
          <div className="relative">
            <select
              value={filters.paymentCurrency}
              onChange={(e) => onUpdateFilter("paymentCurrency", e.target.value as PaymentCurrencyFilter)}
              className={selectClasses}
            >
              <option value="all">Todos</option>
              <option value="usd">USD</option>
              <option value="bs">Bolívares</option>
              <option value="mixed">Mixto</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted pointer-events-none" />
          </div>
        </div>

        {/* Servicio */}
        <div>
          <label className={labelClasses}>Servicio</label>
          <div className="relative">
            <select
              value={filters.itemType}
              onChange={(e) => onUpdateFilter("itemType", e.target.value)}
              className={selectClasses}
            >
              <option value="">Todos</option>
              <option value="grooming">Peluquería</option>
              <option value="consulta">Consulta</option>
              <option value="vacuna">Vacuna</option>
              <option value="labExam">Laboratorio</option>
              <option value="producto">Producto</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}