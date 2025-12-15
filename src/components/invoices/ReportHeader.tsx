// src/views/invoices/components/ReportHeader.tsx
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Filter, Printer } from "lucide-react";

interface ReportHeaderProps {
  periodLabel: string;
  invoiceCount: number;
  isFetching: boolean;
  showFilters: boolean;
  activeFiltersCount: number;
  onRefetch: () => void;
  onToggleFilters: () => void;
  onPrint: () => void;
}

export function ReportHeader({
  periodLabel,
  invoiceCount,
  isFetching,
  showFilters,
  activeFiltersCount,
  onRefetch,
  onToggleFilters,
  onPrint,
}: ReportHeaderProps) {
  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-vet-light shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2 -ml-2 rounded-xl hover:bg-vet-light text-vet-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-vet-text font-montserrat">
                Reporte de Facturación
              </h1>
              <p className="text-sm text-vet-muted">
                {periodLabel} • {invoiceCount} facturas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefetch}
              disabled={isFetching}
              className="p-2 rounded-xl hover:bg-vet-light text-vet-muted transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isFetching ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={onToggleFilters}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                showFilters
                  ? "bg-vet-primary text-white border-vet-primary shadow-soft"
                  : "bg-white text-vet-text border-vet-light hover:border-vet-primary/50"
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
              {activeFiltersCount > 0 && (
                <span
                  className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
                    showFilters ? "bg-white text-vet-primary" : "bg-vet-primary text-white"
                  }`}
                >
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <button
              onClick={onPrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-vet-primary to-vet-secondary text-white text-sm font-semibold hover:shadow-card transition-all"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}