// src/views/invoices/components/ReportInvoicesTable.tsx
import { Link } from "react-router-dom";
import { FileText, Eye, Scissors, Stethoscope, Syringe, FlaskConical, Package } from "lucide-react";
import type { Invoice, InvoiceStatus } from "../../types/invoice";
import { formatCurrency, formatDate, getItemTypeLabel, getPaymentType } from "../../utils/reportUtils";

interface ReportInvoicesTableProps {
  invoices: Invoice[];
}

const getIcon = (type: string): React.ElementType => {
  const icons: Record<string, React.ElementType> = {
    grooming: Scissors,
    consulta: Stethoscope,
    vacuna: Syringe,
    labExam: FlaskConical,
    producto: Package,
  };
  return icons[type] || FileText;
};

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const config: Record<InvoiceStatus, { bg: string; text: string; dot: string }> = {
    Pagado: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    Pendiente: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    Parcial: { bg: "bg-vet-light", text: "text-vet-primary", dot: "bg-vet-primary" },
    Cancelado: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
  };
  const { bg, text, dot } = config[status] || config.Pendiente;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

function PaymentBadge({ type }: { type: "usd" | "bs" | "mixed" | "none" }) {
  const config = {
    usd: { bg: "bg-emerald-50", text: "text-emerald-700", label: "USD" },
    bs: { bg: "bg-vet-light", text: "text-vet-primary", label: "Bs" },
    mixed: { bg: "bg-purple-50", text: "text-purple-700", label: "Mixto" },
    none: { bg: "bg-vet-light/50", text: "text-vet-muted", label: "—" },
  };
  const { bg, text, label } = config[type];

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${bg} ${text}`}>
      {label}
    </span>
  );
}

export function ReportInvoicesTable({ invoices }: ReportInvoicesTableProps) {
  return (
    <div className="bg-white rounded-2xl border-2 border-vet-light overflow-hidden shadow-soft">
      <div className="px-5 py-4 border-b border-vet-light bg-vet-light/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-vet-primary" />
          <h3 className="text-sm font-bold text-vet-text">Facturas</h3>
        </div>
        <span className="text-xs text-vet-muted font-medium">{invoices.length} resultados</span>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-vet-light flex items-center justify-center">
            <FileText className="w-8 h-8 text-vet-muted" />
          </div>
          <p className="text-vet-text font-semibold">No hay facturas</p>
          <p className="text-vet-muted text-sm mt-1">Ajusta los filtros para ver resultados</p>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-vet-light/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-vet-muted uppercase tracking-wide">
                  Fecha
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-vet-muted uppercase tracking-wide">
                  Cliente
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-vet-muted uppercase tracking-wide hidden md:table-cell">
                  Servicios
                </th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-vet-muted uppercase tracking-wide">
                  Estado
                </th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-vet-muted uppercase tracking-wide hidden sm:table-cell">
                  Pago
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-vet-muted uppercase tracking-wide">
                  Total
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-vet-muted uppercase tracking-wide hidden lg:table-cell">
                  USD
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-vet-muted uppercase tracking-wide hidden lg:table-cell">
                  Bs
                </th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vet-light">
              {invoices.slice(0, 50).map((invoice) => {
                const ownerName =
                  invoice.ownerName ||
                  (typeof invoice.ownerId === "object" ? invoice.ownerId?.name : "") ||
                  "—";
                const paidUSD = invoice.amountPaidUSD || 0;
                const paidBs = invoice.amountPaidBs || 0;
                const paymentType = getPaymentType(invoice);

                return (
                  <tr key={invoice._id} className="hover:bg-vet-light/30 transition-colors">
                    <td className="px-5 py-4 text-sm text-vet-muted">{formatDate(invoice.date)}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-vet-text truncate max-w-[150px]">
                        {ownerName}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        {invoice.items?.slice(0, 2).map((item, i) => {
                          const Icon = getIcon(item.type);
                          return (
                            <div 
                              key={i} 
                              className="p-1.5 rounded-lg bg-vet-light"
                              title={getItemTypeLabel(item.type)}
                            >
                              <Icon className="w-3.5 h-3.5 text-vet-primary" />
                            </div>
                          );
                        })}
                        {(invoice.items?.length || 0) > 2 && (
                          <span className="text-xs text-vet-muted font-medium">
                            +{(invoice.items?.length || 0) - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <StatusBadge status={invoice.paymentStatus} />
                    </td>
                    <td className="px-5 py-4 text-center hidden sm:table-cell">
                      <PaymentBadge type={paymentType} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-bold text-vet-text">
                        {formatCurrency(invoice.total || 0, invoice.currency)}
                      </span>
                    </td>
                    <td className={`px-5 py-4 text-right hidden lg:table-cell text-sm font-semibold ${
                      paidUSD > 0 ? "text-emerald-600" : "text-vet-muted/40"
                    }`}>
                      {paidUSD > 0 ? formatCurrency(paidUSD, "USD") : "—"}
                    </td>
                    <td className={`px-5 py-4 text-right hidden lg:table-cell text-sm font-semibold ${
                      paidBs > 0 ? "text-vet-primary" : "text-vet-muted/40"
                    }`}>
                      {paidBs > 0 ? formatCurrency(paidBs, "Bs") : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        to={`/invoices/${invoice._id}`}
                        className="p-2 rounded-xl hover:bg-vet-light text-vet-muted hover:text-vet-primary transition-colors inline-flex"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {invoices.length > 50 && (
            <div className="px-5 py-4 bg-vet-light/30 text-center text-sm text-vet-muted border-t border-vet-light">
              Mostrando <span className="font-semibold text-vet-primary">50</span> de <span className="font-semibold text-vet-primary">{invoices.length}</span> facturas
            </div>
          )}
        </div>
      )}
    </div>
  );
}