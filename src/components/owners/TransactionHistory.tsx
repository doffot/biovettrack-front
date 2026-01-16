// src/components/owners/TransactionHistory.tsx
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  X,
  Filter,
} from "lucide-react";
import type { Invoice } from "../../types/invoice";
import type { Patient } from "../../types/patient";
import type { Owner } from "../../types/owner";
import { getPatientName } from "../../types/invoice";
import { PaymentModal } from "../payment/PaymentModal";
import type { PaymentServiceItem, PaymentPatientInfo, PaymentOwnerInfo } from "../payment/PaymentModal";
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
  owner?: Owner;
  patients?: Patient[];
  onPayInvoice?: (invoiceId: string, paymentData: PaymentData) => Promise<void>;
  onPayAll?: (invoiceIds: string[], paymentData: PaymentData) => Promise<void>;
}

export function TransactionHistory({
  invoices,
  creditBalance = 0,
  isLoading,
  owner,
  patients = [],
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

  // ==================== HELPERS PARA EL MODAL ====================

  const getInvoiceServices = (invoice: Invoice): PaymentServiceItem[] => {
    if (!invoice.items || invoice.items.length === 0) return [];
    return invoice.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.cost,
      total: item.cost * item.quantity,
    }));
  };

  const getPatientInfo = (invoice: Invoice): PaymentPatientInfo | undefined => {
    const patient = patients.find((p) => {
      if (typeof invoice.patientId === "string") return p._id === invoice.patientId;
      return p._id === invoice.patientId?._id;
    });

    if (patient) {
      return {
        name: patient.name,
        photo: patient.photo,
      };
    }

    if (typeof invoice.patientId === "object" && invoice.patientId) {
      return { name: invoice.patientId.name };
    }

    return undefined;
  };

  const getOwnerInfo = (): PaymentOwnerInfo | undefined => {
    if (!owner) return undefined;
    return {
      name: owner.name,
      phone: owner.contact,
    };
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/10 p-8 shadow-xl">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-vet-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Filtrar facturas
  const filteredInvoices = invoices.filter((inv) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const patientName = getPatientName(inv).toLowerCase();
      const description = inv.items?.map(i => i.description).join(" ").toLowerCase() || "";
      if (!patientName.includes(search) && !description.includes(search)) {
        return false;
      }
    }

    if (filter === "pending") {
      return inv.paymentStatus === "Pendiente" || inv.paymentStatus === "Parcial";
    }
    if (filter === "invoices") {
      return true;
    }
    if (filter === "payments") {
      return inv.paymentStatus === "Pagado" || inv.paymentStatus === "Parcial";
    }
    return true;
  });

  const sortedInvoices = [...filteredInvoices].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
        return { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30" };
      case "Parcial":
        return { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30" };
      case "Pendiente":
        return { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30" };
      default:
        return { icon: FileText, color: "text-slate-400", bg: "bg-slate-500/20", border: "border-slate-500/30" };
    }
  };

  const getInvoiceDescription = (invoice: Invoice): string => {
    if (!invoice.items || invoice.items.length === 0) return "Factura";
    const descriptions = invoice.items.map((i) => i.description);
    if (descriptions.length <= 2) return descriptions.join(", ");
    return `${descriptions.slice(0, 2).join(", ")} +${descriptions.length - 2}`;
  };

  // Datos para el modal
  const modalServices: PaymentServiceItem[] = payAllMode
    ? pendingInvoices.flatMap((inv) => getInvoiceServices(inv))
    : selectedInvoice
      ? getInvoiceServices(selectedInvoice)
      : [];

  const modalPatient: PaymentPatientInfo | undefined = payAllMode
    ? undefined
    : selectedInvoice
      ? getPatientInfo(selectedInvoice)
      : undefined;

  const modalOwner: PaymentOwnerInfo | undefined = getOwnerInfo();

  const modalAmount = payAllMode
    ? Math.max(0, totalDebtUSD)
    : selectedInvoice
      ? getPendingAmountUSD(selectedInvoice)
      : 0;

  return (
    <>
      <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        {/* Header */}
        <div className="px-4 py-4 bg-gradient-to-r from-slate-800/60 via-slate-800/40 to-slate-800/60 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-vet-accent/20 rounded-lg border border-vet-accent/30">
                <History className="w-4 h-4 text-vet-accent" />
              </div>
              <h3 className="font-semibold text-white">Transacciones</h3>
              <span className="px-2 py-0.5 bg-slate-700/50 text-slate-300 text-xs font-medium rounded-full border border-white/10">
                {invoices.length}
              </span>
            </div>
            
            {pendingInvoices.length > 1 && onPayAll && (
              <button
                onClick={handleOpenPayAll}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-emerald-500/25"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Pagar Todo (${totalDebtUSD.toFixed(2)})
              </button>
            )}
          </div>

          {/* Búsqueda y filtros */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por mascota o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 text-sm bg-slate-800/60 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-vet-accent/50 focus:border-vet-accent/50 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
            
            <div className="flex gap-1 bg-slate-800/40 p-1 rounded-xl border border-white/10">
              {[
                { value: "all", label: "Todas", icon: Filter },
                { value: "pending", label: "Pendientes", icon: AlertCircle },
                { value: "payments", label: "Pagadas", icon: CheckCircle2 },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value as FilterType)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${
                    filter === opt.value
                      ? "bg-vet-accent text-slate-900 shadow-lg shadow-vet-accent/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <opt.icon className="w-3 h-3" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de transacciones */}
        <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
          {Object.keys(groupedByDate).length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/60 rounded-full flex items-center justify-center border border-white/10">
                <FileText className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-white font-medium mb-1">No hay transacciones</p>
              <p className="text-slate-500 text-sm">
                {searchTerm || filter !== "all" ? "Prueba con otros filtros" : "Aún no se han registrado movimientos"}
              </p>
            </div>
          ) : (
            Object.entries(groupedByDate).map(([date, dateInvoices]) => (
              <div key={date}>
                {/* Fecha separadora */}
                <div className="px-4 py-2 bg-slate-800/40 sticky top-0 z-10 backdrop-blur-sm border-b border-white/5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-vet-accent" />
                    <span className="font-medium">{date}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-500">{dateInvoices.length} transacción{dateInvoices.length !== 1 ? "es" : ""}</span>
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
                    <div key={invoice._id} className="hover:bg-white/[0.02] transition-colors">
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* Icono de tipo */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                            isPending 
                              ? "bg-red-500/10 border-red-500/30" 
                              : "bg-emerald-500/10 border-emerald-500/30"
                          }`}>
                            {isPending ? (
                              <ArrowUpRight className="w-5 h-5 text-red-400" />
                            ) : (
                              <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-white text-sm truncate">
                                {getPatientName(invoice)}
                              </span>
                              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${status.bg} ${status.color} ${status.border}`}>
                                <StatusIcon className="w-2.5 h-2.5" />
                                {invoice.paymentStatus}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {getInvoiceDescription(invoice)}
                            </p>
                          </div>

                          {/* Monto y acciones */}
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className={`text-sm font-bold ${isPending ? "text-white" : "text-emerald-400"}`}>
                                {isPending ? "-" : "+"}${invoice.total.toFixed(2)}
                              </p>
                              {pendingAmount > 0.01 && (
                                <p className="text-[10px] text-red-400 font-medium">
                                  Debe: ${pendingAmount.toFixed(2)}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setExpandedInvoice(isExpanded ? null : invoice._id!)}
                                className={`p-1.5 rounded-lg border transition-all duration-200 ${
                                  isExpanded 
                                    ? "bg-vet-accent/20 text-vet-accent border-vet-accent/30" 
                                    : "text-slate-400 hover:text-white hover:bg-white/10 border-transparent"
                                }`}
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>

                              {pendingAmount > 0.01 && onPayInvoice && (
                                <button
                                  onClick={() => handleOpenPayment(invoice)}
                                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-emerald-500/20"
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
                        <div className="px-4 pb-4">
                          <div className="ml-13 pl-4 border-l-2 border-vet-accent/30">
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

        {/* Footer con resumen */}
        {invoices.length > 0 && (
          <div className="px-4 py-3 bg-slate-800/40 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="text-slate-400">
                  {invoices.length} factura{invoices.length !== 1 ? "s" : ""}
                </span>
                {pendingInvoices.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    {pendingInvoices.length} pendiente{pendingInvoices.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {totalDebtUSD > 0 && (
                <span className="text-amber-400 font-semibold">
                  Total pendiente: ${totalDebtUSD.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de pago */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedInvoice(null);
          setPayAllMode(false);
        }}
        amountUSD={modalAmount}
        creditBalance={creditBalance}
        title={payAllMode ? "Pagar Todas las Facturas" : "Pagar Factura"}
        subtitle={
          payAllMode
            ? `${pendingInvoices.length} factura${pendingInvoices.length > 1 ? "s" : ""}`
            : selectedInvoice
              ? getInvoiceDescription(selectedInvoice)
              : undefined
        }
        services={modalServices}
        patient={modalPatient}
        owner={modalOwner}
        onConfirm={handlePaymentConfirm}
      />
    </>
  );
}