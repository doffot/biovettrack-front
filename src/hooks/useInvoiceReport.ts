// src/hooks/useInvoiceReport.ts
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { FilterState, ReportStats } from "../types/reportTypes";
import {
  filterInvoices,
  calculateStats,
  calculatePendingByCurrency,
  calculateBsToUSDEquivalent,
  getDefaultFilters,
  countActiveFilters,
  getPeriodLabel,
} from "../utils/reportUtils";
import { useAuth } from "./useAuth";
import { getInvoices } from "../api/invoiceAPI";
import { getPaymentMethods } from "../api/paymentAPI";

export function useInvoiceReport() {
  const { data: authUser } = useAuth();
  const [filters, setFilters] = useState<FilterState>(getDefaultFilters());
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: invoicesData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["invoices", "report"],
    queryFn: () => getInvoices({ limit: 10000 }),
    staleTime: 1000 * 60 * 5,
  });

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: getPaymentMethods,
  });

  const allInvoices = invoicesData?.invoices || [];

  const filteredInvoices = useMemo(
    () => filterInvoices(allInvoices, filters),
    [allInvoices, filters]
  );

  const baseStats = useMemo(
    () => calculateStats(filteredInvoices, paymentMethods),
    [filteredInvoices, paymentMethods]
  );

  const pendingByCurrency = useMemo(
    () => calculatePendingByCurrency(filteredInvoices),
    [filteredInvoices]
  );

  const cobradoBsEnUSD = useMemo(
    () => calculateBsToUSDEquivalent(filteredInvoices),
    [filteredInvoices]
  );

  // Total general: USD cash + USD equivalente de Bs
  const totalCobradoGeneral = baseStats.totalCobradoUSD + cobradoBsEnUSD;

  const stats: ReportStats = useMemo(
    () => ({
      ...baseStats,
      pendienteUSD: pendingByCurrency.pendienteUSD,
      pendienteBs: pendingByCurrency.pendienteBs,
      cobradoBsEnUSD,
      totalCobradoGeneral,
    }),
    [baseStats, pendingByCurrency, cobradoBsEnUSD, totalCobradoGeneral]
  );

  const periodLabel = getPeriodLabel(filters.dateRange);
  const activeFiltersCount = countActiveFilters(filters);

  const resetFilters = () => setFilters(getDefaultFilters());

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const vetName = authUser
    ? `Dr(a). ${authUser.name || ""} ${authUser.lastName || ""}`.trim()
    : "Veterinario";

  return {
    invoices: filteredInvoices,
    stats,
    paymentMethods,
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
  };
}