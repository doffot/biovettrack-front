// src/components/dashboard/PendingInvoicesModal.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  CreditCard,
  Search,
  ChevronRight,
  PawPrint,
} from "lucide-react";
import type { Invoice } from "../../types/invoice";
import { getOwnerName, getPatientName, getOwnerId } from "../../types/invoice";

interface PendingInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
}

export function PendingInvoicesModal({
  isOpen,
  onClose,
  invoices,
}: PendingInvoicesModalProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "Pendiente" | "Parcial">("all");

  if (!isOpen) return null;

  // Filtrar facturas
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      getOwnerName(invoice).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getPatientName(invoice).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || invoice.paymentStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Calcular totales
  const totalPendingUSD = filteredInvoices.reduce((acc, inv) => {
    if (inv.currency === "USD") {
      return acc + (inv.total - (inv.amountPaid || 0));
    }
    return acc;
  }, 0);

  const totalPendingBs = filteredInvoices.reduce((acc, inv) => {
    if (inv.currency === "Bs") {
      return acc + (inv.total - (inv.amountPaid || 0));
    }
    return acc;
  }, 0);

  const handleGoToOwner = (invoice: Invoice) => {
    const ownerId = getOwnerId(invoice);
    if (ownerId) {
      onClose();
      navigate(`/owners/${ownerId}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: "USD" | "Bs") => {
    if (currency === "USD") {
      return `$${amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;
    }
    return `Bs ${amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-vet-text/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-card animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-vet-light">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl">
                <CreditCard className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-vet-text">
                  Facturas por Cobrar
                </h2>
                <p className="text-sm text-vet-muted">
                  {filteredInvoices.length} {filteredInvoices.length === 1 ? "factura pendiente" : "facturas pendientes"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-vet-light rounded-lg transition-colors group"
            >
              <X className="h-5 w-5 text-vet-muted group-hover:text-vet-text transition-colors" />
            </button>
          </div>

          {/* Resumen de totales */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-gradient-to-r from-vet-light/50 to-white border-b border-vet-light">
            <div className="bg-white rounded-xl p-3 border border-vet-light shadow-soft">
              <p className="text-xs text-vet-muted font-medium">Total pendiente USD</p>
              <p className="text-xl font-bold text-orange-500">
                ${totalPendingUSD.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-vet-light shadow-soft">
              <p className="text-xs text-vet-muted font-medium">Total pendiente Bs</p>
              <p className="text-xl font-bold text-orange-500">
                Bs {totalPendingBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="p-4 border-b border-vet-light flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-vet-muted" />
              <input
                type="text"
                placeholder="Buscar por cliente o paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-vet-light/50 border border-vet-light rounded-xl text-vet-text placeholder:text-vet-muted focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-4 py-2.5 bg-vet-light/50 border border-vet-light rounded-xl text-vet-text focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all cursor-pointer"
            >
              <option value="all">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Parcial">Parcial</option>
            </select>
          </div>

          {/* Lista de facturas */}
          <div className="max-h-80 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-vet-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-vet-muted" />
                </div>
                <p className="text-vet-muted font-medium">No se encontraron facturas</p>
                <p className="text-sm text-vet-muted/70 mt-1">
                  Intenta con otros términos de búsqueda
                </p>
              </div>
            ) : (
              filteredInvoices.map((invoice) => {
                const remaining = invoice.total - (invoice.amountPaid || 0);
                const isParcial = invoice.paymentStatus === "Parcial";
                const ownerId = getOwnerId(invoice);

                return (
                  <div
                    key={invoice._id}
                    onClick={() => ownerId && handleGoToOwner(invoice)}
                    className={`
                      bg-white border border-vet-light rounded-xl p-4 
                      transition-all duration-200 group
                      ${ownerId 
                        ? "cursor-pointer hover:border-vet-primary hover:shadow-card" 
                        : "opacity-75"
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Cliente y paciente */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1.5 text-vet-text font-semibold">
                            <User className="h-4 w-4 text-vet-primary" />
                            <span className="truncate">{getOwnerName(invoice)}</span>
                          </div>
                          <span className="text-vet-muted">•</span>
                          <div className="flex items-center gap-1 text-vet-muted">
                            <PawPrint className="h-3.5 w-3.5" />
                            <span className="truncate">{getPatientName(invoice)}</span>
                          </div>
                        </div>

                        {/* Fecha y estado */}
                        <div className="flex items-center gap-3 text-sm mb-2">
                          <span className="flex items-center gap-1 text-vet-muted">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(invoice.date)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              isParcial
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {invoice.paymentStatus}
                          </span>
                        </div>

                        {/* Montos */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                          <span className="text-vet-muted">
                            Total: <span className="font-medium text-vet-text">{formatCurrency(invoice.total, invoice.currency)}</span>
                          </span>
                          {isParcial && (
                            <span className="text-green-600">
                              Pagado: <span className="font-medium">{formatCurrency(invoice.amountPaid || 0, invoice.currency)}</span>
                            </span>
                          )}
                          <span className="text-orange-600 font-semibold">
                            <DollarSign className="h-3.5 w-3.5 inline" />
                            Pendiente: {formatCurrency(remaining, invoice.currency)}
                          </span>
                        </div>
                      </div>

                      {/* Flecha indicadora */}
                      {ownerId && (
                        <div className="ml-3 flex items-center">
                          <div className="p-2 rounded-lg bg-vet-light group-hover:bg-vet-primary transition-colors">
                            <ChevronRight className="h-5 w-5 text-vet-muted group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-vet-light bg-gradient-to-r from-vet-light/30 to-white rounded-b-2xl">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-vet-light text-vet-text font-medium rounded-xl hover:bg-vet-primary hover:text-white transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}