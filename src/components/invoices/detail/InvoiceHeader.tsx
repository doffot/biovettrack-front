// src/components/invoices/detail/InvoiceHeader.tsx
import type { Invoice, InvoiceStatus } from "../../../types/invoice";
import { formatDate } from "../../../utils/reportUtils";

interface InvoiceHeaderProps {
  invoice: Invoice;
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const config: Record<InvoiceStatus, { bg: string; label: string }> = {
    Pagado: { bg: "bg-emerald-600", label: "Pagado" },
    Pendiente: { bg: "bg-red-600", label: "Debe" },
    Parcial: { bg: "bg-red-600", label: "Debe" },
    Cancelado: { bg: "bg-gray-500", label: "Cancelado" },
  };

  const { bg, label } = config[status] || config.Pendiente;

  return (
    <span className={`inline-block px-3 py-1.5 text-sm font-semibold text-white rounded-md ${bg}`}>
      {label}
    </span>
  );
}

export function InvoiceHeader({ invoice }: InvoiceHeaderProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Fecha de emisión
          </p>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(invoice.date)}
          </p>
        </div>

        <StatusBadge status={invoice.paymentStatus} />
      </div>
    </div>
  );
}