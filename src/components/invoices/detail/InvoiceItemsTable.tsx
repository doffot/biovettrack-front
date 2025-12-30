// src/components/invoices/detail/InvoiceItemsTable.tsx
import type { InvoiceItem } from "../../../types/invoice";
import { getItemTypeLabel, formatCurrency } from "../../../utils/reportUtils";

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  currency: "USD" | "Bs";
}

export function InvoiceItemsTable({ items, currency }: InvoiceItemsTableProps) {
  const total = items.reduce((sum, item) => sum + item.cost * item.quantity, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">Detalle</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Servicio
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cant.
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr 
                key={`${item.resourceId}-${index}`} 
                className="border-b border-gray-50"
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getItemTypeLabel(item.type)}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm text-gray-700">{item.quantity}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm text-gray-700">
                    {formatCurrency(item.cost, currency)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.cost * item.quantity, currency)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan={3} className="px-4 py-3 text-right">
                <span className="text-sm font-semibold text-gray-900">Total</span>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="text-base font-bold text-[#0A7EA4]">
                  {formatCurrency(total, currency)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}