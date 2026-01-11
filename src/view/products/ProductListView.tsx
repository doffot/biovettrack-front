// src/views/products/ProductListView.tsx
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Package, 
  Search, 
  X, 
  Plus, 
  Edit3, 
  Trash2,
  Tag
} from "lucide-react";
import { toast } from "../../components/Toast";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { getAllProducts, deleteProduct } from "../../api/productAPI";
import type { Product } from "../../types/product";

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

  // Filtros
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

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Reset page on filter change
  const handleFilterChange = (filter: string) => {
    setCategoryFilter(filter);
    setCurrentPage(1);
  };

  // Mutación para eliminar
  const { mutate: removeProduct, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      toast.success("Producto eliminado correctamente");
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto border-3 border-vet-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-vet-muted text-sm">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-vet-text">Catálogo de Productos</h1>
          <p className="text-sm text-vet-muted">
            {products.length} producto{products.length !== 1 ? "s" : ""} registrados
          </p>
        </div>
        <Link
          to="/products/new"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-vet-primary hover:bg-vet-secondary text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Nuevo Producto
        </Link>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted" />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
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

        {/* Filtro por categoría */}
        <div className="flex gap-2">
          <button
            onClick={() => handleFilterChange("all")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              categoryFilter === "all"
                ? "bg-vet-primary text-white"
                : "bg-white text-vet-text border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => handleFilterChange("vacuna")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              categoryFilter === "vacuna"
                ? "bg-vet-primary text-white"
                : "bg-white text-vet-text border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Vacunas
          </button>
          <button
            onClick={() => handleFilterChange("desparasitante")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              categoryFilter === "desparasitante"
                ? "bg-vet-primary text-white"
                : "bg-white text-vet-text border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Desparasitantes
          </button>
        </div>
      </div>

      {/* Lista de productos */}
      {paginatedProducts.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Venta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-vet-light rounded-lg">
                          <Tag className="w-4 h-4 text-vet-primary" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-vet-text">{product.name}</div>
                          {product.description && (
                            <div className="text-xs text-vet-muted">{product.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-vet-light text-vet-primary capitalize">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-vet-text">
                      ${product.salePrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-vet-muted">
                      {product.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.active 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {product.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/products/${product._id}/edit`}
                        className="text-vet-primary hover:text-vet-secondary mr-3"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product)}
                        className="text-red-500 hover:text-red-700"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-vet-text mb-1">
            {searchTerm || categoryFilter !== "all" ? "Sin resultados" : "Sin productos"}
          </h3>
          <p className="text-sm text-vet-muted mb-4">
            {searchTerm || categoryFilter !== "all"
              ? "No hay productos con esos criterios"
              : "Registra tu primer producto"}
          </p>
          <Link
            to="/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-vet-primary text-white text-sm font-medium rounded-lg hover:bg-vet-secondary transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear Producto
          </Link>
        </div>
      )}

      {/* Modal de confirmación */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setProductToDelete(null);
        }}
        onConfirm={() => productToDelete?._id && removeProduct(productToDelete._id)}
        petName={`el producto "${productToDelete?.name || ""}"`}
        isDeleting={isDeleting}
      />
    </div>
  );
}