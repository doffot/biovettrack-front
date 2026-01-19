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
      <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-8 shadow-xl">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-vet-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

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
    if (filter === "invoices") return true;
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
        return { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
      case "Parcial":
        return { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
      case "Pendiente":
        return { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" };
      default:
        return { icon: FileText, color: "text-[var(--color-muted)]", bg: "bg-[var(--color-background)]", border: "border-[var(--color-border)]" };
    }
  };

  const getInvoiceDescription = (invoice: Invoice): string => {
    if (!invoice.items || invoice.items.length === 0) return "Factura";
    const descriptions = invoice.items.map((i) => i.description);
    if (descriptions.length <= 2) return descriptions.join(", ");
    return `${descriptions.slice(0, 2).join(", ")} +${descriptions.length - 2}`;
  };

  const modalServices = payAllMode ? pendingInvoices.flatMap(inv => getInvoiceServices(inv)) : selectedInvoice ? getInvoiceServices(selectedInvoice) : [];
  const modalPatient = payAllMode ? undefined : selectedInvoice ? getPatientInfo(selectedInvoice) : undefined;
  const modalOwner = getOwnerInfo();
  const modalAmount = payAllMode ? Math.max(0, totalDebtUSD) : selectedInvoice ? getPendingAmountUSD(selectedInvoice) : 0;

  return (
    <>
      <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-card)]">
        {/* Header */}
        <div className="px-4 py-4 bg-[var(--color-background)] border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-vet-accent/10 rounded-lg border border-vet-accent/20">
                <History className="w-4 h-4 text-vet-accent" />
              </div>
              <h3 className="font-bold text-[var(--color-text)]">Transacciones</h3>
              <span className="px-2 py-0.5 bg-[var(--color-background)] text-[var(--color-muted)] text-xs font-bold rounded-full border border-[var(--color-border)]">
                {invoices.length}
              </span>
            </div>
            
            {pendingInvoices.length > 1 && onPayAll && (
              <button
                onClick={handleOpenPayAll}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-vet-primary hover:bg-vet-secondary text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-vet-primary/10"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Pagar Todo (${totalDebtUSD.toFixed(2)})
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
              <input
                type="text"
                placeholder="Buscar por mascota o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 text-sm bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-vet-accent/20 transition-all"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-[var(--color-background)] rounded-lg">
                  <X className="w-4 h-4 text-[var(--color-muted)]" />
                </button>
              )}
            </div>
            
            <div className="flex gap-1 bg-[var(--color-background)] p-1 rounded-xl border border-[var(--color-border)]">
              {[
                { value: "all", label: "Todas", icon: Filter },
                { value: "pending", label: "Pendientes", icon: AlertCircle },
                { value: "payments", label: "Pagadas", icon: CheckCircle2 },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value as FilterType)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    filter === opt.value
                      ? "bg-vet-accent text-white shadow-md shadow-vet-accent/20"
                      : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-card)]"
                  }`}
                >
                  <opt.icon className="w-3 h-3" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista */}
        <div className="divide-y divide-[var(--color-border)] max-h-[600px] overflow-y-auto custom-scrollbar">
          {Object.keys(groupedByDate).length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-background)] rounded-full flex items-center justify-center border border-[var(--color-border)]">
                <FileText className="w-8 h-8 text-[var(--color-muted)]" />
              </div>
              <p className="text-[var(--color-text)] font-bold mb-1">No hay transacciones</p>
              <p className="text-[var(--color-muted)] text-sm">Aún no se han registrado movimientos</p>
            </div>
          ) : (
            Object.entries(groupedByDate).map(([date, dateInvoices]) => (
              <div key={date}>
                <div className="px-4 py-2 bg-[var(--color-background)] sticky top-0 z-10 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-muted)] font-bold">
                    <Calendar className="w-3.5 h-3.5 text-vet-accent" />
                    <span>{date}</span>
                  </div>
                </div>

                {dateInvoices.map((invoice) => {
                  const status = getStatusConfig(invoice.paymentStatus);
                  const StatusIcon = status.icon;
                  const isExpanded = expandedInvoice === invoice._id;
                  const pendingAmount = getPendingAmountUSD(invoice);
                  const isPending = invoice.paymentStatus === "Pendiente" || invoice.paymentStatus === "Parcial";

                  return (
                    <div key={invoice._id} className="hover:bg-[var(--color-background)]/50 transition-colors border-b border-[var(--color-border)] last:border-0">
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                            isPending ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20"
                          }`}>
                            {isPending ? <ArrowUpRight className="w-5 h-5 text-red-500" /> : <ArrowDownLeft className="w-5 h-5 text-emerald-500" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-[var(--color-text)] text-sm">{getPatientName(invoice)}</span>
                              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${status.bg} ${status.color} ${status.border}`}>
                                <StatusIcon className="w-2.5 h-2.5" />
                                {invoice.paymentStatus}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--color-muted)] truncate mt-0.5">{getInvoiceDescription(invoice)}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className={`text-sm font-bold ${isPending ? "text-[var(--color-text)]" : "text-emerald-500"}`}>
                                {isPending ? "-" : "+"}${invoice.total.toFixed(2)}
                              </p>
                              {pendingAmount > 0.01 && <p className="text-[10px] text-red-500 font-bold">Debe: ${pendingAmount.toFixed(2)}</p>}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setExpandedInvoice(isExpanded ? null : invoice._id!)}
                                className={`p-1.5 rounded-lg border transition-all ${
                                  isExpanded ? "bg-vet-accent/10 text-vet-accent border-vet-accent/20" : "text-[var(--color-muted)] hover:bg-[var(--color-background)] border-transparent"
                                }`}
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>

                              {pendingAmount > 0.01 && onPayInvoice && (
                                <button
                                  onClick={() => handleOpenPayment(invoice)}
                                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-emerald-500/10"
                                >
                                  Pagar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4">
                          <div className="ml-10 pl-4 border-l-2 border-vet-accent/20">
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

        {/* Footer */}
        {invoices.length > 0 && (
          <div className="px-4 py-3 bg-[var(--color-background)] border-t border-[var(--color-border)]">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-4">
                <span className="text-[var(--color-muted)]">{invoices.length} Factura{invoices.length !== 1 ? "s" : ""}</span>
                {pendingInvoices.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-amber-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    {pendingInvoices.length} Pendiente{pendingInvoices.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {totalDebtUSD > 0 && <span className="text-red-500">Total Pendiente: ${totalDebtUSD.toFixed(2)}</span>}
            </div>
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => { setShowPaymentModal(false); setSelectedInvoice(null); setPayAllMode(false); }}
        amountUSD={modalAmount}
        creditBalance={creditBalance}
        title={payAllMode ? "Pagar Deuda Total" : "Pagar Factura"}
        subtitle={payAllMode ? `${pendingInvoices.length} facturas pendientes` : selectedInvoice ? getInvoiceDescription(selectedInvoice) : undefined}
        services={modalServices}
        patient={modalPatient}
        owner={modalOwner}
        onConfirm={handlePaymentConfirm}
      />
    </>
  );
}