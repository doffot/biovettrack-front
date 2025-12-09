// src/components/owner/FinancialSummary.tsx
import { useState } from "react";
import { DollarSign, CheckCircle2, X, CreditCard, TrendingDown, Calendar, ExternalLink } from "lucide-react";
import type { Invoice } from "../../types/invoice";
import { getPatientName } from "../../types/invoice";
import { PaymentModal } from "../payment/PaymentModal";

interface PaymentData {
  paymentMethodId: string;
  reference?: string;
  amountPaidUSD: number;
  amountPaidBs: number;
  exchangeRate: number;
  isPartial: boolean;
}

interface FinancialSummaryProps {
  invoices: Invoice[];
  isLoading?: boolean;
  onPayInvoice?: (invoiceId: string, paymentData: PaymentData) => Promise<void>;
  onPayAll?: (invoiceIds: string[], paymentData: PaymentData) => Promise<void>;
}

export function FinancialSummary({
  invoices = [],
  isLoading,
  onPayInvoice,
  onPayAll,
}: FinancialSummaryProps) {
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payAllMode, setPayAllMode] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-vet-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  const pendingInvoices = safeInvoices.filter(
    (inv) => inv.paymentStatus === "Pendiente" || inv.paymentStatus === "Parcial"
  );

  const paidInvoices = safeInvoices.filter((inv) => inv.paymentStatus === "Pagado");

  const totalConsumedUSD = safeInvoices.reduce((sum, inv) => {
    if (inv.currency === "Bs" && inv.exchangeRate) {
      return sum + inv.total / inv.exchangeRate;
    }
    return sum + inv.total;
  }, 0);

  const totalDebtUSD = pendingInvoices.reduce((sum, inv) => {
    const pending = inv.total - (inv.amountPaid || 0);
    if (inv.currency === "Bs" && inv.exchangeRate) {
      return sum + pending / inv.exchangeRate;
    }
    return sum + pending;
  }, 0);

  const lastPaymentDate = (() => {
    const dates = paidInvoices
      .filter(inv => inv.updatedAt || inv.date)
      .map(inv => new Date(inv.updatedAt || inv.date))
      .sort((a, b) => b.getTime() - a.getTime());
    return dates[0] || null;
  })();

  const handleOpenPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPayAllMode(false);
    setShowPaymentModal(true);
  };

  const handleOpenPayAll = () => {
    setPayAllMode(true);
    setSelectedInvoice(null);
    setShowPaymentModal(true);
    setShowPendingModal(false);
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
      setShowPendingModal(false);
    } catch (error) {
      console.error("Error al procesar pago:", error);
    }
  };

  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getPendingAmount = (invoice: Invoice) => invoice.total - (invoice.amountPaid || 0);

  const getPendingAmountUSD = (invoice: Invoice) => {
    const pending = getPendingAmount(invoice);
    if (invoice.currency === "Bs" && invoice.exchangeRate) {
      return pending / invoice.exchangeRate;
    }
    return pending;
  };

  const getInvoiceDescription = (invoice: Invoice): string => {
    if (!invoice.items || invoice.items.length === 0) return "Factura";
    const descriptions = invoice.items.map((i) => i.description);
    if (descriptions.length <= 2) return descriptions.join(", ");
    return `${descriptions.slice(0, 2).join(", ")} +${descriptions.length - 2} más`;
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">Resumen Financiero</h3>
            <p className="text-sm text-gray-500">Estado de cuentas del propietario</p>
          </div>

          {totalDebtUSD > 0 && onPayAll && (
            <button
              onClick={handleOpenPayAll}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Pagar
            </button>
          )}
        </div>

        {/* Total Consumido */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-2">Total Consumido</p>
          <p className="text-4xl font-bold text-gray-900">
            ${totalConsumedUSD.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {safeInvoices.length} factura{safeInvoices.length !== 1 ? "s" : ""} • 
            {paidInvoices.length} pagada{paidInvoices.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Fila inferior: Deuda (izq) + Último pago (der) */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Lado izquierdo: Deuda */}
          <div>
            {totalDebtUSD > 0 ? (
              <>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Deuda Pendiente</p>
                <p className="text-2xl font-bold text-red-600">${totalDebtUSD.toFixed(2)}</p>
                <button
                  onClick={() => setShowPendingModal(true)}
                  className="text-xs text-red-500 hover:text-red-700 inline-flex items-center gap-1 hover:underline transition-colors mt-0.5"
                >
                  {pendingInvoices.length} factura{pendingInvoices.length !== 1 ? "s" : ""} por pagar
                  <ExternalLink className="w-3 h-3" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Sin deudas</span>
              </div>
            )}
          </div>

          {/* Lado derecho: Último pago */}
          {lastPaymentDate && (
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-gray-400 justify-end">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-xs uppercase tracking-wide">Último pago</span>
              </div>
              <p className="text-sm font-semibold text-gray-700">{formatDate(lastPaymentDate)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Facturas Pendientes */}
      {showPendingModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Facturas Pendientes</h3>
                  <p className="text-sm text-gray-500">
                    {pendingInvoices.length} factura{pendingInvoices.length > 1 ? "s" : ""} • Total: ${totalDebtUSD.toFixed(2)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPendingModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista */}
            <div className="p-4 overflow-y-auto max-h-[50vh] space-y-3">
              {pendingInvoices.map((invoice) => (
                <div
                  key={invoice._id}
                  className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 truncate">
                          {getPatientName(invoice)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${
                          invoice.paymentStatus === "Parcial"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {invoice.paymentStatus}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{formatDate(invoice.date)}</p>

                      <div className="space-y-0.5">
                        {invoice.items.slice(0, 2).map((item, idx) => (
                          <p key={idx} className="text-xs text-gray-600 truncate">
                            • {item.description}
                          </p>
                        ))}
                        {invoice.items.length > 2 && (
                          <p className="text-xs text-gray-400">+{invoice.items.length - 2} más</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-gray-900">
                        ${getPendingAmountUSD(invoice).toFixed(2)}
                      </p>
                      {invoice.amountPaid > 0 && (
                        <p className="text-[10px] text-gray-400">
                          de ${invoice.total.toFixed(2)}
                        </p>
                      )}

                      {onPayInvoice && (
                        <button
                          onClick={() => handleOpenPayment(invoice)}
                          className="mt-2 px-3 py-1.5 bg-gray-100 hover:bg-emerald-600 text-gray-600 hover:text-white text-xs font-medium rounded-lg transition-all"
                        >
                          Pagar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total pendiente</p>
                <p className="text-xl font-bold text-gray-900">${totalDebtUSD.toFixed(2)}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowPendingModal(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                >
                  Cerrar
                </button>
                {onPayAll && (
                  <button
                    onClick={handleOpenPayAll}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all"
                  >
                    <CreditCard className="w-4 h-4" />
                    Pagar Todo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pago */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedInvoice(null);
        }}
        amountUSD={payAllMode ? totalDebtUSD : selectedInvoice ? getPendingAmountUSD(selectedInvoice) : 0}
        title={payAllMode ? "Pagar Facturas" : "Pagar Factura"}
        subtitle={
          payAllMode
            ? `${pendingInvoices.length} factura${pendingInvoices.length > 1 ? "s" : ""}`
            : selectedInvoice
            ? `${getPatientName(selectedInvoice)} - ${formatDate(selectedInvoice.date)}`
            : ""
        }
        items={
          payAllMode
            ? pendingInvoices.map((inv) => ({
                id: inv._id || `temp-${Math.random()}`,
                description: getInvoiceDescription(inv),
                patientName: getPatientName(inv),
                date: inv.date,
              }))
            : selectedInvoice
            ? [{
                id: selectedInvoice._id || `temp-${Math.random()}`,
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