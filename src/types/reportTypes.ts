// src/views/invoices/types/reportTypes.ts

import type { Invoice, InvoiceStatus } from "./invoice";

export type DateRangeType = "today" | "week" | "month" | "year" | "custom" | "all";
export type CurrencyFilter = "all" | "USD" | "Bs";
export type StatusFilter = "all" | InvoiceStatus;
export type PaymentCurrencyFilter = "all" | "usd" | "bs" | "mixed";

export interface FilterState {
  dateRange: DateRangeType;
  customFrom: string;
  customTo: string;
  currency: CurrencyFilter;
  status: StatusFilter;
  paymentCurrency: PaymentCurrencyFilter;
  itemType: string;
}

export interface ReportStats {
  totalCobradoUSD: number;
  totalCobradoBs: number;
  totalPendienteUSD: number;
  totalFacturado: number;
  byStatus: Record<InvoiceStatus, number>;
  byItemType: Record<string, { count: number; total: number }>;
  byPaymentMethod: Record<string, { count: number; totalUSD: number; totalBs: number }>;
  totalInvoices: number;
  paidCount: number;
  pendingCount: number;
  partialCount: number;
  canceledCount: number;
}

export interface ReportData {
  invoices: Invoice[];
  stats: ReportStats;
  filters: FilterState;
  periodLabel: string;
  isLoading: boolean;
  isFetching: boolean;
}