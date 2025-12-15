// src/views/invoices/utils/reportPrint.ts
import type { Invoice } from "../types/invoice";
import type { ReportStats, FilterState } from "../types/reportTypes";
import { formatCurrency, formatDate, getFilterDates, getItemTypeLabel, getPeriodLabel } from "../utils/reportUtils";

interface PrintOptions {
  invoices: Invoice[];
  stats: ReportStats;
  filters: FilterState;
  vetName: string;
}

export const printReport = ({ invoices, stats, filters, vetName }: PrintOptions): void => {
  const { startDate, endDate } = getFilterDates(filters);
  const periodLabel = getPeriodLabel(filters.dateRange);
  
  const printWindow = window.open("", "", "height=900,width=1100");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reporte de Facturación</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #1f2937; font-size: 12px; }
        .header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #e5e7eb; }
        .header h1 { font-size: 20px; font-weight: 700; color: #111827; }
        .header p { color: #6b7280; margin-top: 4px; }
        .period { display: inline-block; margin-top: 8px; padding: 6px 16px; background: #f3f4f6; border-radius: 16px; font-weight: 500; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        .stat-card { padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center; }
        .stat-card .label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-card .value { font-size: 20px; font-weight: 700; color: #111827; margin-top: 4px; }
        .stat-card.green .value { color: #059669; }
        .stat-card.blue .value { color: #2563eb; }
        .stat-card.amber .value { color: #d97706; }
        .income-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .income-card { padding: 16px; border-radius: 8px; text-align: center; }
        .income-card.green { background: #ecfdf5; border: 1px solid #a7f3d0; }
        .income-card.blue { background: #eff6ff; border: 1px solid #bfdbfe; }
        .income-card.amber { background: #fffbeb; border: 1px solid #fde68a; }
        .income-card .title { font-size: 10px; color: #6b7280; text-transform: uppercase; margin-bottom: 8px; }
        .income-card .amount { font-size: 18px; font-weight: 700; }
        .income-card.green .amount { color: #059669; }
        .income-card.blue .amount { color: #2563eb; }
        .income-card.amber .amount { color: #d97706; }
        .section-title { font-size: 13px; font-weight: 600; color: #374151; margin: 20px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #f9fafb; padding: 10px 8px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; }
        td { padding: 10px 8px; border-bottom: 1px solid #f3f4f6; }
        tr:hover { background: #f9fafb; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-medium { font-weight: 500; }
        .text-green { color: #059669; }
        .text-blue { color: #2563eb; }
        .text-amber { color: #d97706; }
        .text-gray { color: #9ca3af; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 500; }
        .badge-green { background: #d1fae5; color: #065f46; }
        .badge-amber { background: #fef3c7; color: #92400e; }
        .badge-blue { background: #dbeafe; color: #1e40af; }
        .badge-gray { background: #f3f4f6; color: #4b5563; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 11px; }
        @media print { body { padding: 12px; } @page { margin: 1cm; size: A4 landscape; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Reporte de Facturación</h1>
        <p>Resumen de ingresos del período</p>
        <div class="period">${periodLabel} • ${startDate.toLocaleDateString("es-ES")} - ${endDate.toLocaleDateString("es-ES")}</div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="label">Facturas</div>
          <div class="value">${stats.totalInvoices}</div>
        </div>
        <div class="stat-card green">
          <div class="label">Pagadas</div>
          <div class="value">${stats.paidCount}</div>
        </div>
        <div class="stat-card amber">
          <div class="label">Pendientes</div>
          <div class="value">${stats.pendingCount}</div>
        </div>
        <div class="stat-card blue">
          <div class="label">Parciales</div>
          <div class="value">${stats.partialCount}</div>
        </div>
      </div>

      <div class="income-grid">
        <div class="income-card green">
          <div class="title">Cobrado USD</div>
          <div class="amount">${formatCurrency(stats.totalCobradoUSD, "USD")}</div>
        </div>
        <div class="income-card blue">
          <div class="title">Cobrado Bs</div>
          <div class="amount">${formatCurrency(stats.totalCobradoBs, "Bs")}</div>
        </div>
        <div class="income-card amber">
          <div class="title">Pendiente</div>
          <div class="amount">${formatCurrency(stats.totalPendienteUSD, "USD")}</div>
        </div>
      </div>

      ${Object.keys(stats.byPaymentMethod).length > 0 ? `
        <div class="section-title">Por Método de Pago</div>
        <table>
          <thead>
            <tr>
              <th>Método</th>
              <th class="text-center">Cantidad</th>
              <th class="text-right">USD</th>
              <th class="text-right">Bs</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(stats.byPaymentMethod).map(([method, data]) => `
              <tr>
                <td class="font-medium">${method}</td>
                <td class="text-center">${data.count}</td>
                <td class="text-right ${data.totalUSD > 0 ? 'text-green' : 'text-gray'}">${data.totalUSD > 0 ? formatCurrency(data.totalUSD, "USD") : "—"}</td>
                <td class="text-right ${data.totalBs > 0 ? 'text-blue' : 'text-gray'}">${data.totalBs > 0 ? formatCurrency(data.totalBs, "Bs") : "—"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      ` : ""}

      <div class="section-title">Detalle de Facturas (${invoices.length})</div>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Servicios</th>
            <th class="text-center">Estado</th>
            <th class="text-right">Total</th>
            <th class="text-right">USD</th>
            <th class="text-right">Bs</th>
          </tr>
        </thead>
        <tbody>
          ${invoices.slice(0, 100).map((inv) => {
            const owner = inv.ownerName || (typeof inv.ownerId === "object" ? inv.ownerId?.name : "") || "—";
            const paidUSD = inv.amountPaidUSD || 0;
            const paidBs = inv.amountPaidBs || 0;
            const statusClass = inv.paymentStatus === "Pagado" ? "badge-green" : inv.paymentStatus === "Pendiente" ? "badge-amber" : inv.paymentStatus === "Parcial" ? "badge-blue" : "badge-gray";
            return `
              <tr>
                <td>${formatDate(inv.date)}</td>
                <td class="font-medium">${owner}</td>
                <td>${inv.items?.map(i => getItemTypeLabel(i.type)).join(", ") || "—"}</td>
                <td class="text-center"><span class="badge ${statusClass}">${inv.paymentStatus}</span></td>
                <td class="text-right font-medium">${formatCurrency(inv.total || 0, inv.currency)}</td>
                <td class="text-right ${paidUSD > 0 ? 'text-green' : 'text-gray'}">${paidUSD > 0 ? formatCurrency(paidUSD, "USD") : "—"}</td>
                <td class="text-right ${paidBs > 0 ? 'text-blue' : 'text-gray'}">${paidBs > 0 ? formatCurrency(paidBs, "Bs") : "—"}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>

      <div class="footer">
        <p><strong>${vetName}</strong></p>
        <p>Generado el ${new Date().toLocaleString("es-ES")}</p>
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.onload = () => setTimeout(() => printWindow.print(), 200);
};