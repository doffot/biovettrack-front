// src/views/inventory/InventoryMovementsView.tsx
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ClipboardList, 
  Search, 
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getAllProducts } from "../../api/productAPI";
import { getInventory } from "../../api/inventoryAPI";

const ITEMS_PER_PAGE = 15;

export default function InventoryMovementsView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Obtener productos activos
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products", "active"],
    queryFn: getAllProducts,
  });

  const { data: movements = [], isLoading: loadingMovements } = useQuery({
    queryKey: ["inventory", "movements"],
    queryFn: async () => {
      const allMovements: any[] = [];
      
      for (const product of products) {
        if (!product._id) continue;
        try {
          const inventory = await getInventory(product._id);
          if (inventory) {
            allMovements.push({
              _id: `movement-${product._id}`,
              product: inventory.product,
              type: "entrada",
              reason: "stock_inicial",
              quantityUnits: inventory.stockUnits,
              quantityDoses: inventory.stockDoses,
              createdAt: inventory.lastMovement,
              referenceType: null,
              referenceId: null,
              createdBy: { name: "Sistema" }
            });
          }
        } catch (error) {
          // Ignorar productos sin inventario
        }
      }
      
      return allMovements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    enabled: products.length > 0,
  });

  const loading = loadingProducts || loadingMovements;

  // Filtrar por búsqueda
  const filteredMovements = useMemo(() => {
    return movements.filter(movement => {
      const productName = movement.product?.name?.toLowerCase() || "";
      const reason = movement.reason?.toLowerCase() || "";
      const type = movement.type?.toLowerCase() || "";
      return (
        productName.includes(searchTerm.toLowerCase()) ||
        reason.includes(searchTerm.toLowerCase()) ||
        type.includes(searchTerm.toLowerCase())
      );
    });
  }, [movements, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredMovements.length / ITEMS_PER_PAGE);
  const paginatedMovements = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMovements.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMovements, currentPage]);

  const getTypeColor = (type: string) => {
    return type === "entrada" 
      ? "bg-green-600/20 dark:bg-green-600/30 text-green-700 dark:text-green-400 border border-green-600/20" 
      : "bg-red-600/20 dark:bg-red-600/30 text-red-700 dark:text-red-400 border border-red-600/20";
  };

  const getTypeIcon = (type: string) => {
    return type === "entrada" ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-3">
            <div className="absolute inset-0 border-3 border-[var(--color-border)] rounded-full"></div>
            <div className="absolute inset-0 border-3 border-[var(--color-vet-primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[var(--color-vet-muted)] text-sm">Cargando movimientos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-vet-text)]">Historial de Movimientos</h1>
        <p className="text-sm text-[var(--color-vet-muted)]">
          {movements.length} movimiento{movements.length !== 1 ? "s" : ""} registrados
        </p>
      </div>

      {/* Búsqueda */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-vet-muted)]" />
        <input
          type="text"
          placeholder="Buscar por producto, tipo o razón..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] transition-all"
        />
      </div>

      {/* Lista de movimientos */}
      {paginatedMovements.length > 0 ? (
        <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--color-border)]">
              <thead className="bg-[var(--color-hover)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">Razón</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--color-card)] divide-y divide-[var(--color-border)]">
                {paginatedMovements.map((movement) => (
                  <tr key={movement._id} className="hover:bg-[var(--color-hover)] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[var(--color-vet-text)]">{movement.product?.name}</div>
                      <div className="text-xs text-[var(--color-vet-muted)]">
                        {movement.product?.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex items-center text-xs font-semibold rounded-full ${getTypeColor(movement.type)}`}>
                        {getTypeIcon(movement.type)}
                        <span className="ml-1 capitalize">{movement.type}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-vet-text)]">
                      {movement.quantityUnits > 0 && (
                        <div>{movement.quantityUnits} unidades</div>
                      )}
                      {movement.quantityDoses > 0 && (
                        <div>{movement.quantityDoses} dosis</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-vet-muted)]">
                      {movement.reason.replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-vet-muted)]">
                      {format(new Date(movement.createdAt), "dd MMM yyyy HH:mm", { locale: es })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-[var(--color-border)]">
            {paginatedMovements.map((movement) => (
              <div key={movement._id} className="p-4 hover:bg-[var(--color-hover)] transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-vet-text)]">{movement.product?.name}</p>
                    <p className="text-xs text-[var(--color-vet-muted)]">{movement.product?.category}</p>
                  </div>
                  <span className={`px-2 py-1 inline-flex items-center text-xs font-semibold rounded-full flex-shrink-0 ${getTypeColor(movement.type)}`}>
                    {getTypeIcon(movement.type)}
                    <span className="ml-1 capitalize">{movement.type}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm mt-3">
                  <div className="text-[var(--color-vet-text)]">
                    {movement.quantityUnits > 0 && <span>{movement.quantityUnits} u</span>}
                    {movement.quantityUnits > 0 && movement.quantityDoses > 0 && <span> + </span>}
                    {movement.quantityDoses > 0 && <span>{movement.quantityDoses} dosis</span>}
                  </div>
                  <div className="text-xs text-[var(--color-vet-muted)]">
                    {format(new Date(movement.createdAt), "dd MMM HH:mm", { locale: es })}
                  </div>
                </div>
                <p className="text-xs text-[var(--color-vet-muted)] mt-1 capitalize">
                  {movement.reason.replace(/_/g, " ")}
                </p>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="px-4 py-4 border-t border-[var(--color-border)] flex justify-between items-center bg-[var(--color-vet-light)]/30">
              <p className="text-sm text-[var(--color-vet-muted)] hidden sm:block">
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-sm text-[var(--color-vet-text)] hover:bg-[var(--color-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>
                
                {/* Mobile page indicator */}
                <span className="text-sm text-[var(--color-vet-muted)] sm:hidden self-center">
                  {currentPage} / {totalPages}
                </span>

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
            <ClipboardList className="w-8 h-8 text-[var(--color-vet-muted)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--color-vet-text)] mb-1">
            {searchTerm ? "Sin resultados" : "Sin movimientos"}
          </h3>
          <p className="text-sm text-[var(--color-vet-muted)] mb-4">
            {searchTerm 
              ? "No hay movimientos con esos criterios" 
              : "Los movimientos se registrarán automáticamente al comprar o usar productos"}
          </p>
        </div>
      )}
    </div>
  );
}