// src/views/inventory/InventoryLowStockView.tsx
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Search, Package, CheckCircle2 } from "lucide-react";
import { getActiveProducts } from "../../api/productAPI";
import { getInventory } from "../../api/inventoryAPI";
import { Link } from "react-router-dom";

const LOW_STOCK_THRESHOLD = 5;

export default function InventoryLowStockView() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products", "active"],
    queryFn: getActiveProducts,
  });

  const { data: inventories = [], isLoading: loadingInventory } = useQuery({
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
          // Ignorar productos sin inventario
        }
      }
      return invs;
    },
    enabled: products.length > 0,
  });

  const loading = loadingProducts || loadingInventory;

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
          <div className="relative w-12 h-12 mx-auto mb-3">
            <div className="absolute inset-0 border-3 border-[var(--color-border)] rounded-full"></div>
            <div className="absolute inset-0 border-3 border-[var(--color-vet-primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[var(--color-vet-muted)] text-sm">Cargando alertas de stock...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[var(--color-vet-text)]">Stock Bajo</h1>
            <p className="text-sm text-[var(--color-vet-muted)]">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""} necesitan reposición
            </p>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-vet-muted)]" />
        <input
          type="text"
          placeholder="Buscar productos con stock bajo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] transition-all"
        />
      </div>

      {/* Lista de productos con stock bajo */}
      {filteredProducts.length > 0 ? (
        <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--color-border)]">
              <thead className="bg-[var(--color-hover)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">
                    Stock Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">
                    Umbral Bajo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--color-card)] divide-y divide-[var(--color-border)]">
                {filteredProducts.map((product) => {
                  const stockUnits = product.inventory?.stockUnits || 0;

                  return (
                    <tr
                      key={product._id}
                      className="hover:bg-[var(--color-hover)] transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-amber-500/10 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-[var(--color-vet-text)]">
                              {product.name}
                            </div>
                            {product.description && (
                              <div className="text-xs text-[var(--color-vet-muted)]">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[var(--color-vet-primary)]/20 text-[var(--color-vet-primary)] capitalize">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-amber-600 dark:text-amber-400">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {stockUnits} {product.unit}
                          {stockUnits !== 1 ? "s" : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-vet-muted)]">
                        &lt; {LOW_STOCK_THRESHOLD} {product.unit}(s)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/purchases/create?productId=${product._id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-[var(--color-vet-primary)] text-[var(--color-vet-primary)] text-xs font-medium rounded-lg hover:bg-[var(--color-vet-primary)] hover:text-white transition-colors"
                        >
                          <Package className="w-3.5 h-3.5 mr-1.5" />
                          Reponer Stock
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-[var(--color-border)]">
            {filteredProducts.map((product) => {
              const stockUnits = product.inventory?.stockUnits || 0;
              return (
                <div key={product._id} className="p-4 hover:bg-[var(--color-hover)] transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-500/10 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--color-vet-text)]">{product.name}</p>
                        <p className="text-xs text-[var(--color-vet-muted)] capitalize">{product.category}</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      {stockUnits} {product.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-vet-muted)]">
                      Umbral: &lt; {LOW_STOCK_THRESHOLD} {product.unit}
                    </p>
                    <Link
                      to={`/purchases/create?productId=${product._id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-[var(--color-vet-primary)] text-[var(--color-vet-primary)] text-xs font-medium rounded-lg hover:bg-[var(--color-vet-primary)] hover:text-white transition-colors"
                    >
                      <Package className="w-3.5 h-3.5 mr-1.5" />
                      Reponer
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-lg font-medium text-[var(--color-vet-text)] mb-1">
            ¡Excelente! Todo el stock está bien
          </h3>
          <p className="text-sm text-[var(--color-vet-muted)]">
            No hay productos por debajo del umbral de {LOW_STOCK_THRESHOLD}{" "}
            unidades
          </p>
        </div>
      )}
    </div>
  );
}