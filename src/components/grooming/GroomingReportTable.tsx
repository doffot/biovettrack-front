import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  Scissors,
} from "lucide-react";
import { DateRangeSelector } from "../invoices/DateRangeSelector";
import { exportGroomingToCSV } from "../../utils/groomingExportUtils";
import type { DateRangeType } from "../../types/reportTypes";
import type { EnrichedGroomingService } from "../../view/grooming/GroomingReportView";

interface GroomingReportTableProps {
  services: EnrichedGroomingService[];
}

interface DateFilters {
  dateRange: DateRangeType;
  customFrom: string;
  customTo: string;
}

type StatusFilter = "all" | "Pagado" | "Pendiente" | "Parcial" | "Sin facturar";
type ServiceTypeFilter = "" | "Baño" | "Corte" | "Corte y Baño";

const PAGE_SIZE = 8;

function StatusBadge({ status }: { status: string }) {
  const isPaid = status === "Pagado";
  const isPending = status === "Pendiente" || status === "Parcial";

  let bgColor = "bg-vet-light text-vet-muted border-border";
  let label: string = status;

  if (isPaid) {
    bgColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  } else if (isPending) {
    bgColor = "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    label = "Debe";
  }

  return (
    <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md border ${bgColor}`}>
      {label}
    </span>
  );
}

const getFilterDates = (filters: DateFilters): { startDate: Date; endDate: Date } => {
  const now = new Date();
  let startDate: Date;
  let endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  switch (filters.dateRange) {
    case "today":
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "week": {
      const day = now.getDay() || 7;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - day + 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    }
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "custom":
      startDate = filters.customFrom
        ? new Date(filters.customFrom + "T00:00:00")
        : new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = filters.customTo
        ? new Date(filters.customTo + "T23:59:59")
        : new Date();
      break;
    case "all":
      startDate = new Date(2020, 0, 1);
      endDate = new Date(2100, 11, 31);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { startDate, endDate };
};

export function GroomingReportTable({ services }: GroomingReportTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dateFilters, setDateFilters] = useState<DateFilters>({
    dateRange: "month",
    customFrom: "",
    customTo: "",
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState<ServiceTypeFilter>("");

  // Filtrar servicios
  const filteredServices = useMemo(() => {
    const { startDate, endDate } = getFilterDates(dateFilters);

    return services.filter((service) => {
      const serviceDate = new Date(service.date);
      if (serviceDate < startDate || serviceDate > endDate) return false;

      if (statusFilter !== "all" && service.paymentInfo.paymentStatus !== statusFilter) {
        return false;
      }

      if (serviceTypeFilter && service.service !== serviceTypeFilter) {
        return false;
      }

      return true;
    });
  }, [services, dateFilters, statusFilter, serviceTypeFilter]);

  const totalPages = Math.ceil(filteredServices.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentServices = filteredServices.slice(startIndex, endIndex);

  const allCurrentSelected =
    currentServices.length > 0 &&
    currentServices.every((s) => s._id && selectedIds.has(s._id));

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const toggleSelectAll = () => {
    const newSelected = new Set(selectedIds);
    if (allCurrentSelected) {
      currentServices.forEach((s) => {
        if (s._id) newSelected.delete(s._id);
      });
    } else {
      currentServices.forEach((s) => {
        if (s._id) newSelected.add(s._id);
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
    const toExport =
      selectedIds.size > 0
        ? filteredServices.filter((s) => s._id && selectedIds.has(s._id))
        : filteredServices;
    exportGroomingToCSV(toExport, "reporte-peluqueria");
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const resetFilters = () => {
    setDateFilters({
      dateRange: "month",
      customFrom: "",
      customTo: "",
    });
    setStatusFilter("all");
    setServiceTypeFilter("");
    setCurrentPage(1);
  };

  const handleDateRangeChange = (dateRange: DateRangeType) => {
    setCurrentPage(1);
    setDateFilters((prev) => ({ ...prev, dateRange }));
    if (dateRange !== "custom") {
      setDateFilters((prev) => ({ ...prev, customFrom: "", customTo: "" }));
    }
  };

  const handleCustomFromChange = (customFrom: string) => {
    setDateFilters((prev) => ({ ...prev, customFrom }));
  };

  const handleCustomToChange = (customTo: string) => {
    setDateFilters((prev) => ({ ...prev, customTo }));
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: "USD" | "Bs" = "USD"): string => {
    if (currency === "Bs") {
      return `Bs. ${amount.toLocaleString("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getPatientId = (service: EnrichedGroomingService): string => {
    if (!service.patientId) return "";
    if (typeof service.patientId === "string") return service.patientId;
    return service.patientId._id || "";
  };

  const selectClasses = `
    appearance-none bg-card border border-border rounded-md
    px-3 py-1.5 pr-8 text-sm text-vet-text
    focus:outline-none focus:ring-1 focus:ring-vet-primary focus:border-vet-primary
    cursor-pointer transition-colors
  `;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-vet-light/50">
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de fechas */}
          <DateRangeSelector
            dateRange={dateFilters.dateRange}
            customFrom={dateFilters.customFrom}
            customTo={dateFilters.customTo}
            onDateRangeChange={handleDateRangeChange}
            onCustomFromChange={handleCustomFromChange}
            onCustomToChange={handleCustomToChange}
          />

          {/* Estado */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setCurrentPage(1);
              }}
              className={selectClasses}
            >
              <option value="all">Todos los estados</option>
              <option value="Pagado">Pagado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Parcial">Parcial</option>
              <option value="Sin facturar">Sin facturar</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted pointer-events-none" />
          </div>

          {/* Tipo de servicio */}
          <div className="relative">
            <select
              value={serviceTypeFilter}
              onChange={(e) => {
                setServiceTypeFilter(e.target.value as ServiceTypeFilter);
                setCurrentPage(1);
              }}
              className={selectClasses}
            >
              <option value="">Todos los servicios</option>
              <option value="Baño">Baño</option>
              <option value="Corte">Corte</option>
              <option value="Corte y Baño">Corte y Baño</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted pointer-events-none" />
          </div>

          {/* Limpiar */}
          <button
            onClick={resetFilters}
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
                {selectedIds.size} seleccionado{selectedIds.size > 1 ? "s" : ""}
              </span>
              <button
                onClick={clearSelection}
                className="text-sm text-vet-primary hover:text-vet-accent"
              >
                Deseleccionar
              </button>
            </div>
          )}
          <button
            onClick={handleExportCSV}
            disabled={filteredServices.length === 0}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-vet-text bg-card hover:bg-hover border border-border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {selectedIds.size > 0 ? `Exportar (${selectedIds.size})` : "Exportar CSV"}
          </button>
        </div>
      </div>

      {/* Table */}
      {filteredServices.length === 0 ? (
        <div className="py-16 text-center bg-vet-light/30">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-vet-light border border-border flex items-center justify-center">
            <Scissors className="w-6 h-6 text-vet-muted" />
          </div>
          <p className="text-vet-text font-medium">No hay servicios para mostrar</p>
          <p className="text-sm text-vet-muted mt-1">Ajusta los filtros o el período</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-vet-light">
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allCurrentSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-border text-vet-primary focus:ring-vet-primary cursor-pointer bg-card"
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
                    Costo
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
                {currentServices.map((service) => {
                  const isSelected = service._id ? selectedIds.has(service._id) : false;
                  const paidUSD = service.paymentInfo.amountPaidUSD;
                  const paidBs = service.paymentInfo.amountPaidBs;
                  const patientId = getPatientId(service);

                  return (
                    <tr
                      key={service._id}
                      className={`
                        border-b border-border hover:bg-hover transition-colors
                        ${isSelected ? "bg-vet-primary/5" : ""}
                      `}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => service._id && toggleSelect(service._id)}
                          className="w-4 h-4 rounded border-border text-vet-primary focus:ring-vet-primary cursor-pointer bg-card"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-vet-muted">
                        {formatDate(service.date)}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-vet-text truncate max-w-[180px]">
                            {service.ownerName}
                          </p>
                          {service.ownerPhone && (
                            <p className="text-xs text-vet-muted mt-0.5">
                              {service.ownerPhone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div>
                          <p className="text-sm text-vet-text">{service.service}</p>
                          <p className="text-xs text-vet-muted mt-0.5">
                            {service.patientName}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={service.paymentInfo.paymentStatus} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-vet-text tabular-nums">
                          {formatCurrency(service.cost || 0)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <span
                          className={`text-sm tabular-nums ${
                            paidUSD > 0 ? "text-emerald-500 font-medium" : "text-vet-muted"
                          }`}
                        >
                          {paidUSD > 0 ? formatCurrency(paidUSD, "USD") : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <span
                          className={`text-sm tabular-nums ${
                            paidBs > 0 ? "text-vet-primary font-medium" : "text-vet-muted"
                          }`}
                        >
                          {paidBs > 0 ? formatCurrency(paidBs, "Bs") : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/patients/${patientId}/grooming-services/${service._id}`}
                          className="p-1.5 inline-flex text-vet-muted hover:text-vet-primary transition-colors rounded-md hover:bg-hover"
                          title="Ver servicio"
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
            <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-vet-light/30">
              <p className="text-sm text-vet-muted">
                {startIndex + 1}–{Math.min(endIndex, filteredServices.length)} de{" "}
                {filteredServices.length}
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
                              ${
                                currentPage === page
                                  ? "bg-vet-primary text-white shadow-soft"
                                  : "text-vet-text hover:bg-hover border border-transparent hover:border-border"
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