// src/views/inventory/InventoryLowStockView.tsx
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Search, Package } from "lucide-react";
import { getActiveProducts } from "../../api/productAPI";
import { getInventory } from "../../api/inventoryAPI";

const LOW_STOCK_THRESHOLD = 5;

export default function InventoryLowStockView() {
  const [searchTerm, setSearchTerm] = useState("");

  const {  data:products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products", "active"],
    queryFn: getActiveProducts,
  });

  const {  data:inventories = [], isLoading: loadingInventory } = useQuery({
    queryKey: ["inventory", "low-stock"],
    queryFn: async () => {
      const invs: any[] = [];
      for (const product of products) {
        if (!product._id) continue;
        try {
          const inv = await getInventory(product._id);
          if (inv.stockUnits < LOW_STOCK_THRESHOLD) {
            invs.push(inv);
          }
        } catch (error) {
          // Producto sin inventario, lo ignoramos
        }
      }
      return invs;
    },
    enabled: products.length > 0,
  });

  const loading = loadingProducts || loadingInventory;

  // Combinar productos con inventario
  const productsWithInventory = useMemo(() => {
    return products
      .map((product) => {
        const inventory = inventories.find(
          (inv) => inv.product?._id === product._id
        );
        return { ...product, inventory };
      })
      .filter(
        (product) =>
          product.inventory &&
          product.inventory.stockUnits < LOW_STOCK_THRESHOLD
      );
  }, [products, inventories]);

  // Filtrar por búsqueda
  const filteredProducts = useMemo(() => {
    return productsWithInventory.filter((product) => {
      return (
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description &&
          product.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [productsWithInventory, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto border-3 border-vet-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-vet-muted text-sm">Cargando alertas de stock...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
          <h1 className="text-xl font-semibold text-vet-text">Stock Bajo</h1>
        </div>
        <p className="text-sm text-vet-muted">
          {filteredProducts.length} producto
          {filteredProducts.length !== 1 ? "s" : ""} necesitan reposición
        </p>
      </div>

      {/* Búsqueda */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted" />
        <input
          type="text"
          placeholder="Buscar productos con stock bajo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-vet-text focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
        />
      </div>

      {/* Lista de productos con stock bajo */}
      {filteredProducts.length > 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-vet-muted uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-vet-muted uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-vet-muted uppercase tracking-wider">
                    Stock Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-vet-muted uppercase tracking-wider">
                    Umbral Bajo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-vet-muted uppercase tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {filteredProducts.map((product) => {
                  const stockUnits = product.inventory?.stockUnits || 0;

                  return (
                    <tr
                      key={product._id}
                      className="hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-amber-900/30 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-vet-text">
                              {product.name}
                            </div>
                            {product.description && (
                              <div className="text-xs text-vet-muted">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-vet-primary/20 text-vet-primary capitalize">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-400">
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {stockUnits} {product.unit}
                          {stockUnits !== 1 ? "s" : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-vet-muted">
                        &lt; {LOW_STOCK_THRESHOLD} {product.unit}(s)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={`/purchases/create?productId=${product._id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-vet-primary text-vet-primary text-xs font-medium rounded-lg hover:bg-vet-primary hover:text-white transition-colors"
                        >
                          <Package className="w-3 h-3 mr-1" />
                          Comprar
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-900/20 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-lg font-medium text-vet-text mb-1">
            ¡Excelente! Todo el stock está bien
          </h3>
          <p className="text-sm text-vet-muted">
            No hay productos por debajo del umbral de {LOW_STOCK_THRESHOLD}{" "}
            unidades
          </p>
        </div>
      )}
    </div>
  );
}