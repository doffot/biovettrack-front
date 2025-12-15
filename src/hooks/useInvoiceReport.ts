// src/views/invoices/hooks/useInvoiceReport.ts
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { FilterState } from "../types/reportTypes";
import {
  filterInvoices,
  calculateStats,
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

  const stats = useMemo(
    () => calculateStats(filteredInvoices, paymentMethods),
    [filteredInvoices, paymentMethods]
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
    // Data
    invoices: filteredInvoices,
    stats,
    paymentMethods,
    
    // Filters
    filters,
    showFilters,
    setShowFilters,
    updateFilter,
    resetFilters,
    activeFiltersCount,
    
    // UI State
    isLoading,
    isFetching,
    refetch,
    
    // Labels
    periodLabel,
    vetName,
  };
}