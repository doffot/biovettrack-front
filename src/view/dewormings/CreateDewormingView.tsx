// src/views/dewormings/CreateDewormingView.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Package } from "lucide-react";
import { createDeworming } from "../../api/dewormingAPI";
import { getActiveProducts } from "../../api/productAPI";
import { toast } from "../../components/Toast";
import type { DewormingFormData } from "../../types/deworming";

const DEWORMING_TYPES = ["Interna", "Externa", "Ambas"] as const;

export default function CreateDewormingView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<DewormingFormData>({
    applicationDate: new Date().toISOString().split("T")[0],
    dewormingType: "Interna",
    productName: "",
    dose: "",
    cost: 0,
    nextApplicationDate: "",
  });

  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [doseAmount, setDoseAmount] = useState<number>(1);
  const [useFullUnit, setUseFullUnit] = useState<boolean>(false);

  // Cargar productos activos
  const { data: products = [] } = useQuery({
    queryKey: ["products", "active"],
    queryFn: getActiveProducts,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: DewormingFormData & { productId?: string; quantity?: number; isFullUnit?: boolean }) => {
      const payload = { ...data };
      if (selectedProduct && selectedProduct !== "manual") {
        payload.productId = selectedProduct;
        payload.quantity = doseAmount;
        payload.isFullUnit = useFullUnit;
      }
      return createDeworming(patientId!, payload as DewormingFormData);
    },
    onSuccess: () => {
      toast.success("Desparasitación registrada");
      queryClient.invalidateQueries({ queryKey: ["dewormings", patientId] });
      navigate(-1);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Al seleccionar un producto
  useEffect(() => {
    setDoseAmount(1);
    setUseFullUnit(false);
    if (selectedProduct && selectedProduct !== "manual") {
      const product = products.find(p => p._id === selectedProduct);
      if (product) {
        setFormData(prev => ({
          ...prev,
          productName: product.name,
          cost: product.salePrice,
        }));
        if (!product.divisible) {
          setUseFullUnit(true);
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        productName: "",
        cost: 0,
      }));
    }
  }, [selectedProduct, products]);

  // Calcular costo total cuando cambia la dosis o el modo
  useEffect(() => {
    if (selectedProduct && selectedProduct !== "manual") {
      const product = products.find(p => p._id === selectedProduct);
      if (product) {
        let totalCost = 0;
        if (useFullUnit) {
          totalCost = product.salePrice * doseAmount;
        } else {
          const pricePerDose = product.salePricePerDose ?? product.salePrice;
          totalCost = pricePerDose * doseAmount;
        }
        setFormData(prev => ({ ...prev, cost: totalCost }));
      }
    }
  }, [doseAmount, selectedProduct, products, useFullUnit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "cost" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProduct(e.target.value);
  };

  const handleDoseAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 1;
    setDoseAmount(value > 0 ? value : 1);
  };

  const toggleUseFullUnit = () => {
    if (selectedProduct && selectedProduct !== "manual") {
      const product = products.find(p => p._id === selectedProduct);
      if (product?.divisible) {
        setUseFullUnit(!useFullUnit);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productName || !formData.dose || formData.cost <= 0) {
      toast.error("Completa los campos obligatorios");
      return;
    }

    const payload = {
      ...formData,
      ...(selectedProduct && selectedProduct !== "manual" ? { 
        productId: selectedProduct,
        quantity: doseAmount,
        isFullUnit: useFullUnit
      } : {}),
    };

    mutate(payload as DewormingFormData & { 
      productId?: string;
      quantity?: number;
      isFullUnit?: boolean;
    });
  };

  const isValid = formData.productName && formData.dose && formData.cost > 0;
  const isProductSelected = !!selectedProduct && selectedProduct !== "manual";
  const selectedProductData = products.find(p => p._id === selectedProduct);
  const isDivisible = selectedProductData?.divisible;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Registrar Desparasitación</h1>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm text-gray-600 font-medium rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            className={`px-4 py-2 text-sm rounded-lg font-medium flex items-center gap-2 transition-all ${
              isValid && !isPending
                ? "bg-vet-primary hover:bg-vet-secondary text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selector de producto */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Producto del catálogo
          </label>
          <div className="relative">
            <select
              value={selectedProduct}
              onChange={handleProductChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary pr-8"
            >
              <option value="">-- Selecciona un producto --</option>
              <option value="manual">📝 Ingresar manualmente</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} — {product.salePricePerDose ? 
                    `$${product.salePricePerDose}/${product.doseUnit}` : 
                    `$${product.salePrice} (${product.unit})`
                  }
                </option>
              ))}
            </select>
            <Package className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Selector de modo (solo si es divisible) */}
        {isProductSelected && isDivisible && (
          <div className="flex items-center gap-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useFullUnit}
                onChange={toggleUseFullUnit}
                className="sr-only"
              />
              <div className={`relative w-11 h-6 rounded-full transition-colors ${
                useFullUnit ? "bg-vet-primary" : "bg-gray-300"
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  useFullUnit ? "translate-x-5" : ""
                }`} />
              </div>
              <span className="ml-3 text-sm text-gray-700">
                {useFullUnit ? "Usar unidad completa" : "Usar dosis/fracción"}
              </span>
            </label>
          </div>
        )}

        {/* Cantidad */}
        {isProductSelected && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Cantidad (
              {useFullUnit 
                ? selectedProductData?.unit || "unidad" 
                : selectedProductData?.doseUnit || "dosis"
              })
            </label>
            <input
              type="number"
              min={useFullUnit ? "1" : "0.1"}
              step={useFullUnit ? "1" : "0.1"}
              value={doseAmount}
              onChange={handleDoseAmountChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>
        )}

        {/* Fila 1: Tipo + Fecha + Costo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo *</label>
            <select
              name="dewormingType"
              value={formData.dewormingType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary bg-white"
            >
              {DEWORMING_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha *</label>
            <input
              type="date"
              name="applicationDate"
              value={formData.applicationDate}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Costo Total ($) *</label>
            <input
              type="number"
              name="cost"
              value={formData.cost || ""}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              disabled={isProductSelected}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>
        </div>

        {/* Fila 2: Producto + Dosis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Producto *</label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="Nombre del producto"
              maxLength={100}
              disabled={isProductSelected}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Dosis *</label>
            <input
              type="text"
              name="dose"
              value={formData.dose}
              onChange={handleChange}
              placeholder={`Ej: ${doseAmount} ${useFullUnit 
                ? selectedProductData?.unit || "unidad" 
                : selectedProductData?.doseUnit || "dosis"
              }`}
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>
        </div>

        {/* Fila 3: Próxima aplicación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Próxima aplicación</label>
            <input
              type="date"
              name="nextApplicationDate"
              value={formData.nextApplicationDate}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>
        </div>
      </form>
    </div>
  );
}