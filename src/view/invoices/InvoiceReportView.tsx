// src/views/invoices/InvoiceReportView.tsx
import { ReportHeader } from "../../components/invoices/ReportHeader";
import { ReportSummary } from "../../components/invoices/ReportSummary";
import { ReportMetrics } from "../../components/invoices/ReportMetrics";
import { ReportBreakdown } from "../../components/invoices/ReportBreakdown";
import { ReportInvoicesTable } from "../../components/invoices/ReportInvoicesTable";
import { useInvoiceReport } from "../../hooks/useInvoiceReport";

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="text-center">
        <div className="w-8 h-8 mx-auto mb-3 border-2 border-gray-200 border-t-[#0A7EA4] rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Cargando reporte...</p>
      </div>
    </div>
  );
}

export default function InvoiceReportView() {
  const {
    invoices,
    stats,
    filters,
    updateFilter,
    resetFilters,
    isLoading,
    isFetching,
    refetch,
    periodLabel,
  } = useInvoiceReport();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <ReportHeader
        periodLabel={periodLabel}
        isFetching={isFetching}
        onRefetch={refetch}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <ReportSummary
          totalCobradoUSD={stats.totalCobradoUSD}
          totalCobradoBs={stats.totalCobradoBs}
          pendienteUSD={stats.pendienteUSD}
          pendienteBs={stats.pendienteBs}
          totalFacturado={stats.totalFacturado}
        />

        <ReportMetrics
          total={stats.totalInvoices}
          paid={stats.paidCount}
          pending={stats.pendingCount}
          partial={stats.partialCount}
        />

        <ReportBreakdown
          byService={stats.byItemType}
          byPaymentMethod={stats.byPaymentMethod}
        />

        <ReportInvoicesTable
          invoices={invoices}
          filters={filters}
          onUpdateFilter={updateFilter}
          onResetFilters={resetFilters}
        />
      </main>
    </div>
  );
}