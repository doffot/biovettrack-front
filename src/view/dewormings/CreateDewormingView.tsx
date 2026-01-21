// src/views/dewormings/CreateDewormingView.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Package } from "lucide-react";
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
      toast.success(
        "Desparasitación registrada", 
        "El tratamiento ha sido guardado exitosamente"
      );
      queryClient.invalidateQueries({ queryKey: ["dewormings", patientId] });
      navigate(-1);
    },
    onError: (error: Error) => {
      toast.error(
        "Error al registrar", 
        error.message || "No se pudo guardar la desparasitación"
      );
    },
  });

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
      toast.warning(
        "Campos incompletos", 
        "Por favor completa todos los campos obligatorios"
      );
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
    <div className="max-w-5xl mx-auto">
      {/* Header compacto */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-[var(--color-hover)] text-[var(--color-vet-muted)] hover:text-[var(--color-vet-text)] transition-colors"
            title="Volver"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-bold text-[var(--color-vet-text)]">Registrar Desparasitación</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selector de producto compacto */}
        <div className="bg-[var(--color-vet-primary)]/5 border border-[var(--color-vet-primary)]/20 rounded-lg p-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-vet-text)] mb-2">
            <Package className="w-3.5 h-3.5 text-[var(--color-vet-primary)]" />
            Producto del catálogo
          </label>
          <select
            value={selectedProduct}
            onChange={handleProductChange}
            className="w-full px-3 py-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] transition-all"
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
        </div>

        {/* Toggle y cantidad en línea */}
        {isProductSelected && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {isDivisible && (
              <div className="flex items-center p-2.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useFullUnit}
                    onChange={toggleUseFullUnit}
                    className="sr-only"
                  />
                  <div className={`relative w-9 h-5 rounded-full transition-colors ${
                    useFullUnit ? "bg-[var(--color-vet-primary)]" : "bg-[var(--color-border)]"
                  }`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                      useFullUnit ? "translate-x-4" : ""
                    }`} />
                  </div>
                  <span className="ml-2 text-xs font-medium text-[var(--color-vet-text)]">
                    {useFullUnit ? "Unidad completa" : "Dosis/fracción"}
                  </span>
                </label>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
                Cantidad ({useFullUnit 
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
                className="w-full px-3 py-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] transition-all"
              />
            </div>
          </div>
        )}

        {/* Grid compacto - TODO en una fila en desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              name="dewormingType"
              value={formData.dewormingType}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] transition-all"
            >
              {DEWORMING_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
              Fecha <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="applicationDate"
              value={formData.applicationDate}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
              Costo ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="cost"
              value={formData.cost || ""}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              disabled={isProductSelected}
              className="w-full px-3 py-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
              Producto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="Nombre del producto"
              maxLength={100}
              disabled={isProductSelected}
              className="w-full px-3 py-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            />
          </div>
        </div>

        {/* Segunda fila: Dosis y Próxima */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
              Dosis <span className="text-red-500">*</span>
            </label>
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
              className="w-full px-3 py-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-vet-text)] mb-1">
              Próxima aplicación <span className="text-[var(--color-vet-muted)] text-[10px]">(opcional)</span>
            </label>
            <input
              type="date"
              name="nextApplicationDate"
              value={formData.nextApplicationDate}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] text-[var(--color-vet-text)] transition-all"
            />
          </div>
        </div>

        {/* Botones compactos */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-[var(--color-hover)] hover:bg-[var(--color-border)] text-[var(--color-vet-text)] font-medium transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={!isValid || isPending}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}