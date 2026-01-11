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

  // Reset page on filter change
  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto border-3 border-vet-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-vet-muted text-sm">Cargando compras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-vet-text">Historial de Compras</h1>
          <p className="text-sm text-vet-muted">
            {purchases.length} compra{purchases.length !== 1 ? "s" : ""} registradas
          </p>
        </div>
        <Link
          to="/purchases/create"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-vet-primary hover:bg-vet-secondary text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Nueva Compra
        </Link>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted" />
          <input
            type="text"
            placeholder="Buscar por proveedor o producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-vet-muted" />
            </button>
          )}
        </div>

        {/* Filtro por estado */}
        <div className="flex gap-2">
          <button
            onClick={() => handleFilterChange("all")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-vet-primary text-white"
                : "bg-white text-vet-text border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => handleFilterChange("completada")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "completada"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-white text-vet-text border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Completadas
          </button>
          <button
            onClick={() => handleFilterChange("pendiente")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "pendiente"
                ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                : "bg-white text-vet-text border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Pendientes
          </button>
        </div>
      </div>

      {/* Lista de compras */}
      {paginatedPurchases.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compra</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedPurchases.map((purchase) => (
                  <tr key={purchase._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-vet-light rounded-lg">
                          <FileText className="w-4 h-4 text-vet-primary" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-vet-text">
                            Compra #{purchase._id.substring(0, 8)}
                          </div>
                          <div className="text-xs text-vet-muted">
                            {purchase.items.length} producto{purchase.items.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-vet-text">
                      {purchase.provider || "--"}
                    </td>
                    <td className="px-6 py-4 text-sm text-vet-muted">
                      <div className="max-w-xs truncate">
                        {purchase.items.map((item, idx) => (
                          <span key={idx}>
                            {item.productName} ({item.quantity})
                            {idx < purchase.items.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-vet-text">
                      ${purchase.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-vet-light text-vet-primary capitalize">
                        {purchase.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-vet-muted">
                      {format(new Date(purchase.createdAt), "dd MMM yyyy", { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        purchase.status === "completada" 
                          ? "bg-green-100 text-green-800" 
                          : purchase.status === "pendiente"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
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

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <p className="text-sm text-vet-muted">
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-vet-text mb-1">
            {searchTerm || statusFilter !== "all" ? "Sin resultados" : "Sin compras"}
          </h3>
          <p className="text-sm text-vet-muted mb-4">
            {searchTerm || statusFilter !== "all"
              ? "No hay compras con esos criterios"
              : "Registra tu primera compra"}
          </p>
          <Link
            to="/purchases/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-vet-primary text-white text-sm font-medium rounded-lg hover:bg-vet-secondary transition-colors"
          >
            <Plus className="w-4 h-4" />
            Registrar Compra
          </Link>
        </div>
      )}
    </div>
  );
}