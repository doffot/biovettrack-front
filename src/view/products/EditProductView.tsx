// src/views/products/EditProductView.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Loader2, 
  Package,
  AlertTriangle,
  Tag,
  CreditCard,
  Beaker,
  Scissors,
  Save,
  X
} from "lucide-react";
import { getProductById, updateProduct } from "../../api/productAPI";
import { toast } from "../../components/Toast";
import type { Product, ProductFormData } from "../../types/product";

const categoryOptions = [
  { value: "vacuna", label: "Vacuna" },
  { value: "desparasitante", label: "Desparasitante" },
  { value: "medicamento", label: "Medicamento" },
  { value: "alimento", label: "Alimento" },
  { value: "accesorio", label: "Accesorio" },
  { value: "otro", label: "Otro" },
];

export default function EditProductView() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "medicamento",
    salePrice: 0,
    salePricePerDose: undefined,
    costPrice: undefined,
    unit: "",
    doseUnit: "dosis",
    dosesPerUnit: 1,
    divisible: false,
    stockUnits: undefined,
    stockDoses: undefined,
    minStock: undefined,
    active: true,
  });

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId!),
    enabled: !!productId,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        category: product.category,
        salePrice: product.salePrice,
        salePricePerDose: product.salePricePerDose,
        costPrice: product.costPrice,
        unit: product.unit,
        doseUnit: product.doseUnit,
        dosesPerUnit: product.dosesPerUnit,
        divisible: product.divisible ?? false,
        stockUnits: product.stockUnits,
        stockDoses: product.stockDoses,
        minStock: product.minStock,
        active: product.active ?? true,
      });
    }
  }, [product]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ProductFormData) => updateProduct(productId!, data),
    onSuccess: () => {
      toast.success("Producto actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      navigate("/products");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      
      // Si desactiva "divisible", limpiar stockDoses y salePricePerDose
      if (name === "divisible" && !checked) {
        setFormData(prev => ({ 
          ...prev, 
          divisible: false,
          stockDoses: undefined,
          salePricePerDose: undefined,
        }));
      }
    } else if (
      name === "salePrice" || 
      name === "salePricePerDose" ||
      name === "costPrice" || 
      name === "dosesPerUnit" ||
      name === "stockUnits" || 
      name === "stockDoses" || 
      name === "minStock"
    ) {
      const numValue = value === "" ? undefined : parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!formData.unit.trim()) {
      toast.error("La unidad física es obligatoria");
      return;
    }
    if (!formData.doseUnit.trim()) {
      toast.error("La unidad de dosis es obligatoria");
      return;
    }
    if (formData.salePrice === undefined || formData.salePrice < 0) {
      toast.error("El precio de venta es obligatorio y debe ser positivo");
      return;
    }
    if (formData.dosesPerUnit === undefined || formData.dosesPerUnit <= 0) {
      toast.error("Las dosis por unidad deben ser positivas");
      return;
    }
    if (formData.divisible && !formData.salePricePerDose) {
      toast.error("Si el producto es divisible, el precio por dosis es obligatorio");
      return;
    }

    mutate(formData);
  };

  const isValid = 
    formData.name.trim() !== "" && 
    formData.unit.trim() !== "" && 
    formData.doseUnit.trim() !== "" && 
    formData.salePrice !== undefined &&
    formData.dosesPerUnit !== undefined &&
    (!formData.divisible || (formData.divisible && formData.salePricePerDose !== undefined));

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto border-3 border-vet-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-vet-muted text-sm">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-vet-text mb-2">Producto no encontrado</h3>
          <p className="text-sm text-vet-muted mb-4">El producto que buscas no existe o fue eliminado</p>
          <button
            onClick={() => navigate("/products")}
            className="inline-flex items-center gap-2 px-4 py-2 text-vet-primary hover:bg-vet-primary/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-vet-light via-white to-purple-50/30 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-500 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-xl shadow-soft">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-vet-text">Editar Producto</h1>
              <p className="text-sm text-vet-muted">{product.name}</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Nombre */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-vet-text mb-2">
                    <Tag className="w-4 h-4 text-vet-primary" />
                    Nombre del producto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej: Bravecto 20kg"
                    maxLength={100}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-vet-text mb-2">
                    <Package className="w-4 h-4 text-vet-primary" />
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                  >
                    {categoryOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Divisible toggle */}
                <div className="md:col-span-2">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="divisible"
                        checked={formData.divisible}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`relative w-11 h-6 rounded-full transition-colors ${
                        formData.divisible ? "bg-blue-500" : "bg-gray-300"
                      }`}>
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          formData.divisible ? "translate-x-5" : ""
                        }`} />
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <Scissors className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-900">Producto divisible</span>
                        </div>
                        <p className="text-xs text-blue-700 mt-0.5">
                          {formData.divisible 
                            ? "Se puede vender por partes (ej: Bravecto en 9 partes, líquido por ml)" 
                            : "Solo se vende como unidad completa (ej: vacunas)"}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Unidad física */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-vet-text mb-2">
                    <Package className="w-4 h-4 text-vet-primary" />
                    Unidad física <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    placeholder="Ej: tableta, frasco, sobre"
                    maxLength={30}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                  />
                  <p className="text-xs text-vet-muted mt-1">Cómo viene el producto</p>
                </div>

                {/* Unidad de dosis */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-vet-text mb-2">
                    <Beaker className="w-4 h-4 text-blue-500" />
                    Unidad de fracción <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="doseUnit"
                    value={formData.doseUnit}
                    onChange={handleChange}
                    placeholder={formData.divisible ? "Ej: parte, ml, gramos" : "Ej: dosis"}
                    maxLength={10}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                  />
                  <p className="text-xs text-vet-muted mt-1">
                    {formData.divisible ? "Cómo se fracciona" : "Cómo se aplica/vende"}
                  </p>
                </div>

                {/* Dosis por unidad */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-vet-text mb-2">
                    <Beaker className="w-4 h-4 text-blue-500" />
                    {formData.divisible ? "Fracciones por unidad" : "Dosis por unidad"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="dosesPerUnit"
                    value={formData.dosesPerUnit ?? ""}
                    onChange={handleChange}
                    min="1"
                    step="0.1"
                    placeholder="1"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                  />
                  <p className="text-xs text-vet-muted mt-1">
                    {formData.divisible 
                      ? `Ej: 9 partes por tableta, 20 ml por frasco` 
                      : `Normalmente 1`}
                  </p>
                </div>

                {/* Costo de compra */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-vet-text mb-2">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    Costo de compra (opcional)
                  </label>
                  <input
                    type="number"
                    name="costPrice"
                    value={formData.costPrice ?? ""}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                  />
                  <p className="text-xs text-vet-muted mt-1">Lo que te costó</p>
                </div>

                {/* Precio de venta (unidad completa) */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-vet-text mb-2">
                    <CreditCard className="w-4 h-4 text-green-600" />
                    Precio venta (unidad) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice ?? ""}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                  />
                  <p className="text-xs text-vet-muted mt-1">
                    Precio de la {formData.unit || "unidad"} completa
                  </p>
                </div>

                {/* Precio por dosis (solo si es divisible) */}
                {formData.divisible && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-vet-text mb-2">
                      <Beaker className="w-4 h-4 text-green-600" />
                      Precio por {formData.doseUnit || "fracción"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="salePricePerDose"
                      value={formData.salePricePerDose ?? ""}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                    />
                    <p className="text-xs text-vet-muted mt-1">
                      Precio por cada {formData.doseUnit || "fracción"}
                    </p>
                  </div>
                )}

                {/* Sección de Stock */}
                <div className="md:col-span-2">
                  <div className="border-t border-gray-100 pt-6 mt-2">
                    <h3 className="text-sm font-semibold text-vet-text mb-4 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Stock actual
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Stock unidades */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">
                          Unidades completas
                        </label>
                        <input
                          type="number"
                          name="stockUnits"
                          value={formData.stockUnits ?? ""}
                          onChange={handleChange}
                          min="0"
                          placeholder="0"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                        />
                        <p className="text-xs text-vet-muted mt-1">
                          {formData.unit ? `${formData.unit}(s) cerradas` : "Unidades cerradas"}
                        </p>
                      </div>

                      {/* Stock dosis (solo si divisible) */}
                      {formData.divisible && (
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">
                            {formData.doseUnit || "Fracciones"} sueltas
                          </label>
                          <input
                            type="number"
                            name="stockDoses"
                            value={formData.stockDoses ?? ""}
                            onChange={handleChange}
                            min="0"
                            step="0.1"
                            placeholder="0"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                          />
                          <p className="text-xs text-vet-muted mt-1">
                            De unidad ya abierta
                          </p>
                        </div>
                      )}

                      {/* Stock mínimo */}
                      <div>
                        <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          Stock mínimo (alerta)
                        </label>
                        <input
                          type="number"
                          name="minStock"
                          value={formData.minStock ?? ""}
                          onChange={handleChange}
                          min="0"
                          placeholder="0"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                        />
                        <p className="text-xs text-vet-muted mt-1">
                          Aviso cuando queden pocas
                        </p>
                      </div>
                    </div>

                    {/* Mostrar stock total si es divisible */}
                    {formData.divisible && formData.dosesPerUnit && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-vet-muted">
                          <span className="font-medium">Stock total:</span>{" "}
                          {((formData.stockUnits || 0) * formData.dosesPerUnit) + (formData.stockDoses || 0)} {formData.doseUnit || "fracciones"}
                          {" "}
                          <span className="text-gray-400">
                            ({formData.stockUnits || 0} {formData.unit || "unidades"} × {formData.dosesPerUnit} + {formData.stockDoses || 0} sueltas)
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Descripción */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-vet-text mb-2">
                    <Package className="w-4 h-4 text-gray-500" />
                    Descripción (opcional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    placeholder="Detalles adicionales..."
                    maxLength={200}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                  />
                </div>

                {/* Activo */}
                <div className="md:col-span-2 flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`relative w-11 h-6 rounded-full transition-colors ${
                      formData.active ? "bg-vet-primary" : "bg-gray-300"
                    }`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        formData.active ? "translate-x-5" : ""
                      }`} />
                    </div>
                    <span className="ml-3 text-sm text-vet-text">Producto activo</span>
                  </label>
                </div>

                {/* Preview del producto (si divisible) */}
                {formData.divisible && formData.dosesPerUnit && formData.salePrice !== undefined && formData.salePricePerDose !== undefined && (
                  <div className="md:col-span-2">
                    <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                      <h4 className="text-sm font-semibold text-green-900 mb-2">Vista previa de precios</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-green-700">1 {formData.unit || "unidad"} completa:</span>
                          <span className="font-bold text-green-900 ml-2">${formData.salePrice.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-green-700">1 {formData.doseUnit || "fracción"}:</span>
                          <span className="font-bold text-green-900 ml-2">${formData.salePricePerDose.toFixed(2)}</span>
                        </div>
                        <div className="col-span-2 text-xs text-green-600">
                          Si vendes las {formData.dosesPerUnit} {formData.doseUnit || "fracciones"} por separado: 
                          <span className="font-bold ml-1">
                            ${(formData.dosesPerUnit * formData.salePricePerDose).toFixed(2)}
                          </span>
                          {formData.dosesPerUnit * formData.salePricePerDose > formData.salePrice && (
                            <span className="text-green-800 ml-1">
                              (+${((formData.dosesPerUnit * formData.salePricePerDose) - formData.salePrice).toFixed(2)} extra)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-vet-muted">
                <span className="text-red-500">*</span> Campos obligatorios
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-600 font-medium rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isValid || isPending}
                  className={`flex items-center gap-2 px-6 py-2.5 text-sm rounded-xl font-semibold transition-all ${
                    isValid && !isPending
                      ? "bg-gradient-to-r from-vet-primary to-vet-secondary hover:from-vet-secondary hover:to-vet-primary text-white shadow-soft hover:shadow-md"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}