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

  // Cargar productos activos
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
    
    // Si se cambia el producto, actualizar el nombre
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
    
    // Filtrar items válidos (eliminar vacíos)
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
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-vet-text">Nueva Compra</h1>
              <p className="text-sm text-vet-muted">Registra una compra de productos para tu inventario</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="p-6">
              
              {/* Proveedor y método de pago */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-vet-text mb-2">
                    <Tag className="w-4 h-4 text-vet-primary" />
                    Proveedor (opcional)
                  </label>
                  <input
                    type="text"
                    name="provider"
                    value={formData.provider || ""}
                    onChange={handleInputChange}
                    placeholder="Nombre del proveedor"
                    maxLength={100}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-vet-text mb-2">
                    <CreditCard className="w-4 h-4 text-vet-primary" />
                    Método de pago <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
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
                <label className="flex items-center gap-2 text-sm font-semibold text-vet-text mb-2">
                  <Receipt className="w-4 h-4 text-gray-500" />
                  Notas (opcional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleInputChange}
                  placeholder="Detalles adicionales sobre la compra..."
                  maxLength={200}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                />
              </div>

              {/* Tabla de productos */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-vet-text">Productos de la compra</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-vet-primary font-medium bg-vet-light rounded-lg hover:bg-vet-primary/10 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Agregar producto
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500">
                    <div className="col-span-5">Producto</div>
                    <div className="col-span-2 text-center">Cantidad</div>
                    <div className="col-span-2 text-center">Costo unitario</div>
                    <div className="col-span-2 text-center">Total</div>
                    <div className="col-span-1"></div>
                  </div>
                  
                  {formData.items.map((item, index) => {
                    return (
                      <div key={index} className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 last:border-0">
                        <div className="col-span-5">
                          <select
                            value={item.productId}
                            onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-vet-primary focus:border-vet-primary"
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
                        
                        <div className="col-span-2 flex items-center justify-center">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={item.quantity || ""}
                            onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)}
                            className="w-20 text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:ring-1 focus:ring-vet-primary focus:border-vet-primary"
                          />
                          {errors[`items[${index}].quantity`] && (
                            <p className="text-xs text-red-500 mt-1">{errors[`items[${index}].quantity`]}</p>
                          )}
                        </div>
                        
                        <div className="col-span-2 flex items-center justify-center">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitCost || ""}
                            onChange={(e) => handleItemChange(index, "unitCost", parseFloat(e.target.value) || 0)}
                            className="w-20 text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:ring-1 focus:ring-vet-primary focus:border-vet-primary"
                          />
                          {errors[`items[${index}].unitCost`] && (
                            <p className="text-xs text-red-500 mt-1">{errors[`items[${index}].unitCost`]}</p>
                          )}
                        </div>
                        
                        <div className="col-span-2 flex items-center justify-center">
                          <span className="text-sm font-medium text-vet-text">
                            ${(item.quantity * item.unitCost).toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="col-span-1 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resumen */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">Resumen de la compra</span>
                  </div>
                  <div className="text-lg font-bold text-blue-900">
                    Total: ${totalAmount.toFixed(2)}
                  </div>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  Esta compra aumentará el stock de los productos seleccionados
                </p>
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
                  <ArrowLeft className="w-4 h-4" />
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
    </div>
  );
}