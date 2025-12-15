// src/views/invoices/InvoiceReportView.tsx

import { ReportFilters } from "../../components/invoices/ReportFilters";
import { ReportHeader } from "../../components/invoices/ReportHeader";
import { ReportIncomeCards } from "../../components/invoices/ReportIncomeCards";
import { ReportInvoicesTable } from "../../components/invoices/ReportInvoicesTable";
import { ReportPaymentMethods } from "../../components/invoices/ReportPaymentMethods";
import { ReportServiceTags } from "../../components/invoices/ReportServiceTags";
import { ReportStats } from "../../components/invoices/ReportStats";
import { printReport } from "../../hooks/reportPrint";
import { useInvoiceReport } from "../../hooks/useInvoiceReport";


function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-vet-gradient">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-vet-light border-t-vet-primary rounded-full animate-spin" />
        <p className="text-vet-text font-medium">Cargando reporte...</p>
      </div>
    </div>
  );
}

export default function InvoiceReportView() {
  const {
    invoices,
    stats,
    filters,
    showFilters,
    setShowFilters,
    updateFilter,
    resetFilters,
    activeFiltersCount,
    isLoading,
    isFetching,
    refetch,
    periodLabel,
    vetName,
  } = useInvoiceReport();

  const handlePrint = () => {
    printReport({
      invoices,
      stats,
      filters,
      vetName,
    });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-vet-gradient">
      <ReportHeader
        periodLabel={periodLabel}
        invoiceCount={invoices.length}
        isFetching={isFetching}
        showFilters={showFilters}
        activeFiltersCount={activeFiltersCount}
        onRefetch={refetch}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onPrint={handlePrint}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showFilters && (
          <ReportFilters
            filters={filters}
            onUpdateFilter={updateFilter}
            onReset={resetFilters}
          />
        )}

        <ReportStats stats={stats} />

        <ReportIncomeCards
          totalCobradoUSD={stats.totalCobradoUSD}
          totalCobradoBs={stats.totalCobradoBs}
          totalPendienteUSD={stats.totalPendienteUSD}
        />

        <ReportServiceTags byItemType={stats.byItemType} />

        <ReportPaymentMethods byPaymentMethod={stats.byPaymentMethod} />

        <ReportInvoicesTable invoices={invoices} />
      </div>
    </div>
  );
}