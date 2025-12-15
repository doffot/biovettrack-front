// src/views/invoices/utils/reportUtils.ts
import type { Invoice, InvoiceStatus } from "../types/invoice";
import type { PaymentMethod } from "../types/payment";
import type { FilterState, ReportStats } from "../types/reportTypes";

export const formatCurrency = (amount: number, currency: string = "USD"): string => {
  if (currency === "Bs" || currency === "VES") {
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

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const getPaymentType = (invoice: Invoice): "usd" | "bs" | "mixed" | "none" => {
  const paidUSD = invoice.amountPaidUSD || 0;
  const paidBs = invoice.amountPaidBs || 0;
  if (paidUSD > 0 && paidBs > 0) return "mixed";
  if (paidUSD > 0) return "usd";
  if (paidBs > 0) return "bs";
  return "none";
};

export const getItemTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    grooming: "Peluquería",
    consulta: "Consulta",
    vacuna: "Vacuna",
    labExam: "Laboratorio",
    producto: "Producto",
  };
  return labels[type] || type;
};

export const getPeriodLabel = (dateRange: FilterState["dateRange"]): string => {
  const labels: Record<string, string> = {
    today: "Hoy",
    week: "Esta semana",
    month: "Este mes",
    year: "Este año",
    all: "Todo",
    custom: "Personalizado",
  };
  return labels[dateRange] || "";
};

export const getFilterDates = (filters: FilterState): { startDate: Date; endDate: Date } => {
  const now = new Date();
  let startDate: Date;
  let endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  switch (filters.dateRange) {
    case "today":
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "week":
      const day = now.getDay() || 7;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - day + 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
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

export const filterInvoices = (invoices: Invoice[], filters: FilterState): Invoice[] => {
  if (!invoices.length) return [];
  const { startDate, endDate } = getFilterDates(filters);

  return invoices.filter((invoice) => {
    const invoiceDate = new Date(invoice.date);
    if (invoiceDate < startDate || invoiceDate > endDate) return false;
    if (filters.currency !== "all" && invoice.currency !== filters.currency) return false;
    if (filters.status !== "all" && invoice.paymentStatus !== filters.status) return false;

    if (filters.paymentCurrency !== "all") {
      const type = getPaymentType(invoice);
      if (filters.paymentCurrency !== type) return false;
    }

    if (filters.itemType) {
      const hasType = invoice.items?.some((item) => item.type === filters.itemType);
      if (!hasType) return false;
    }

    return true;
  });
};

export const calculateStats = (
  invoices: Invoice[], 
  paymentMethods: PaymentMethod[]
): ReportStats => {
  const byStatus: Record<InvoiceStatus, number> = { 
    Pagado: 0, 
    Pendiente: 0, 
    Parcial: 0, 
    Cancelado: 0 
  };
  const byItemType: Record<string, { count: number; total: number }> = {};
  const byPaymentMethod: Record<string, { count: number; totalUSD: number; totalBs: number }> = {};

  let totalCobradoUSD = 0;
  let totalCobradoBs = 0;
  let totalPendienteUSD = 0;
  let totalFacturado = 0;

  invoices.forEach((invoice) => {
    const paidUSD = invoice.amountPaidUSD || 0;
    const paidBs = invoice.amountPaidBs || 0;
    const exchangeRate = invoice.exchangeRate || 1;

    totalCobradoUSD += paidUSD;
    totalCobradoBs += paidBs;
    totalFacturado += invoice.total || 0;

    const totalPaidInUSD = paidUSD + (paidBs / exchangeRate);
    const pending = (invoice.total || 0) - totalPaidInUSD;
    if (pending > 0) totalPendienteUSD += pending;

    const status = invoice.paymentStatus as InvoiceStatus;
    if (byStatus[status] !== undefined) byStatus[status]++;

    invoice.items?.forEach((item) => {
      if (!byItemType[item.type]) byItemType[item.type] = { count: 0, total: 0 };
      byItemType[item.type].count++;
      byItemType[item.type].total += (item.cost || 0) * (item.quantity || 1);
    });

    if (invoice.paymentMethod) {
      const methodName = typeof invoice.paymentMethod === "string"
        ? paymentMethods.find(m => m._id === invoice.paymentMethod)?.name || "Otro"
        : invoice.paymentMethod?.name || "Otro";
      if (!byPaymentMethod[methodName]) {
        byPaymentMethod[methodName] = { count: 0, totalUSD: 0, totalBs: 0 };
      }
      byPaymentMethod[methodName].count++;
      byPaymentMethod[methodName].totalUSD += paidUSD;
      byPaymentMethod[methodName].totalBs += paidBs;
    }
  });

  return {
    totalCobradoUSD,
    totalCobradoBs,
    totalPendienteUSD,
    totalFacturado,
    byStatus,
    byItemType,
    byPaymentMethod,
    totalInvoices: invoices.length,
    paidCount: byStatus.Pagado,
    pendingCount: byStatus.Pendiente,
    partialCount: byStatus.Parcial,
    canceledCount: byStatus.Cancelado,
  };
};

export const getDefaultFilters = (): FilterState => ({
  dateRange: "month",
  customFrom: "",
  customTo: "",
  currency: "all",
  status: "all",
  paymentCurrency: "all",
  itemType: "",
});

export const countActiveFilters = (filters: FilterState): number => {
  return [
    filters.dateRange !== "month",
    filters.currency !== "all",
    filters.status !== "all",
    filters.paymentCurrency !== "all",
    filters.itemType !== "",
  ].filter(Boolean).length;
};