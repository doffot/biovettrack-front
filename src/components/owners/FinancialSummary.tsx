// src/components/owners/FinancialSummary.tsx
import { useState } from "react";
import {
  DollarSign,
  CheckCircle2,
  CreditCard,
  Calendar,
  FileText,
  Wallet,
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
  console.log("FinancialSummary creditBalance:", creditBalance);
  const [showHistory, setShowHistory] = useState(false);

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
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              Resumen Financiero
            </h3>
            <p className="text-sm text-gray-500">
              Estado de cuentas del propietario
            </p>
          </div>
        </div>

        {creditBalance > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">
                  Crédito a favor
                </p>
                <p className="text-xs text-blue-600">
                  Disponible para próximas compras
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-700">
                  ${creditBalance.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Consumido
            </p>
            <p className="text-xl font-bold text-gray-900">
              ${totalConsumedUSD.toFixed(2)}
            </p>
          </div>

          <div className="text-center p-3 bg-emerald-50 rounded-xl">
            <p className="text-xs text-emerald-600 uppercase tracking-wide mb-1">
              Pagado
            </p>
            <p className="text-xl font-bold text-emerald-700">
              ${totalPaidUSD.toFixed(2)}
            </p>
          </div>

          <div
            className={`text-center p-3 rounded-xl ${
              totalDebtUSD > 0 ? "bg-red-50" : "bg-gray-50"
            }`}
          >
            <p
              className={`text-xs uppercase tracking-wide mb-1 ${
                totalDebtUSD > 0 ? "text-red-600" : "text-gray-500"
              }`}
            >
              Pendiente
            </p>
            <p
              className={`text-xl font-bold ${
                totalDebtUSD > 0 ? "text-red-600" : "text-gray-400"
              }`}
            >
              ${Math.max(0, totalDebtUSD).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">
              {safeInvoices.length} factura
              {safeInvoices.length !== 1 ? "s" : ""}
            </span>
            {pendingInvoices.length > 0 && (
              <span className="text-red-500 font-medium">
                {pendingInvoices.length} pendiente
                {pendingInvoices.length !== 1 ? "s" : ""}
              </span>
            )}
            {paidInvoices.length > 0 && (
              <span className="text-emerald-600">
                {paidInvoices.length} pagada
                {paidInvoices.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {lastPaymentDate && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-xs">
                Último pago: {formatDate(lastPaymentDate)}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowHistory(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
          >
            <FileText className="w-4 h-4" />
            Ver Historial
          </button>

          {totalDebtUSD > 0 && (onPayInvoice || onPayAll) && (
            <button
              onClick={() => setShowHistory(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Pagar
            </button>
          )}

          {totalDebtUSD <= 0 && (
            <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              Sin deudas
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
