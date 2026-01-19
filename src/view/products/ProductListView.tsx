import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, 
  X, 
  Plus, 
  Edit3, 
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "../../components/Toast";
import { getAllProducts, deleteProduct } from "../../api/productAPI";
import type { Product } from "../../types/product";
import ConfirmationModal from "../../components/modal/ConfirmationModal";

const ITEMS_PER_PAGE = 10;

export default function ProductListView() {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
  });

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = 
        categoryFilter === "all" || product.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleFilterChange = (filter: string) => {
    setCategoryFilter(filter);
    setCurrentPage(1);
  };

  const { mutate: removeProduct, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      toast.success("Producto eliminado");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowDeleteModal(false);
      setProductToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-vet-light">
        <div className="w-8 h-8 border-2 border-vet-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 bg-vet-light min-h-screen transition-colors duration-300">
      {/* Header y Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-vet-text tracking-tight">Inventario</h1>
          <p className="text-sm text-vet-muted mt-1">
            Gestión de productos y servicios
          </p>
        </div>
        
        <Link
          to="/products/new"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-vet-primary hover:bg-vet-secondary text-white text-sm font-semibold rounded-xl shadow-soft transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Link>
      </div>

      {/* Barra de Filtros Unificada */}
      <div className="bg-card border border-border rounded-xl p-1.5 mb-6 flex flex-col sm:flex-row gap-2 shadow-sm">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-vet-light border border-transparent hover:border-border rounded-lg text-sm text-vet-text placeholder:text-vet-muted focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-vet-muted"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Tabs de Categoría */}
        <div className="flex p-1 bg-vet-light rounded-lg">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'vacuna', label: 'Vacunas' },
            { id: 'desparasitante', label: 'Desparasitantes' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleFilterChange(cat.id)}
              className={`
                px-4 py-1.5 text-xs font-medium rounded-md transition-all
                ${categoryFilter === cat.id
                  ? "bg-card text-vet-text shadow-sm font-semibold"
                  : "text-vet-muted hover:text-vet-text hover:bg-black/5 dark:hover:bg-white/5"
                }
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla Profesional */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
        {paginatedProducts.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-vet-light/50 border-b border-border text-xs uppercase tracking-wider text-vet-muted font-semibold">
                    <th className="px-6 py-4">Producto</th>
                    <th className="px-6 py-4">Categoría</th>
                    <th className="px-6 py-4 text-right">Precio</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4 text-center">Estado</th>
                    <th className="px-6 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedProducts.map((product) => {
                    // Cálculo de stock usando las propiedades directas (seguro y compatible)
                    const stockUnits = product.stockUnits ?? 0;
                    const stockDoses = product.stockDoses ?? 0;

                    const stock = product.divisible 
                      ? `${stockUnits * product.dosesPerUnit + stockDoses} dosis`
                      : `${stockUnits} ${product.unit}`;

                    return (
                      <tr 
                        key={product._id} 
                        className="group hover:bg-hover transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-vet-text group-hover:text-vet-primary transition-colors">
                              {product.name}
                            </span>
                            {product.description && (
                              <span className="text-xs text-vet-muted truncate max-w-[250px]">
                                {product.description}
                              </span>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className={`
                            inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border capitalize
                            ${product.category === 'vacuna' 
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                              : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                            }
                          `}>
                            {product.category}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-bold text-vet-text font-mono">
                              ${product.salePrice.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-vet-muted">
                              / {product.unit}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-vet-text">
                          {stock}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${product.active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className={`text-xs font-medium ${product.active ? 'text-vet-text' : 'text-vet-muted'}`}>
                              {product.active ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              to={`/products/${product._id}/edit`}
                              className="p-2 rounded-lg text-vet-muted hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(product)}
                              className="p-2 rounded-lg text-vet-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-vet-light/30">
                <span className="text-xs text-vet-muted">
                  Página {currentPage} de {totalPages}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-border bg-card text-vet-muted hover:text-vet-text hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-border bg-card text-vet-muted hover:text-vet-text hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center">
            <p className="text-vet-text font-medium mb-1">
              {searchTerm ? "No se encontraron resultados" : "Inventario vacío"}
            </p>
            <p className="text-sm text-vet-muted">
              {searchTerm 
                ? "Intenta con otro término de búsqueda" 
                : "Agrega productos para comenzar"}
            </p>
          </div>
        )}
      </div>

     <ConfirmationModal
  isOpen={showDeleteModal}
  onClose={() => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  }}
  onConfirm={() => productToDelete?._id && removeProduct(productToDelete._id)}
  title="¿Eliminar producto?"
  message={`¿Estás seguro de que deseas eliminar el producto "${productToDelete?.name || ""}"? Esta acción no se puede deshacer.`}
  confirmText="Eliminar"
  cancelText="Cancelar"
  variant="danger"
  isLoading={isDeleting}
  loadingText="Eliminando..."
/>
    </div>
  );
}