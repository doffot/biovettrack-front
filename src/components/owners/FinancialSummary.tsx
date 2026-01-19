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
      <div className="bg-[var(--color-card)] backdrop-blur-sm rounded-2xl p-6 border border-[var(--color-border)] shadow-xl">
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
      <div className="bg-[var(--color-card)] backdrop-blur-sm rounded-2xl p-6 border border-[var(--color-border)] shadow-[var(--shadow-card)] transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-border)]">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <DollarSign className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[var(--color-text)]">
              Resumen Financiero
            </h3>
            <p className="text-sm text-[var(--color-muted)]">
              Estado de cuentas del propietario
            </p>
          </div>
        </div>

        {/* Crédito a favor */}
        {creditBalance > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/5 rounded-xl border border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Wallet className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  Crédito a favor
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  Disponible para próximas compras
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${creditBalance.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Grid de estadísticas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Consumido */}
          <div className="text-center p-4 bg-[var(--color-background)] rounded-xl border border-[var(--color-border)] hover:border-vet-accent/30 transition-all duration-300">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-vet-accent" />
              <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wide font-bold">
                Consumido
              </p>
            </div>
            <p className="text-xl font-bold text-[var(--color-text)]">
              ${totalConsumedUSD.toFixed(2)}
            </p>
          </div>

          {/* Pagado */}
          <div className="text-center p-4 bg-[var(--color-background)] rounded-xl border border-[var(--color-border)] hover:border-emerald-500/40 transition-all duration-300">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-[10px] text-emerald-500 uppercase tracking-wide font-bold">
                Pagado
              </p>
            </div>
            <p className="text-xl font-bold text-emerald-500">
              ${totalPaidUSD.toFixed(2)}
            </p>
          </div>

          {/* Pendiente */}
          <div
            className={`text-center p-4 rounded-xl border transition-all duration-300 ${
              totalDebtUSD > 0 
                ? "bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50" 
                : "bg-[var(--color-background)] border-[var(--color-border)]"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 mb-2">
              {totalDebtUSD > 0 ? (
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-[var(--color-muted)]" />
              )}
              <p
                className={`text-[10px] uppercase tracking-wide font-bold ${
                  totalDebtUSD > 0 ? "text-amber-500" : "text-[var(--color-muted)]"
                }`}
              >
                Pendiente
              </p>
            </div>
            <p
              className={`text-xl font-bold ${
                totalDebtUSD > 0 ? "text-amber-500" : "text-[var(--color-muted)]"
              }`}
            >
              ${Math.max(0, totalDebtUSD).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Estadísticas de facturas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-[var(--color-muted)] font-medium">
              {safeInvoices.length} factura{safeInvoices.length !== 1 ? "s" : ""}
            </span>
            {pendingInvoices.length > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                {pendingInvoices.length} pendiente{pendingInvoices.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {lastPaymentDate && (
            <div className="flex items-center gap-1.5 text-[var(--color-muted)]">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">
                Último pago: {formatDate(lastPaymentDate)}
              </span>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowHistory(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-background)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text)] text-sm font-bold rounded-xl transition-all duration-300"
          >
            <FileText className="w-4 h-4 text-vet-accent" />
            Historial
          </button>

          {totalDebtUSD > 0 && (onPayInvoice || onPayAll) ? (
            <button
              onClick={() => setShowHistory(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-vet-primary hover:bg-vet-secondary text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-lg shadow-vet-primary/20"
            >
              <CreditCard className="w-4 h-4" />
              Pagar
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              Al día
            </div>
          )}
        </div>
      </div>

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