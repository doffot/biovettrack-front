// src/components/invoices/ReportInvoicesTable.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, ChevronLeft, ChevronRight, ChevronDown, Eye } from "lucide-react";
import type { Invoice, InvoiceStatus } from "../../types/invoice";
import type { FilterState, StatusFilter, PaymentCurrencyFilter } from "../../types/reportTypes";
import { formatCurrency, formatDate, getItemTypeLabel } from "../../utils/reportUtils";
import { exportToCSV } from "../../utils/exportUtils";
import { DateRangeSelector } from "./DateRangeSelector";

interface ReportInvoicesTableProps {
  invoices: Invoice[];
  filters: FilterState;
  onUpdateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onResetFilters: () => void;
}

const PAGE_SIZE = 8;

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const isPaid = status === "Pagado";
  const isPending = status === "Pendiente" || status === "Parcial";
  const isCanceled = status === "Cancelado";

  let bgColor = "bg-gray-600 text-gray-300";
  let label: string = status;

  if (isPaid) {
    bgColor = "bg-emerald-900/50 text-emerald-400";
  } else if (isPending) {
    bgColor = "bg-red-900/50 text-red-400";
    label = "Debe";
  } else if (isCanceled) {
    bgColor = "bg-gray-700 text-gray-400";
  }

  return (
    <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md ${bgColor}`}>
      {label}
    </span>
  );
}

export function ReportInvoicesTable({
  invoices,
  filters,
  onUpdateFilter,
  onResetFilters,
}: ReportInvoicesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const totalPages = Math.ceil(invoices.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentInvoices = invoices.slice(startIndex, endIndex);

  const allCurrentSelected = currentInvoices.length > 0 && 
    currentInvoices.every((inv) => inv._id && selectedIds.has(inv._id));

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setCurrentPage(1);
    onUpdateFilter(key, value);
  };

  const toggleSelectAll = () => {
    const newSelected = new Set(selectedIds);
    if (allCurrentSelected) {
      currentInvoices.forEach((inv) => {
        if (inv._id) newSelected.delete(inv._id);
      });
    } else {
      currentInvoices.forEach((inv) => {
        if (inv._id) newSelected.add(inv._id);
      });
    }
    setSelectedIds(newSelected);
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleExportCSV = () => {
    const toExport = selectedIds.size > 0
      ? invoices.filter((inv) => inv._id && selectedIds.has(inv._id))
      : invoices;
    exportToCSV(toExport, "reporte-facturas");
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const selectClasses = `
    appearance-none bg-slate-800 border border-slate-700 rounded-md
    px-3 py-1.5 pr-8 text-sm text-vet-text
    focus:outline-none focus:ring-1 focus:ring-vet-primary focus:border-vet-primary
    cursor-pointer
  `;

  const getOwnerInfo = (invoice: Invoice): { name: string; phone: string } => {
    const name = invoice.ownerName ||
      (typeof invoice.ownerId === "object" && invoice.ownerId?.name) ||
      "—";
    const phone = invoice.ownerPhone ||
      (typeof invoice.ownerId === "object" && invoice.ownerId?.contact) ||
      "";
    return { name, phone };
  };

  const getPatientName = (invoice: Invoice): string => {
    if (!invoice.patientId) return "";
    if (typeof invoice.patientId === "object" && invoice.patientId?.name) {
      return invoice.patientId.name;
    }
    return "";
  };

  const getMainService = (invoice: Invoice): string => {
    if (!invoice.items || invoice.items.length === 0) return "—";
    return getItemTypeLabel(invoice.items[0].type);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <DateRangeSelector
            dateRange={filters.dateRange}
            customFrom={filters.customFrom}
            customTo={filters.customTo}
            onDateRangeChange={(value) => {
              setCurrentPage(1);
              onUpdateFilter("dateRange", value);
            }}
            onCustomFromChange={(value) => onUpdateFilter("customFrom", value)}
            onCustomToChange={(value) => onUpdateFilter("customTo", value)}
          />

          {/* Estado */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value as StatusFilter)}
              className={selectClasses}
            >
              <option value="all">Todos los estados</option>
              <option value="Pagado">Pagado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Parcial">Parcial</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted pointer-events-none" />
          </div>

          {/* Tipo de pago */}
          <div className="relative">
            <select
              value={filters.paymentCurrency}
              onChange={(e) => handleFilterChange("paymentCurrency", e.target.value as PaymentCurrencyFilter)}
              className={selectClasses}
            >
              <option value="all">Todos los pagos</option>
              <option value="usd">USD</option>
              <option value="bs">Bolívares</option>
              <option value="mixed">Mixto</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted pointer-events-none" />
          </div>

          {/* Servicio */}
          <div className="relative">
            <select
              value={filters.itemType}
              onChange={(e) => handleFilterChange("itemType", e.target.value)}
              className={selectClasses}
            >
              <option value="">Todos los servicios</option>
              <option value="consulta">Consulta</option>
              <option value="grooming">Peluquería</option>
              <option value="vacuna">Vacuna</option>
              <option value="labExam">Laboratorio</option>
              <option value="producto">Producto</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted pointer-events-none" />
          </div>

          {/* Limpiar */}
          <button
            onClick={() => {
              setCurrentPage(1);
              onResetFilters();
            }}
            className="text-sm text-vet-muted hover:text-vet-text px-2 py-1.5"
          >
            Limpiar
          </button>
        </div>

        {/* Export + Selection info */}
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-vet-muted">
                {selectedIds.size} seleccionada{selectedIds.size > 1 ? "s" : ""}
              </span>
              <button
                onClick={clearSelection}
                className="text-sm text-vet-muted hover:text-vet-text"
              >
                Deseleccionar
              </button>
            </div>
          )}
          <button
            onClick={handleExportCSV}
            disabled={invoices.length === 0}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-vet-text bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {selectedIds.size > 0 ? `Exportar (${selectedIds.size})` : "Exportar CSV"}
          </button>
        </div>
      </div>

      {/* Table */}
      {invoices.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-vet-muted">No hay facturas para mostrar</p>
          <p className="text-sm text-vet-muted mt-1">Ajusta los filtros o el período</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allCurrentSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-600 text-vet-primary focus:ring-vet-primary cursor-pointer bg-slate-800"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-vet-muted uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-vet-muted uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-vet-muted uppercase tracking-wider hidden md:table-cell">
                    Servicio
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-vet-muted uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-vet-muted uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-vet-muted uppercase tracking-wider hidden sm:table-cell">
                    USD
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-vet-muted uppercase tracking-wider hidden sm:table-cell">
                    Bs
                  </th>
                  <th className="w-12 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {currentInvoices.map((invoice) => {
                  const { name, phone } = getOwnerInfo(invoice);
                  const patientName = getPatientName(invoice);
                  const mainService = getMainService(invoice);
                  const paidUSD = invoice.amountPaidUSD || 0;
                  const paidBs = invoice.amountPaidBs || 0;
                  const isSelected = invoice._id ? selectedIds.has(invoice._id) : false;

                  return (
                    <tr
                      key={invoice._id}
                      className={`
                        border-b border-slate-700 hover:bg-slate-700/50 transition-colors
                        ${isSelected ? "bg-vet-primary/10" : ""}
                      `}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => invoice._id && toggleSelect(invoice._id)}
                          className="w-4 h-4 rounded border-slate-600 text-vet-primary focus:ring-vet-primary cursor-pointer bg-slate-800"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-vet-muted">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-vet-text truncate max-w-[180px]">
                            {name}
                          </p>
                          {phone && (
                            <p className="text-xs text-vet-muted mt-0.5">{phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div>
                          <p className="text-sm text-vet-text">{mainService}</p>
                          {patientName && (
                            <p className="text-xs text-vet-muted mt-0.5">{patientName}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={invoice.paymentStatus} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-vet-text tabular-nums">
                          {formatCurrency(invoice.total || 0, invoice.currency)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <span className={`text-sm tabular-nums ${paidUSD > 0 ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
                          {paidUSD > 0 ? formatCurrency(paidUSD, "USD") : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <span className={`text-sm tabular-nums ${paidBs > 0 ? "text-vet-primary font-medium" : "text-slate-500"}`}>
                          {paidBs > 0 ? formatCurrency(paidBs, "Bs") : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/invoices/${invoice._id}`}
                          className="p-1.5 inline-flex text-vet-muted hover:text-vet-primary transition-colors rounded-md hover:bg-slate-700"
                          title="Ver factura"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-slate-700 flex items-center justify-between">
              <p className="text-sm text-vet-muted">
                {startIndex + 1}–{Math.min(endIndex, invoices.length)} de {invoices.length}
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 text-vet-muted hover:text-vet-text disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-0.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (totalPages <= 5) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .map((page, index, arr) => {
                      const prevPage = arr[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;

                      return (
                        <div key={page} className="flex items-center">
                          {showEllipsis && (
                            <span className="px-2 text-vet-muted">...</span>
                          )}
                          <button
                            onClick={() => goToPage(page)}
                            className={`
                              w-8 h-8 text-sm font-medium rounded-md transition-colors
                              ${currentPage === page
                                ? "bg-vet-primary text-white"
                                : "text-vet-text hover:bg-slate-700"
                              }
                            `}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 text-vet-muted hover:text-vet-text disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}