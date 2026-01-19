// src/views/purchases/PurchaseListView.tsx
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ShoppingCart, 
  Search, 
  X, 
  Plus, 
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getAllPurchases } from "../../api/purchaseAPI";

const ITEMS_PER_PAGE = 10;

export default function PurchaseListView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["purchases"],
    queryFn: getAllPurchases,
  });

  // Filtros
  const filteredPurchases = useMemo(() => {
    return purchases.filter(purchase => {
      const matchesSearch = 
        purchase.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.items.some(item => 
          item.productName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesStatus = 
        statusFilter === "all" || purchase.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [purchases, searchTerm, statusFilter]);

  // Paginación
  const totalPages = Math.ceil(filteredPurchases.length / ITEMS_PER_PAGE);
  const paginatedPurchases = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPurchases.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPurchases, currentPage]);

  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-3">
            <div className="absolute inset-0 border-3 border-[var(--color-border)] rounded-full"></div>
            <div className="absolute inset-0 border-3 border-[var(--color-vet-primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[var(--color-vet-muted)] text-sm">Cargando compras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-vet-text)]">Historial de Compras</h1>
          <p className="text-sm text-[var(--color-vet-muted)]">
            {purchases.length} compra{purchases.length !== 1 ? "s" : ""} registradas
          </p>
        </div>
        <Link
          to="/purchases/create"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-white text-sm font-medium rounded-lg transition-all"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Nueva Compra
        </Link>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-vet-muted)]" />
          <input
            type="text"
            placeholder="Buscar por proveedor o producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-[var(--color-hover)] rounded transition-colors"
            >
              <X className="w-4 h-4 text-[var(--color-vet-muted)]" />
            </button>
          )}
        </div>

        {/* Filtro por estado */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => handleFilterChange("all")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-[var(--color-vet-primary)] text-white shadow-md"
                : "bg-[var(--color-card)] text-[var(--color-vet-text)] border border-[var(--color-border)] hover:bg-[var(--color-hover)]"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => handleFilterChange("completada")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              statusFilter === "completada"
                ? "bg-green-600 dark:bg-green-600/30 text-white dark:text-green-400 border border-green-600 dark:border-green-600/50"
                : "bg-[var(--color-card)] text-[var(--color-vet-text)] border border-[var(--color-border)] hover:bg-[var(--color-hover)]"
            }`}
          >
            Completadas
          </button>
          <button
            onClick={() => handleFilterChange("pendiente")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              statusFilter === "pendiente"
                ? "bg-yellow-600 dark:bg-yellow-600/30 text-white dark:text-yellow-400 border border-yellow-600 dark:border-yellow-600/50"
                : "bg-[var(--color-card)] text-[var(--color-vet-text)] border border-[var(--color-border)] hover:bg-[var(--color-hover)]"
            }`}
          >
            Pendientes
          </button>
        </div>
      </div>

      {/* Lista de compras */}
      {paginatedPurchases.length > 0 ? (
        <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--color-border)]">
              <thead className="bg-[var(--color-hover)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">Compra</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">Proveedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">Productos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">Método</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--color-card)] divide-y divide-[var(--color-border)]">
                {paginatedPurchases.map((purchase) => (
                  <tr key={purchase._id} className="hover:bg-[var(--color-hover)] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-[var(--color-vet-primary)]/10 rounded-lg">
                          <FileText className="w-4 h-4 text-[var(--color-vet-primary)]" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-[var(--color-vet-text)]">
                            Compra #{purchase._id.substring(0, 8)}
                          </div>
                          <div className="text-xs text-[var(--color-vet-muted)]">
                            {purchase.items.length} producto{purchase.items.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-vet-text)]">
                      {purchase.provider || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-vet-muted)]">
                      <div className="max-w-xs truncate">
                        {purchase.items.map((item, idx) => (
                          <span key={idx}>
                            {item.productName} ({item.quantity})
                            {idx < purchase.items.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-vet-text)]">
                      ${purchase.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[var(--color-vet-primary)]/20 text-[var(--color-vet-primary)] capitalize">
                        {purchase.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-vet-muted)]">
                      {format(new Date(purchase.createdAt), "dd MMM yyyy", { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        purchase.status === "completada" 
                          ? "bg-green-600/20 dark:bg-green-600/30 text-green-700 dark:text-green-400" 
                          : purchase.status === "pendiente"
                          ? "bg-yellow-600/20 dark:bg-yellow-600/30 text-yellow-700 dark:text-yellow-400"
                          : "bg-red-600/20 dark:bg-red-600/30 text-red-700 dark:text-red-400"
                      }`}>
                        {purchase.status === "completada" 
                          ? "Completada" 
                          : purchase.status === "pendiente"
                          ? "Pendiente"
                          : "Cancelada"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-[var(--color-border)]">
            {paginatedPurchases.map((purchase) => (
              <div key={purchase._id} className="p-4 hover:bg-[var(--color-hover)] transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[var(--color-vet-primary)]/10 rounded-lg">
                      <FileText className="w-4 h-4 text-[var(--color-vet-primary)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-vet-text)]">
                        #{purchase._id.substring(0, 8)}
                      </p>
                      <p className="text-xs text-[var(--color-vet-muted)]">
                        {purchase.provider || "Sin proveedor"}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    purchase.status === "completada" 
                      ? "bg-green-600/20 dark:bg-green-600/30 text-green-700 dark:text-green-400" 
                      : purchase.status === "pendiente"
                      ? "bg-yellow-600/20 dark:bg-yellow-600/30 text-yellow-700 dark:text-yellow-400"
                      : "bg-red-600/20 dark:bg-red-600/30 text-red-700 dark:text-red-400"
                  }`}>
                    {purchase.status === "completada" ? "✓" : purchase.status === "pendiente" ? "⏱" : "✕"}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="text-xs text-[var(--color-vet-muted)]">
                    {purchase.items.length} producto{purchase.items.length !== 1 ? "s" : ""}
                  </div>
                  <div className="text-xs text-[var(--color-vet-muted)] line-clamp-2">
                    {purchase.items.map((item, idx) => (
                      <span key={idx}>
                        {item.productName} ({item.quantity})
                        {idx < purchase.items.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-medium rounded bg-[var(--color-vet-primary)]/20 text-[var(--color-vet-primary)] capitalize">
                      {purchase.paymentMethod}
                    </span>
                    <span className="text-xs text-[var(--color-vet-muted)]">
                      {format(new Date(purchase.createdAt), "dd MMM", { locale: es })}
                    </span>
                  </div>
                  <p className="text-base font-bold text-[var(--color-vet-text)]">
                    ${purchase.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-[var(--color-border)] flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-sm text-[var(--color-vet-muted)]">
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-sm text-[var(--color-vet-text)] hover:bg-[var(--color-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-sm text-[var(--color-vet-text)] hover:bg-[var(--color-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-[var(--color-vet-muted)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--color-vet-text)] mb-1">
            {searchTerm || statusFilter !== "all" ? "Sin resultados" : "Sin compras"}
          </h3>
          <p className="text-sm text-[var(--color-vet-muted)] mb-4">
            {searchTerm || statusFilter !== "all"
              ? "No hay compras con esos criterios"
              : "Registra tu primera compra"}
          </p>
          <Link
            to="/purchases/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] text-white text-sm font-medium rounded-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            Registrar Compra
          </Link>
        </div>
      )}
    </div>
  );
}