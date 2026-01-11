// src/views/inventory/InventoryMovementsView.tsx
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ClipboardList, 
  Search, 
  ArrowDown,
  ArrowUp,
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
        if (!product._id) continue; // Asegurarse de que tiene ID
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
      
      // Ordenar por fecha descendente
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
      ? "bg-green-100 text-green-800" 
      : "bg-red-100 text-red-800";
  };

  const getTypeIcon = (type: string) => {
    return type === "entrada" ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto border-3 border-vet-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-vet-muted text-sm">Cargando movimientos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-vet-text">Historial de Movimientos</h1>
        <p className="text-sm text-vet-muted">
          {movements.length} movimiento{movements.length !== 1 ? "s" : ""} registrados
        </p>
      </div>

      {/* Búsqueda */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted" />
        <input
          type="text"
          placeholder="Buscar por producto, tipo o razón..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
        />
      </div>

      {/* Lista de movimientos */}
      {paginatedMovements.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Razón</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedMovements.map((movement) => (
                  <tr key={movement._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-vet-text">{movement.product?.name}</div>
                      <div className="text-xs text-vet-muted">
                        {movement.product?.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(movement.type)}`}>
                        {getTypeIcon(movement.type)}
                        <span className="ml-1">{movement.type === "entrada" ? "Entrada" : "Salida"}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-vet-text">
                      {movement.quantityUnits > 0 && (
                        <div>{movement.quantityUnits} unidades</div>
                      )}
                      {movement.quantityDoses > 0 && (
                        <div>{movement.quantityDoses} dosis</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-vet-muted">
                      {movement.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-vet-muted">
                      {format(new Date(movement.createdAt), "dd MMM yyyy HH:mm", { locale: es })}
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
            <ClipboardList className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-vet-text mb-1">
            {searchTerm ? "Sin resultados" : "Sin movimientos"}
          </h3>
          <p className="text-sm text-vet-muted mb-4">
            {searchTerm 
              ? "No hay movimientos con esos criterios" 
              : "Los movimientos se registrarán automáticamente al comprar o usar productos"}
          </p>
        </div>
      )}
    </div>
  );
}