// src/components/owners/TransactionHistory.tsx
import { useState } from "react";
import {  useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  CreditCard,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Calendar,
} from "lucide-react";
import type { Invoice } from "../../types/invoice";
import { getPatientName } from "../../types/invoice";
import { PaymentModal } from "../payment/PaymentModal";
import { InvoicePayments } from "./InvoicePayments";

export interface PaymentData {
  paymentMethodId?: string;
  reference?: string;
  addAmountPaidUSD: number;
  addAmountPaidBs: number;
  exchangeRate: number;
  isPartial: boolean;
  creditAmountUsed?: number;
}

type FilterType = "all" | "invoices" | "payments" | "pending";

interface TransactionHistoryProps {
  invoices: Invoice[];
  creditBalance?: number;
  isLoading?: boolean;
  onPayInvoice?: (invoiceId: string, paymentData: PaymentData) => Promise<void>;
  onPayAll?: (invoiceIds: string[], paymentData: PaymentData) => Promise<void>;
}

export function TransactionHistory({
  invoices,
  creditBalance = 0,
  isLoading,
  onPayInvoice,
  onPayAll,
}: TransactionHistoryProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payAllMode, setPayAllMode] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-vet-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Filtrar facturas
  const filteredInvoices = invoices.filter((inv) => {
    // Filtro por búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const patientName = getPatientName(inv).toLowerCase();
      const description = inv.items?.map(i => i.description).join(" ").toLowerCase() || "";
      if (!patientName.includes(search) && !description.includes(search)) {
        return false;
      }
    }

    // Filtro por tipo
    if (filter === "pending") {
      return inv.paymentStatus === "Pendiente" || inv.paymentStatus === "Parcial";
    }
    if (filter === "invoices") {
      return true; // Todas las facturas
    }
    if (filter === "payments") {
      return inv.paymentStatus === "Pagado" || inv.paymentStatus === "Parcial";
    }
    return true;
  });

  // Ordenar por fecha (más reciente primero)
  const sortedInvoices = [...filteredInvoices].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Agrupar por fecha
  const groupedByDate = sortedInvoices.reduce((acc, invoice) => {
    const date = new Date(invoice.date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(invoice);
    return acc;
  }, {} as Record<string, Invoice[]>);

  const pendingInvoices = invoices.filter(
    (inv) => inv.paymentStatus === "Pendiente" || inv.paymentStatus === "Parcial"
  );

  const totalDebtUSD = invoices.reduce((sum, inv) => {
    const consumed = inv.currency === "Bs" && inv.exchangeRate ? inv.total / inv.exchangeRate : inv.total;
    return sum + consumed - (inv.amountPaid || 0);
  }, 0);

  // Handlers
  const handleOpenPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPayAllMode(false);
    setShowPaymentModal(true);
  };

  const handleOpenPayAll = () => {
    setPayAllMode(true);
    setSelectedInvoice(null);
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async (paymentData: PaymentData) => {
    try {
      if (payAllMode && onPayAll) {
        const ids = pendingInvoices.map((inv) => inv._id!).filter(Boolean);
        await onPayAll(ids, paymentData);
      } else if (selectedInvoice && onPayInvoice) {
        await onPayInvoice(selectedInvoice._id!, paymentData);
      }
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      setPayAllMode(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handlePaymentCancelled = () => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    queryClient.invalidateQueries({ queryKey: ["payments"] });
  };

  const getPendingAmountUSD = (invoice: Invoice) => {
    const pending = invoice.total - (invoice.amountPaid || 0);
    if (invoice.currency === "Bs" && invoice.exchangeRate) {
      return pending / invoice.exchangeRate;
    }
    return pending;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Pagado":
        return { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" };
      case "Parcial":
        return { icon: Clock, color: "text-amber-600", bg: "bg-amber-100" };
      case "Pendiente":
        return { icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" };
      default:
        return { icon: FileText, color: "text-gray-600", bg: "bg-gray-100" };
    }
  };

  const getInvoiceDescription = (invoice: Invoice): string => {
    if (!invoice.items || invoice.items.length === 0) return "Factura";
    const descriptions = invoice.items.map((i) => i.description);
    if (descriptions.length <= 2) return descriptions.join(", ");
    return `${descriptions.slice(0, 2).join(", ")} +${descriptions.length - 2}`;
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">Transacciones</h3>
              <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                {invoices.length}
              </span>
            </div>
            {pendingInvoices.length > 1 && onPayAll && (
              <button
                onClick={handleOpenPayAll}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Pagar Todo
              </button>
            )}
          </div>

          {/* Búsqueda y filtros */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por mascota o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
              />
            </div>
            <div className="flex gap-1">
              {[
                { value: "all", label: "Todas" },
                { value: "pending", label: "Pendientes" },
                { value: "payments", label: "Pagadas" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value as FilterType)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    filter === opt.value
                      ? "bg-slate-800 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de transacciones */}
        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          {Object.keys(groupedByDate).length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">No hay transacciones</p>
            </div>
          ) : (
            Object.entries(groupedByDate).map(([date, dateInvoices]) => (
              <div key={date}>
                {/* Fecha separadora */}
                <div className="px-4 py-2 bg-gray-50 sticky top-0 z-10">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-medium">{date}</span>
                  </div>
                </div>

                {/* Facturas del día */}
                {dateInvoices.map((invoice) => {
                  const status = getStatusConfig(invoice.paymentStatus);
                  const StatusIcon = status.icon;
                  const isExpanded = expandedInvoice === invoice._id;
                  const pendingAmount = getPendingAmountUSD(invoice);
                  const isPending = invoice.paymentStatus === "Pendiente" || invoice.paymentStatus === "Parcial";

                  return (
                    <div key={invoice._id} className="hover:bg-gray-50/50 transition-colors">
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* Icono de tipo */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isPending ? "bg-red-50" : "bg-emerald-50"
                          }`}>
                            {isPending ? (
                              <ArrowUpRight className="w-5 h-5 text-red-500" />
                            ) : (
                              <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 text-sm truncate">
                                {getPatientName(invoice)}
                              </span>
                              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${status.bg} ${status.color}`}>
                                <StatusIcon className="w-2.5 h-2.5" />
                                {invoice.paymentStatus}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {getInvoiceDescription(invoice)}
                            </p>
                          </div>

                          {/* Monto y acciones */}
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className={`text-sm font-bold ${isPending ? "text-gray-900" : "text-emerald-600"}`}>
                                {isPending ? "-" : "+"}${invoice.total.toFixed(2)}
                              </p>
                              {pendingAmount > 0.01 && (
                                <p className="text-[10px] text-red-500 font-medium">
                                  Debe: ${pendingAmount.toFixed(2)}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setExpandedInvoice(isExpanded ? null : invoice._id!)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isExpanded ? "bg-slate-100 text-slate-700" : "text-gray-400 hover:bg-gray-100"
                                }`}
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>

                              {pendingAmount > 0.01 && onPayInvoice && (
                                <button
                                  onClick={() => handleOpenPayment(invoice)}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors"
                                >
                                  Pagar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detalles expandidos */}
                      {isExpanded && (
                        <div className="px-4 pb-3">
                          <div className="ml-13 pl-4 border-l-2 border-gray-200">
                            <InvoicePayments
                              invoiceId={invoice._id!}
                              onPaymentCancelled={handlePaymentCancelled}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de pago */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedInvoice(null);
          setPayAllMode(false);
        }}
        amountUSD={payAllMode ? Math.max(0, totalDebtUSD) : selectedInvoice ? getPendingAmountUSD(selectedInvoice) : 0}
        creditBalance={creditBalance}
        title={payAllMode ? "Pagar Todas las Facturas" : "Pagar Factura"}
        subtitle={
          payAllMode
            ? `${pendingInvoices.length} factura${pendingInvoices.length > 1 ? "s" : ""}`
            : selectedInvoice
            ? `${getPatientName(selectedInvoice)}`
            : ""
        }
        items={
          payAllMode
            ? pendingInvoices.map((inv) => ({
                id: inv._id || "",
                description: getInvoiceDescription(inv),
                patientName: getPatientName(inv),
                date: inv.date,
              }))
            : selectedInvoice
            ? [{
                id: selectedInvoice._id || "",
                description: getInvoiceDescription(selectedInvoice),
                patientName: getPatientName(selectedInvoice),
                date: selectedInvoice.date,
              }]
            : []
        }
        onConfirm={handlePaymentConfirm}
      />
    </>
  );
}