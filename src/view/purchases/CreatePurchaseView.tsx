// src/views/purchases/CreatePurchaseView.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Loader2, 
  ShoppingCart,
  Receipt,
  Tag,
  CreditCard,
  Plus,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { createPurchase } from "../../api/purchaseAPI";
import { getActiveProducts } from "../../api/productAPI";
import { toast } from "../../components/Toast";
import type { PurchaseFormData, PurchaseItemFormData } from "../../types/purchase";

const initialItem: PurchaseItemFormData = {
  productId: "",
  productName: "",
  quantity: 1,
  unitCost: 0,
};

const paymentMethods = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "otro", label: "Otro" },
];

export default function CreatePurchaseView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<PurchaseFormData>({
    provider: "",
    paymentMethod: "efectivo",
    items: [initialItem],
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: products = [] } = useQuery({
    queryKey: ["products", "active"],
    queryFn: getActiveProducts,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createPurchase,
    onSuccess: () => {
      toast.success("Compra registrada correctamente");
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      navigate("/purchases");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (
    index: number,
    field: keyof PurchaseItemFormData,
    value: string | number
  ) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === "productId" && typeof value === "string") {
      const product = products.find(p => p._id === value);
      newItems[index] = { 
        ...newItems[index], 
        productId: value,
        productName: product?.name || ""
      };
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({ ...prev, items: [...prev.items, initialItem] }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length <= 1) {
      toast.error("Debe mantener al menos un producto");
      return;
    }
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.quantity * item.unitCost);
    }, 0);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "El método de pago es obligatorio";
    }
    
    formData.items.forEach((item, index) => {
      if (!item.productId) {
        newErrors[`items[${index}].productId`] = "Seleccione un producto";
      }
      if (item.quantity <= 0) {
        newErrors[`items[${index}].quantity`] = "La cantidad debe ser mayor a 0";
      }
      if (item.unitCost < 0) {
        newErrors[`items[${index}].unitCost`] = "El costo no puede ser negativo";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Complete los campos obligatorios correctamente");
      return;
    }
    
    const validItems = formData.items.filter(item => item.productId);
    
    if (validItems.length === 0) {
      toast.error("Debe agregar al menos un producto");
      return;
    }
    
    mutate({ ...formData, items: validItems });
  };

  const isValid = formData.items.some(item => item.productId) && !!formData.paymentMethod;
  const totalAmount = calculateTotal();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 lg:px-6">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] hover:bg-[var(--color-hover)] text-[var(--color-vet-muted)] transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] rounded-xl shadow-md">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[var(--color-vet-text)]">Nueva Compra</h1>
            <p className="text-sm text-[var(--color-vet-muted)]">Registra una compra de productos para tu inventario</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm">
          <div className="p-6">
            
            {/* Proveedor y método de pago */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-vet-text)] mb-2">
                  <Tag className="w-4 h-4 text-[var(--color-vet-primary)]" />
                  Proveedor (opcional)
                </label>
                <input
                  type="text"
                  name="provider"
                  value={formData.provider || ""}
                  onChange={handleInputChange}
                  placeholder="Nombre del proveedor"
                  maxLength={100}
                  className="w-full px-4 py-2.5 bg-[var(--color-vet-light)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-vet-text)] mb-2">
                  <CreditCard className="w-4 h-4 text-[var(--color-vet-primary)]" />
                  Método de pago <span className="text-red-500">*</span>
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-[var(--color-vet-light)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-vet-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] transition-all"
                >
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </select>
                {errors.paymentMethod && (
                  <p className="text-xs text-red-500 mt-1">{errors.paymentMethod}</p>
                )}
              </div>
            </div>

            {/* Notas */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-vet-text)] mb-2">
                <Receipt className="w-4 h-4 text-[var(--color-vet-muted)]" />
                Notas (opcional)
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                placeholder="Detalles adicionales sobre la compra..."
                maxLength={200}
                rows={2}
                className="w-full px-4 py-2.5 bg-[var(--color-vet-light)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] transition-all resize-none"
              />
            </div>

            {/* Tabla de productos */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[var(--color-vet-text)]">Productos de la compra</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[var(--color-vet-primary)] font-medium bg-[var(--color-vet-primary)]/10 border border-[var(--color-vet-primary)]/20 rounded-lg hover:bg-[var(--color-vet-primary)]/20 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Agregar producto
                </button>
              </div>
              
              <div className="border border-[var(--color-border)] rounded-xl overflow-hidden">
                {/* Header de la tabla - Solo desktop */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-[var(--color-hover)] text-xs font-medium text-[var(--color-vet-muted)] uppercase tracking-wide">
                  <div className="col-span-5">Producto</div>
                  <div className="col-span-2 text-center">Cantidad</div>
                  <div className="col-span-2 text-center">Costo unit.</div>
                  <div className="col-span-2 text-center">Total</div>
                  <div className="col-span-1"></div>
                </div>
                
                {/* Items */}
                {formData.items.map((item, index) => (
                  <div 
                    key={index} 
                    className="border-b border-[var(--color-border)] last:border-0 p-4 md:p-0"
                  >
                    {/* Mobile Layout */}
                    <div className="md:hidden space-y-3">
                      <div>
                        <label className="text-xs font-medium text-[var(--color-vet-muted)] mb-1 block">Producto</label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                          className="w-full text-sm bg-[var(--color-vet-light)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-vet-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-vet-primary)] focus:border-[var(--color-vet-primary)]"
                        >
                          <option value="">-- Seleccione un producto --</option>
                          {products.map(product => (
                            <option key={product._id} value={product._id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                        {errors[`items[${index}].productId`] && (
                          <p className="text-xs text-red-500 mt-1">{errors[`items[${index}].productId`]}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-[var(--color-vet-muted)] mb-1 block">Cantidad</label>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={item.quantity || ""}
                            onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)}
                            className="w-full text-sm bg-[var(--color-vet-light)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-vet-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-vet-primary)] focus:border-[var(--color-vet-primary)]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[var(--color-vet-muted)] mb-1 block">Costo unit.</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitCost || ""}
                            onChange={(e) => handleItemChange(index, "unitCost", parseFloat(e.target.value) || 0)}
                            className="w-full text-sm bg-[var(--color-vet-light)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-vet-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-vet-primary)] focus:border-[var(--color-vet-primary)]"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                        <span className="text-sm font-semibold text-[var(--color-vet-text)]">
                          Total: ${(item.quantity * item.unitCost).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 items-center">
                      <div className="col-span-5">
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                          className="w-full text-sm bg-[var(--color-vet-light)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-vet-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-vet-primary)] focus:border-[var(--color-vet-primary)]"
                        >
                          <option value="">-- Seleccione un producto --</option>
                          {products.map(product => (
                            <option key={product._id} value={product._id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                        {errors[`items[${index}].productId`] && (
                          <p className="text-xs text-red-500 mt-1">{errors[`items[${index}].productId`]}</p>
                        )}
                      </div>
                      
                      <div className="col-span-2 flex justify-center">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity || ""}
                          onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)}
                          className="w-20 text-sm bg-[var(--color-vet-light)] border border-[var(--color-border)] rounded-lg px-2 py-2 text-center text-[var(--color-vet-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-vet-primary)] focus:border-[var(--color-vet-primary)]"
                        />
                      </div>
                      
                      <div className="col-span-2 flex justify-center">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitCost || ""}
                          onChange={(e) => handleItemChange(index, "unitCost", parseFloat(e.target.value) || 0)}
                          className="w-20 text-sm bg-[var(--color-vet-light)] border border-[var(--color-border)] rounded-lg px-2 py-2 text-center text-[var(--color-vet-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-vet-primary)] focus:border-[var(--color-vet-primary)]"
                        />
                      </div>
                      
                      <div className="col-span-2 flex justify-center">
                        <span className="text-sm font-semibold text-[var(--color-vet-text)]">
                          ${(item.quantity * item.unitCost).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-[var(--color-vet-primary)]/10 border border-[var(--color-vet-primary)]/20 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[var(--color-vet-primary)]/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-[var(--color-vet-primary)]" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[var(--color-vet-text)]">Resumen de la compra</span>
                    <p className="text-xs text-[var(--color-vet-muted)]">
                      Esta compra aumentará el stock de los productos seleccionados
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--color-vet-muted)]">Total</p>
                  <p className="text-2xl font-bold text-[var(--color-vet-primary)]">
                    ${totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-[var(--color-hover)] border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--color-vet-muted)]">
              <span className="text-red-500">*</span> Campos obligatorios
            </p>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm text-[var(--color-vet-text)] font-medium rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] hover:bg-[var(--color-hover)] transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isValid || isPending}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm rounded-xl font-semibold transition-all ${
                  isValid && !isPending
                    ? "bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-white"
                    : "bg-[var(--color-border)] text-[var(--color-vet-muted)] cursor-not-allowed"
                }`}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Registrar Compra
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}