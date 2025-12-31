// src/components/grooming/GroomingReportTable.tsx
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
import { exportGroomingToCSV } from "../../utils/groomingExportUtils";
import type { EnrichedGroomingService, GroomingDateRange } from "../../view/grooming/GroomingReportView";

interface GroomingReportTableProps {
  services: EnrichedGroomingService[];
}

type StatusFilter = "all" | "Pagado" | "Pendiente" | "Parcial" | "Sin facturar";
type ServiceTypeFilter = "" | "Baño" | "Corte" | "Corte y Baño";

const PAGE_SIZE = 8;

function StatusBadge({ status }: { status: string }) {
  const isPaid = status === "Pagado";
  const isPending = status === "Pendiente" || status === "Parcial";

  let bgColor = "bg-gray-500";
  let label: string = status;

  if (isPaid) {
    bgColor = "bg-emerald-600";
  } else if (isPending) {
    bgColor = "bg-red-600";
    label = "Debe";
  } else if (status === "Sin facturar") {
    bgColor = "bg-gray-400";
  }

  return (
    <span className={`inline-block px-2.5 py-1 text-xs font-semibold text-white rounded-md ${bgColor}`}>
      {label}
    </span>
  );
}

const getFilterDates = (dateRange: GroomingDateRange): { startDate: Date; endDate: Date } => {
  const now = new Date();
  let startDate: Date;
  let endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  switch (dateRange) {
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
    case "all":
      startDate = new Date(2020, 0, 1);
      endDate = new Date(2100, 11, 31);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { startDate, endDate };
};

// const getDatePart = (date: string): string => {
//   if (date.includes("T")) {
//     return date.split("T")[0];
//   }
//   return date;
// };

export function GroomingReportTable({ services }: GroomingReportTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<GroomingDateRange>("month");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState<ServiceTypeFilter>("");

  // Filtrar servicios
  const filteredServices = useMemo(() => {
    const { startDate, endDate } = getFilterDates(dateRange);

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
  }, [services, dateRange, statusFilter, serviceTypeFilter]);

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

  const handleFilterChange = () => {
    setCurrentPage(1);
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
    setDateRange("month");
    setStatusFilter("all");
    setServiceTypeFilter("");
    setCurrentPage(1);
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
    appearance-none bg-white border border-gray-200 rounded-md
    px-3 py-1.5 pr-8 text-sm text-gray-700
    focus:outline-none focus:ring-1 focus:ring-[#0A7EA4] focus:border-[#0A7EA4]
    cursor-pointer
  `;

  return (
    <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Período */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value as GroomingDateRange);
                handleFilterChange();
              }}
              className={selectClasses}
            >
              <option value="today">Hoy</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
              <option value="year">Año</option>
              <option value="all">Todo</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Estado */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                handleFilterChange();
              }}
              className={selectClasses}
            >
              <option value="all">Todos los estados</option>
              <option value="Pagado">Pagado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Parcial">Parcial</option>
              <option value="Sin facturar">Sin facturar</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Tipo de servicio */}
          <div className="relative">
            <select
              value={serviceTypeFilter}
              onChange={(e) => {
                setServiceTypeFilter(e.target.value as ServiceTypeFilter);
                handleFilterChange();
              }}
              className={selectClasses}
            >
              <option value="">Todos los servicios</option>
              <option value="Baño">Baño</option>
              <option value="Corte">Corte</option>
              <option value="Corte y Baño">Corte y Baño</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Limpiar */}
          <button
            onClick={resetFilters}
            className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5"
          >
            Limpiar
          </button>
        </div>

        {/* Export + Selection info */}
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedIds.size} seleccionado{selectedIds.size > 1 ? "s" : ""}
              </span>
              <button
                onClick={clearSelection}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Deseleccionar
              </button>
            </div>
          )}
          <button
            onClick={handleExportCSV}
            disabled={filteredServices.length === 0}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {selectedIds.size > 0 ? `Exportar (${selectedIds.size})` : "Exportar CSV"}
          </button>
        </div>
      </div>

      {/* Table */}
      {filteredServices.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Scissors className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500">No hay servicios para mostrar</p>
          <p className="text-sm text-gray-400 mt-1">Ajusta los filtros o el período</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allCurrentSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-[#0A7EA4] focus:ring-[#0A7EA4] cursor-pointer"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Servicio
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    USD
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
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
                        border-b border-gray-200 hover:bg-gray-50/80 transition-colors
                        ${isSelected ? "bg-[#0A7EA4]/5" : ""}
                      `}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => service._id && toggleSelect(service._id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#0A7EA4] focus:ring-[#0A7EA4] cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(service.date)}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                            {service.ownerName}
                          </p>
                          {service.ownerPhone && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {service.ownerPhone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div>
                          <p className="text-sm text-gray-900">{service.service}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {service.patientName}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={service.paymentInfo.paymentStatus} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-gray-900 tabular-nums">
                          {formatCurrency(service.cost || 0)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <span
                          className={`text-sm tabular-nums ${
                            paidUSD > 0 ? "text-emerald-600 font-medium" : "text-gray-300"
                          }`}
                        >
                          {paidUSD > 0 ? formatCurrency(paidUSD, "USD") : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <span
                          className={`text-sm tabular-nums ${
                            paidBs > 0 ? "text-[#0A7EA4] font-medium" : "text-gray-300"
                          }`}
                        >
                          {paidBs > 0 ? formatCurrency(paidBs, "Bs") : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/patients/${patientId}/grooming-services/${service._id}`}
                          className="p-1.5 inline-flex text-gray-400 hover:text-[#0A7EA4] transition-colors rounded-md hover:bg-gray-100"
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
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {startIndex + 1}–{Math.min(endIndex, filteredServices.length)} de{" "}
                {filteredServices.length}
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
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
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => goToPage(page)}
                            className={`
                              w-8 h-8 text-sm font-medium rounded-md transition-colors
                              ${
                                currentPage === page
                                  ? "bg-[#0A7EA4] text-white"
                                  : "text-gray-600 hover:bg-gray-100"
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
                  className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
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