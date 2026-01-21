// src/components/owners/OwnerInvoiceHistory.tsx
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  X,
  FileText,
  Filter,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  History,
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

type FilterStatus = "all" | "pending" | "paid";

interface OwnerInvoiceHistoryProps {
  invoices: Invoice[];
  creditBalance?: number;
  isOpen: boolean;
  onClose: () => void;
  owner?: Owner;           
  patients?: Patient[];    
  onPayInvoice?: (invoiceId: string, paymentData: PaymentData) => Promise<void>;
  onPayAll?: (invoiceIds: string[], paymentData: PaymentData) => Promise<void>;
}

export function OwnerInvoiceHistory({
  invoices,
  creditBalance = 0,
  isOpen,
  onClose,
  owner,          
  patients = [],  
  onPayInvoice,
  onPayAll,
}: OwnerInvoiceHistoryProps) {
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<FilterStatus>("all");
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payAllMode, setPayAllMode] = useState(false);

  // ==================== HELPERS PARA EL MODAL ====================

  // Convertir items de invoice a PaymentServiceItem
  const getInvoiceServices = (invoice: Invoice): PaymentServiceItem[] => {
    if (!invoice.items || invoice.items.length === 0) return [];
    return invoice.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.cost,
      total: item.cost * item.quantity,
    }));
  };

  // Obtener info del paciente de una factura
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

    // Fallback al nombre del patientId poblado
    if (typeof invoice.patientId === "object" && invoice.patientId) {
      return { name: invoice.patientId.name };
    }

    return undefined;
  };

  // Obtener info del owner
  const getOwnerInfo = (): PaymentOwnerInfo | undefined => {
    if (!owner) return undefined;
    return {
      name: owner.name,
      phone: owner.contact,
    };
  };

  const getInvoiceDescription = (invoice: Invoice): string => {
    if (!invoice.items || invoice.items.length === 0) return "Factura";
    const descriptions = invoice.items.map((i) => i.description);
    if (descriptions.length <= 2) return descriptions.join(", ");
    return `${descriptions.slice(0, 2).join(", ")} +${descriptions.length - 2} más`;
  };

  if (!isOpen) return null;

  // Filtrar facturas
  const filteredInvoices = invoices.filter((inv) => {
    if (filter === "pending") {
      return inv.paymentStatus === "Pendiente" || inv.paymentStatus === "Parcial";
    }
    if (filter === "paid") {
      return inv.paymentStatus === "Pagado";
    }
    return true;
  });

  // Facturas pendientes (para pagar todo)
  const pendingInvoices = invoices.filter(
    (inv) => inv.paymentStatus === "Pendiente" || inv.paymentStatus === "Parcial"
  );

  // Totales
  const totalConsumedUSD = invoices.reduce((sum, inv) => {
    if (inv.currency === "Bs" && inv.exchangeRate) {
      return sum + inv.total / inv.exchangeRate;
    }
    return sum + inv.total;
  }, 0);

  const totalPaidUSD = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const totalDebtUSD = Math.max(0, totalConsumedUSD - totalPaidUSD);

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
      console.error("Error al procesar pago:", error);
    }
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedInvoice(null);
    setPayAllMode(false);
  };

  const handlePaymentCancelled = () => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    queryClient.invalidateQueries({ queryKey: ["payments"] });
  };

  const toggleExpanded = (invoiceId: string) => {
    setExpandedInvoice(expandedInvoice === invoiceId ? null : invoiceId);
  };

  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
        return {
          icon: CheckCircle2,
          color: "text-emerald-600",
          bg: "bg-emerald-100",
          label: "Pagado",
        };
      case "Parcial":
        return {
          icon: Clock,
          color: "text-amber-600",
          bg: "bg-amber-100",
          label: "Parcial",
        };
      case "Pendiente":
        return {
          icon: AlertCircle,
          color: "text-red-600",
          bg: "bg-red-100",
          label: "Pendiente",
        };
      default:
        return {
          icon: FileText,
          color: "text-gray-600",
          bg: "bg-gray-100",
          label: status,
        };
    }
  };

  // ==================== DATOS PARA EL MODAL ====================

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
    ? totalDebtUSD
    : selectedInvoice
      ? getPendingAmountUSD(selectedInvoice)
      : 0;

  return (
    <>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Historial de Facturas
                </h3>
                <p className="text-white/80 text-sm">
                  {invoices.length} factura{invoices.length !== 1 ? "s" : ""} •{" "}
                  ${totalConsumedUSD.toFixed(2)} total
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Resumen rápido */}
          <div className="p-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-white rounded-lg">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Consumido</p>
                <p className="text-base font-bold text-gray-900">
                  ${totalConsumedUSD.toFixed(2)}
                </p>
              </div>
              <div className="text-center p-2 bg-emerald-50 rounded-lg">
                <p className="text-[10px] text-emerald-600 uppercase tracking-wide">Pagado</p>
                <p className="text-base font-bold text-emerald-600">
                  ${totalPaidUSD.toFixed(2)}
                </p>
              </div>
              <div className={`text-center p-2 rounded-lg ${totalDebtUSD > 0 ? "bg-red-50" : "bg-gray-100"}`}>
                <p className={`text-[10px] uppercase tracking-wide ${totalDebtUSD > 0 ? "text-red-600" : "text-gray-500"}`}>
                  Pendiente
                </p>
                <p className={`text-base font-bold ${totalDebtUSD > 0 ? "text-red-600" : "text-gray-400"}`}>
                  ${totalDebtUSD.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-2 flex-shrink-0">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex gap-1">
              {[
                { value: "all", label: "Todas" },
                { value: "pending", label: "Pendientes" },
                { value: "paid", label: "Pagadas" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value as FilterStatus)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    filter === option.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <span className="ml-auto text-xs text-gray-400">
              {filteredInvoices.length} resultado{filteredInvoices.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Lista de facturas */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No hay facturas para mostrar</p>
              </div>
            ) : (
              filteredInvoices.map((invoice, index) => {
                const status = getStatusConfig(invoice.paymentStatus);
                const StatusIcon = status.icon;
                const isExpanded = expandedInvoice === invoice._id;
                const pendingAmount = getPendingAmountUSD(invoice);
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={invoice._id}
                    className={`border border-gray-200 rounded-xl overflow-hidden transition-all hover:border-gray-300 ${
                      isEven ? "bg-white" : "bg-gray-50/70"
                    }`}
                  >
                    {/* Cabecera de factura */}
                    <div className="p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Primera línea: Paciente + Estado */}
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-gray-900 truncate text-sm">
                              {getPatientName(invoice)}
                            </span>
                            <span
                              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${status.bg} ${status.color}`}
                            >
                              <StatusIcon className="w-2.5 h-2.5" />
                              {status.label}
                            </span>
                          </div>

                          {/* Segunda línea: Fecha + Descripción */}
                          <p className="text-xs text-gray-500 truncate">
                            {formatDate(invoice.date)} • {getInvoiceDescription(invoice)}
                          </p>
                        </div>

                        {/* Montos + Acciones */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {/* Montos */}
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              ${invoice.total.toFixed(2)}
                            </p>
                            {pendingAmount > 0.01 && (
                              <p className="text-[10px] text-red-600 font-medium">
                                Debe: ${pendingAmount.toFixed(2)}
                              </p>
                            )}
                            {invoice.amountPaid > 0 && pendingAmount <= 0.01 && (
                              <p className="text-[10px] text-emerald-600">
                                Pagado ✓
                              </p>
                            )}
                          </div>

                          {/* Botones */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleExpanded(invoice._id!)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isExpanded
                                  ? "bg-blue-100 text-blue-600"
                                  : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                              }`}
                              title="Ver pagos"
                            >
                              <History className="w-4 h-4" />
                            </button>

                            {pendingAmount > 0.01 && onPayInvoice && (
                              <button
                                onClick={() => handleOpenPayment(invoice)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors"
                              >
                                Pagar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botón expandir */}
                      <button
                        onClick={() => toggleExpanded(invoice._id!)}
                        className="w-full mt-2 pt-2 border-t border-gray-100 flex items-center justify-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            Ocultar pagos
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            Ver pagos
                          </>
                        )}
                      </button>
                    </div>

                    {/* Pagos expandidos */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-blue-50/30 p-3">
                        <InvoicePayments
                          invoiceId={invoice._id!}
                          onPaymentCancelled={handlePaymentCancelled}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between flex-shrink-0">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Balance pendiente</p>
              <p className={`text-lg font-bold ${totalDebtUSD > 0 ? "text-red-600" : "text-emerald-600"}`}>
                ${totalDebtUSD.toFixed(2)}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
              >
                Cerrar
              </button>

              {pendingInvoices.length > 1 && onPayAll && (
                <button
                  onClick={handleOpenPayAll}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  Pagar Todo (${totalDebtUSD.toFixed(2)})
                </button>
              )}

              {pendingInvoices.length === 1 && onPayInvoice && (
                <button
                  onClick={() => handleOpenPayment(pendingInvoices[0])}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  Pagar (${totalDebtUSD.toFixed(2)})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Modal de pago ACTUALIZADO con nuevos props */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleClosePaymentModal}
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