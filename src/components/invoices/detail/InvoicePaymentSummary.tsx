// src/components/invoices/detail/InvoicePaymentSummary.tsx
import type { Invoice } from "../../../types/invoice";
import { formatCurrency } from "../../../utils/reportUtils";

interface InvoicePaymentSummaryProps {
  invoice: Invoice;
}

export function InvoicePaymentSummary({ invoice }: InvoicePaymentSummaryProps) {
  const paidUSD = invoice.amountPaidUSD || 0;
  const paidBs = invoice.amountPaidBs || 0;
  const total = invoice.total || 0;
  const exchangeRate = invoice.exchangeRate || 1;

  // Calcular lo pagado en USD equivalente
  const paidBsInUSD = paidBs / exchangeRate;
  const totalPaidUSD = paidUSD + paidBsInUSD;
  const remaining = Math.max(0, total - totalPaidUSD);

  const isPaid = invoice.paymentStatus === "Pagado";
  const isCanceled = invoice.paymentStatus === "Cancelado";

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Resumen de Pago
      </h3>

      <div className="space-y-3">
        {/* Total factura */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total factura</span>
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(total, invoice.currency)}
          </span>
        </div>

        {/* Pagado USD */}
        {paidUSD > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Pagado en USD</span>
            <span className="text-sm font-medium text-emerald-600">
              {formatCurrency(paidUSD, "USD")}
            </span>
          </div>
        )}

        {/* Pagado Bs */}
        {paidBs > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Pagado en Bs</span>
            <span className="text-sm font-medium text-[#0A7EA4]">
              {formatCurrency(paidBs, "Bs")}
            </span>
          </div>
        )}

        {/* Tasa de cambio si pagó en Bs */}
        {paidBs > 0 && (
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Tasa aplicada</span>
            <span>Bs. {exchangeRate.toFixed(2)} / USD</span>
          </div>
        )}

        {/* Separador */}
        <div className="border-t border-gray-200 pt-3">
          {/* Pendiente o Pagado */}
          {isCanceled ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600">Estado</span>
              <span className="text-sm font-bold text-gray-500">Cancelado</span>
            </div>
          ) : isPaid ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Estado</span>
              <span className="text-sm font-bold text-emerald-600">Pagado ✓</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Pendiente</span>
              <span className="text-lg font-bold text-red-600">
                {formatCurrency(remaining, invoice.currency)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}