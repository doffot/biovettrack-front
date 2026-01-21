// src/views/inventory/InventoryStockView.tsx
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Package, 
  Search, 
  Archive,
  AlertTriangle
} from "lucide-react";
import { getActiveProducts } from "../../api/productAPI";
import { getInventory } from "../../api/inventoryAPI";
import type { Inventory } from "../../types/inventory";

export default function InventoryStockView() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products", "active"],
    queryFn: getActiveProducts,
  });

  const { data: inventories = [], isLoading: loadingInventory } = useQuery({
    queryKey: ["inventory", "all"],
    queryFn: async () => {
      const invs: Inventory[] = [];
      for (const product of products) {
        if (!product._id) continue;
        try {
          const inv = await getInventory(product._id);
          invs.push(inv);
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
    return products.map(product => {
      const inventory = inventories.find(inv => inv.product?._id === product._id);
      return { ...product, inventory };
    });
  }, [products, inventories]);

  const filteredProducts = useMemo(() => {
    return productsWithInventory.filter(product => {
      return (
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
          <p className="text-[var(--color-vet-muted)] text-sm">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-vet-text)]">Stock Actual</h1>
        <p className="text-sm text-[var(--color-vet-muted)]">
          {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""} en inventario
        </p>
      </div>

      {/* Búsqueda */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-vet-muted)]" />
        <input
          type="text"
          placeholder="Buscar por nombre, categoría o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] transition-all"
        />
      </div>

      {/* Lista de productos con stock */}
      {filteredProducts.length > 0 ? (
        <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--color-border)]">
              <thead className="bg-[var(--color-hover)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">Unidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">Stock Unidades</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">Stock Dosis</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wider">Total Dosis</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--color-card)] divide-y divide-[var(--color-border)]">
                {filteredProducts.map((product) => {
                  const stockUnits = product.inventory?.stockUnits || 0;
                  const stockDoses = product.inventory?.stockDoses || 0;
                  const totalDoses = (stockUnits * product.dosesPerUnit) + stockDoses;

                  return (
                    <tr key={product._id} className="hover:bg-[var(--color-hover)] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-[var(--color-vet-primary)]/10 rounded-lg">
                            <Archive className="w-4 h-4 text-[var(--color-vet-primary)]" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-[var(--color-vet-text)]">{product.name}</div>
                            {product.description && (
                              <div className="text-xs text-[var(--color-vet-muted)]">{product.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[var(--color-vet-primary)]/20 text-[var(--color-vet-primary)] capitalize">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-vet-muted)]">
                        {product.unit} / {product.doseUnit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-vet-text)]">
                        {stockUnits} {product.unit}{stockUnits !== 1 ? "s" : ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-vet-text)]">
                        {stockDoses > 0 ? `${stockDoses} ${product.doseUnit}` : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-sm font-bold text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {totalDoses} {product.doseUnit}
                        </span>
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
              const stockDoses = product.inventory?.stockDoses || 0;
              const totalDoses = (stockUnits * product.dosesPerUnit) + stockDoses;

              return (
                <div key={product._id} className="p-4 hover:bg-[var(--color-hover)] transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[var(--color-vet-primary)]/10 rounded-lg">
                        <Archive className="w-4 h-4 text-[var(--color-vet-primary)]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--color-vet-text)]">{product.name}</p>
                        <p className="text-xs text-[var(--color-vet-muted)] capitalize">{product.category}</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      {totalDoses} total
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-[var(--color-vet-light)] p-2 rounded-lg border border-[var(--color-border)]">
                      <p className="text-xs text-[var(--color-vet-muted)] mb-1">Stock Unidades</p>
                      <p className="font-medium text-[var(--color-vet-text)]">
                        {stockUnits} {product.unit}
                      </p>
                    </div>
                    <div className="bg-[var(--color-vet-light)] p-2 rounded-lg border border-[var(--color-border)]">
                      <p className="text-xs text-[var(--color-vet-muted)] mb-1">Stock Dosis</p>
                      <p className="font-medium text-[var(--color-vet-text)]">
                        {stockDoses} {product.doseUnit}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl flex items-center justify-center">
            <Package className="w-8 h-8 text-[var(--color-vet-muted)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--color-vet-text)] mb-1">
            {searchTerm ? "Sin resultados" : "Sin productos en inventario"}
          </h3>
          <p className="text-sm text-[var(--color-vet-muted)] mb-4">
            {searchTerm 
              ? "No hay productos con esos criterios" 
              : "Registra productos y compra stock para verlos aquí"}
          </p>
        </div>
      )}
    </div>
  );
}