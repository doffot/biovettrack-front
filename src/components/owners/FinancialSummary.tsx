// src/components/owners/FinancialSummary.tsx
import { useState } from "react";
import {
  DollarSign,
  CheckCircle2,
  CreditCard,
  Calendar,
  FileText,
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import type { Invoice } from "../../types/invoice";
import { OwnerInvoiceHistory, type PaymentData } from "./OwnerInvoiceHistory";

interface FinancialSummaryProps {
  invoices: Invoice[];
  creditBalance?: number;
  isLoading?: boolean;
  onPayInvoice?: (invoiceId: string, paymentData: PaymentData) => Promise<void>;
  onPayAll?: (invoiceIds: string[], paymentData: PaymentData) => Promise<void>;
}

export function FinancialSummary({
  invoices = [],
  creditBalance = 0,
  isLoading,
  onPayInvoice,
  onPayAll,
}: FinancialSummaryProps) {
  const [showHistory, setShowHistory] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-xl">
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-vet-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  const pendingInvoices = safeInvoices.filter(
    (inv) =>
      inv.paymentStatus === "Pendiente" || inv.paymentStatus === "Parcial"
  );

  const paidInvoices = safeInvoices.filter(
    (inv) => inv.paymentStatus === "Pagado"
  );

  const totalConsumedUSD = safeInvoices.reduce((sum, inv) => {
    if (inv.currency === "Bs" && inv.exchangeRate) {
      return sum + inv.total / inv.exchangeRate;
    }
    return sum + inv.total;
  }, 0);

  const totalPaidUSD = safeInvoices.reduce((sum, inv) => {
    return sum + (inv.amountPaid || 0);
  }, 0);

  const totalDebtUSD = totalConsumedUSD - totalPaidUSD;

  const lastPaymentDate = (() => {
    const dates = paidInvoices
      .filter((inv) => inv.updatedAt || inv.date)
      .map((inv) => new Date(inv.updatedAt || inv.date))
      .sort((a, b) => b.getTime() - a.getTime());
    return dates[0] || null;
  })();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
            <DollarSign className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">
              Resumen Financiero
            </h3>
            <p className="text-sm text-slate-400">
              Estado de cuentas del propietario
            </p>
          </div>
        </div>

        {/* Crédito a favor */}
        {creditBalance > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <Wallet className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-300">
                  Crédito a favor
                </p>
                <p className="text-xs text-blue-400/70">
                  Disponible para próximas compras
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-400">
                  ${creditBalance.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Grid de estadísticas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Consumido */}
          <div className="text-center p-4 bg-slate-800/60 rounded-xl border border-white/10 hover:border-vet-accent/30 transition-all duration-300">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-vet-accent" />
              <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">
                Consumido
              </p>
            </div>
            <p className="text-xl font-bold text-white">
              ${totalConsumedUSD.toFixed(2)}
            </p>
          </div>

          {/* Pagado */}
          <div className="text-center p-4 bg-slate-800/60 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <p className="text-[10px] text-emerald-400 uppercase tracking-wide font-semibold">
                Pagado
              </p>
            </div>
            <p className="text-xl font-bold text-emerald-400">
              ${totalPaidUSD.toFixed(2)}
            </p>
          </div>

          {/* Pendiente */}
          <div
            className={`text-center p-4 rounded-xl border transition-all duration-300 ${
              totalDebtUSD > 0 
                ? "bg-gradient-to-br from-red-500/10 to-amber-500/10 border-amber-500/30 hover:border-amber-500/50" 
                : "bg-slate-800/60 border-white/10"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 mb-2">
              {totalDebtUSD > 0 ? (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-slate-500" />
              )}
              <p
                className={`text-[10px] uppercase tracking-wide font-semibold ${
                  totalDebtUSD > 0 ? "text-amber-400" : "text-slate-500"
                }`}
              >
                Pendiente
              </p>
            </div>
            <p
              className={`text-xl font-bold ${
                totalDebtUSD > 0 ? "text-amber-400" : "text-slate-500"
              }`}
            >
              ${Math.max(0, totalDebtUSD).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Estadísticas de facturas */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-400">
              {safeInvoices.length} factura
              {safeInvoices.length !== 1 ? "s" : ""}
            </span>
            {pendingInvoices.length > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                {pendingInvoices.length} pendiente
                {pendingInvoices.length !== 1 ? "s" : ""}
              </span>
            )}
            {paidInvoices.length > 0 && (
              <span className="text-emerald-400">
                {paidInvoices.length} pagada
                {paidInvoices.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {lastPaymentDate && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-xs">
                Último pago: {formatDate(lastPaymentDate)}
              </span>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 mt-6">
          {/* Ver Historial */}
          <button
            onClick={() => setShowHistory(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800/60 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-all duration-300"
          >
            <FileText className="w-4 h-4" />
            Ver Historial
          </button>

          {/* Botón Pagar o Estado sin deudas */}
          {totalDebtUSD > 0 && (onPayInvoice || onPayAll) ? (
            <button
              onClick={() => setShowHistory(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/25"
            >
              <CreditCard className="w-4 h-4" />
              Pagar
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              Sin deudas
            </div>
          )}
        </div>
      </div>

      {/* Modal de historial */}
      <OwnerInvoiceHistory
        invoices={safeInvoices}
        creditBalance={creditBalance}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onPayInvoice={onPayInvoice}
        onPayAll={onPayAll}
      />
    </>
  );
}
