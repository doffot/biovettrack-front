// src/components/sales/ProductSearch.tsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Package, Plus, Loader2 } from "lucide-react";
import { getProductsWithInventory } from "../../api/productAPI";
import type { ProductWithInventory } from "../../types/inventory";

interface ProductSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddProduct: (product: ProductWithInventory, isFullUnit: boolean) => void;
}

export function ProductSearch({ searchTerm, onSearchChange, onAddProduct }: ProductSearchProps) {
  const {  data:products = [], isLoading } = useQuery({
    queryKey: ["products", "with-inventory"],
    queryFn: getProductsWithInventory,
  });

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const search = searchTerm.toLowerCase();
    return products.filter(
      (p: ProductWithInventory) =>
        p.name.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search)
    );
  }, [products, searchTerm]);

  return (
    <div className="flex flex-col h-full">
      {/* Buscador */}
      <div className="p-2 border-b border-slate-700">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-700 rounded-lg text-sm bg-slate-800 text-vet-text focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
          />
        </div>
      </div>

      {/* Header */}
      <div className="px-2 py-1.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <span className="text-[10px] font-medium text-vet-muted uppercase">Productos</span>
        <span className="text-[10px] text-vet-muted">{filteredProducts.length}</span>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <Loader2 className="w-5 h-5 animate-spin text-vet-primary mx-auto" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-4 text-center">
            <Package className="w-6 h-6 text-slate-500 mx-auto mb-1" />
            <p className="text-xs text-vet-muted">Sin resultados</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {filteredProducts.map((product: ProductWithInventory) => {
              const stockUnits = product.inventory?.stockUnits || 0;
              const stockDoses = product.inventory?.stockDoses || 0;
              const totalDoses = stockUnits * product.dosesPerUnit + stockDoses;
              const hasStock = stockUnits > 0 || stockDoses > 0;

              return (
                <div
                  key={product._id}
                  className={`px-2 py-1.5 flex items-center gap-2 ${
                    !hasStock ? "opacity-50 bg-slate-800" : "hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-vet-text truncate">{product.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] px-1 py-0.5 bg-slate-700 text-slate-300 rounded">
                        {product.category}
                      </span>
                      <span className={`text-[9px] ${hasStock ? "text-green-400" : "text-red-400"}`}>
                        {hasStock ? `${stockUnits} ${product.unit}` : "Sin stock"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-semibold text-vet-text">
                      ${product.salePrice.toFixed(2)}
                    </p>
                    {product.divisible && product.salePricePerDose && (
                      <p className="text-[9px] text-vet-accent">
                        ${product.salePricePerDose.toFixed(2)}/{product.doseUnit}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-0.5">
                    <button
                      onClick={() => onAddProduct(product, true)}
                      disabled={stockUnits <= 0}
                      className={`p-1 rounded text-xs ${
                        stockUnits > 0
                          ? "bg-vet-primary text-white hover:bg-vet-secondary"
                          : "bg-slate-700 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    {product.divisible && (
                      <button
                        onClick={() => onAddProduct(product, false)}
                        disabled={totalDoses <= 0}
                        className={`px-1 py-0.5 rounded text-[9px] font-medium border ${
                          totalDoses > 0
                            ? "border-vet-accent text-vet-accent hover:bg-vet-primary/10"
                            : "border-slate-600 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        {product.doseUnit.substring(0, 1).toUpperCase()}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}