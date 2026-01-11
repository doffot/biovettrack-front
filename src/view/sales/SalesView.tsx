// src/views/sales/SalesView.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Package,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  User
} from "lucide-react";
import { getProductsWithInventory } from "../../api/productAPI";
import { createInvoice } from "../../api/invoiceAPI";
import { toast } from "../../components/Toast";
import { PaymentModal } from "../../components/payment/PaymentModal";
import type { InvoiceItem, InvoiceFormData } from "../../types/invoice";
import type { ProductWithInventory } from "../../types/inventory";
import api from "../../lib/axios";
import { OwnerSelector } from "../../components/owners/OwnerSelector";

interface CartItem {
  product: ProductWithInventory;
  quantity: number;
  isFullUnit: boolean;
}

interface PaymentData {
  paymentMethodId?: string;
  reference?: string;
  addAmountPaidUSD: number;
  addAmountPaidBs: number;
  exchangeRate: number;
  isPartial: boolean;
  creditAmountUsed?: number;
}

export default function SalesView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<{ id: string; name: string; phone?: string } | null>(null);
  const [ownerError, setOwnerError] = useState("");
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);

  // Cargar productos activos con inventario
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products", "with-inventory"],
    queryFn: getProductsWithInventory,
  });

  // Filtrar productos con stock disponible
  const productsWithStock = useMemo(() => {
    return products.filter(product => {
      if (!product.divisible) {
        return product.inventory?.stockUnits && product.inventory.stockUnits > 0;
      }
      const totalDoses = (product.inventory?.stockUnits || 0) * product.dosesPerUnit + (product.inventory?.stockDoses || 0);
      return totalDoses > 0;
    });
  }, [products]);

  // Filtrar por búsqueda
  const filteredProducts = useMemo(() => {
    return productsWithStock.filter(product => {
      return (
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [productsWithStock, searchTerm]);

  // Calcular total del carrito
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      let itemCost = 0;
      if (item.isFullUnit) {
        itemCost = item.product.salePrice * item.quantity;
      } else {
        const pricePerDose = item.product.salePricePerDose ?? item.product.salePrice;
        itemCost = pricePerDose * item.quantity;
      }
      return total + itemCost;
    }, 0);
  }, [cart]);

  // Agregar producto al carrito
  const addToCart = (product: ProductWithInventory) => {
    const existingItem = cart.find(item => item.product._id === product._id);
    if (existingItem) {
      setCart(prev => prev.map(item => 
        item.product._id === product._id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      const newItem: CartItem = {
        product,
        quantity: 1,
        isFullUnit: !product.divisible,
      };
      setCart(prev => [...prev, newItem]);
    }
  };

  // Actualizar cantidad en el carrito
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prev => 
      prev.map(item => 
        item.product._id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Cambiar modo (unidad completa vs dosis)
  const toggleUnitMode = (productId: string) => {
    setCart(prev => 
      prev.map(item => 
        item.product._id === productId 
          ? { ...item, isFullUnit: !item.isFullUnit } 
          : item
      )
    );
  };

  // Eliminar del carrito
  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product._id !== productId));
  };

  // Validar antes de procesar venta
  const validateSale = (): boolean => {
    if (!selectedOwner) {
      setOwnerError("Debes seleccionar un cliente para procesar la venta");
      toast.error("Selecciona un cliente para continuar");
      return false;
    }
    
    if (cart.length === 0) {
      toast.error("Agrega productos al carrito primero");
      return false;
    }

    setOwnerError("");
    return true;
  };

  // Crear factura de venta
  const { mutate: createSaleInvoice, isPending: isCreatingInvoice } = useMutation({
    mutationFn: async () => {
      if (!validateSale()) {
        throw new Error("Validación fallida");
      }

      const invoiceItems: InvoiceItem[] = cart.map(item => {
        if (!item.product._id) {
          throw new Error(`Producto sin ID: ${item.product.name}`);
        }
        
        return {
          type: "producto" as const,
          resourceId: item.product._id,
          description: `${item.isFullUnit ? item.quantity + ' ' + item.product.unit : item.quantity + ' ' + item.product.doseUnit} de ${item.product.name}`,
          cost: item.isFullUnit 
            ? item.product.salePrice 
            : (item.product.salePricePerDose ?? item.product.salePrice),
          quantity: item.quantity,
        };
      });

      const invoiceData: InvoiceFormData = {
        items: invoiceItems,
        currency: "USD",
        total: cartTotal,
        amountPaid: 0,
        paymentStatus: "Pendiente",
        date: new Date().toISOString(),
        ownerId: selectedOwner!.id,
        ownerName: selectedOwner!.name,
        ownerPhone: selectedOwner!.phone,
      };

      return createInvoice(invoiceData);
    },
    onSuccess: (data) => {
      toast.success( "Factura creada correctamente");
      queryClient.invalidateQueries({ queryKey: ["inventory", "all"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      
      // Extraer el _id de la factura de forma segura
      let invoiceId: string | undefined;
      
      // Caso 1: La respuesta tiene directamente _id
      if ('_id' in data && typeof data._id === 'string') {
        invoiceId = data._id;
      }
      // Caso 2: La respuesta tiene una propiedad invoice con _id
      else if ('invoice' in data && data.invoice && typeof data.invoice === 'object' && '_id' in data.invoice) {
        invoiceId = data.invoice._id as string;
      }
      
      if (invoiceId) {
        setCreatedInvoiceId(invoiceId);
        setShowPaymentModal(true);
      } else {
        console.error("No se pudo obtener el ID de la factura:", data);
        toast.error("Factura creada pero no se puede procesar el pago");
      }
    },
    onError: (error: Error) => {
      if (error.message !== "Validación fallida") {
        toast.error(error.message || "Error al crear la factura");
      }
    },
  });

  // Procesar pago de la factura
  const { mutate: processPayment } = useMutation({
    mutationFn: async (paymentData: PaymentData) => {
      if (!createdInvoiceId) {
        throw new Error("No hay factura para procesar el pago");
      }

      const { data } = await api.post(`/invoices/${createdInvoiceId}/payments`, {
        paymentMethodId: paymentData.paymentMethodId,
        reference: paymentData.reference,
        amountPaidUSD: paymentData.addAmountPaidUSD,
        amountPaidBs: paymentData.addAmountPaidBs,
        exchangeRate: paymentData.exchangeRate,
        creditAmountUsed: paymentData.creditAmountUsed,
      });

      return data;
    },
    onSuccess: () => {
      toast.success("Pago procesado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "all"] });
      
      // Limpiar todo
      setShowPaymentModal(false);
      setCart([]);
      setSelectedOwner(null);
      setOwnerError("");
      setCreatedInvoiceId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.msg || error.message || "Error al procesar el pago");
    },
  });

  const handleCheckout = () => {
    createSaleInvoice();
  };

  const handlePaymentConfirm = async (paymentData: PaymentData) => {
    processPayment(paymentData);
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
  };

  if (loadingProducts) {
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
          <h1 className="text-xl font-semibold text-vet-text">Ventas de Productos</h1>
          <p className="text-sm text-vet-muted">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""} disponibles
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <ShoppingCart className="w-4 h-4 mr-1.5" />
          Volver
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: Catálogo de productos */}
        <div className="lg:col-span-2">
          {/* Búsqueda */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted" />
            <input
              type="text"
              placeholder="Buscar productos por nombre, categoría o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>

          {/* Lista de productos */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map((product) => {
                const inCart = cart.some(item => item.product._id === product._id);
                const inventory = product.inventory;
                const stockUnits = inventory?.stockUnits || 0;
                const stockDoses = inventory?.stockDoses || 0;
                const totalDoses = (stockUnits * product.dosesPerUnit) + stockDoses;

                return (
                  <div key={product._id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-vet-light rounded-lg">
                        <Package className="w-5 h-5 text-vet-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-vet-text truncate">{product.name}</h3>
                        <p className="text-xs text-vet-muted mt-1 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-vet-light text-vet-primary text-xs rounded-full capitalize">
                            {product.category}
                          </span>
                          {product.divisible && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Divisible
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Precios */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {product.divisible ? (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Unidad:</span>
                            <span className="font-medium">${product.salePrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{product.doseUnit}:</span>
                            <span className="font-medium">${(product.salePricePerDose ?? product.salePrice).toFixed(2)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{product.unit}:</span>
                          <span className="font-medium">${product.salePrice.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="mt-2 flex items-center gap-1 text-xs">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      {product.divisible ? (
                        <span className="text-amber-700">
                          {totalDoses} {product.doseUnit}{totalDoses !== 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-amber-700">
                          {stockUnits} {product.unit}{stockUnits !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Botón agregar */}
                    <button
                      onClick={() => addToCart(product)}
                      disabled={inCart}
                      className={`w-full mt-3 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        inCart
                          ? "bg-green-100 text-green-800 cursor-not-allowed"
                          : "bg-vet-primary hover:bg-vet-secondary text-white"
                      }`}
                    >
                      {inCart ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 inline mr-1" />
                          En carrito
                        </>
                      ) : (
                        "Agregar al carrito"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-vet-text mb-1">
                {searchTerm ? "Sin resultados" : "Sin productos disponibles"}
              </h3>
              <p className="text-sm text-vet-muted">
                {searchTerm 
                  ? "No hay productos con esos criterios" 
                  : "Registra productos y compra stock para venderlos aquí"}
              </p>
            </div>
          )}
        </div>

        {/* Columna derecha: Carrito */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-card sticky top-6">
            {/* Header del carrito */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-vet-text flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Carrito de Ventas
              </h2>
              <p className="text-sm text-vet-muted mt-1">
                {cart.length} producto{cart.length !== 1 ? "s" : ""} seleccionado{cart.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Selector de Cliente */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <OwnerSelector
                selectedOwner={selectedOwner}
                onSelectOwner={setSelectedOwner}
                required
                error={ownerError}
              />
            </div>

            {/* Items del carrito */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {cart.length > 0 ? (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.product._id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-vet-text text-sm truncate">{item.product.name}</h4>
                          <p className="text-xs text-vet-muted mt-1">
                            {item.isFullUnit 
                              ? `${item.quantity} ${item.product.unit}${item.quantity !== 1 ? "s" : ""}`
                              : `${item.quantity} ${item.product.doseUnit}${item.quantity !== 1 ? "s" : ""}`
                          }
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product._id as string)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Precio total del ítem */}
                      <div className="mt-2 text-sm font-medium text-vet-text">
                        ${(item.isFullUnit 
                          ? item.product.salePrice * item.quantity 
                          : (item.product.salePricePerDose ?? item.product.salePrice) * item.quantity
                        ).toFixed(2)}
                      </div>

                      {/* Controles de cantidad y modo */}
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product._id as string, item.quantity - 1)}
                            className="p-1 rounded border border-gray-300 hover:bg-gray-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product._id as string, parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                          />
                          <button
                            onClick={() => updateQuantity(item.product._id as string, item.quantity + 1)}
                            className="p-1 rounded border border-gray-300 hover:bg-gray-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {item.product.divisible && (
                          <button
                            onClick={() => toggleUnitMode(item.product._id as string)}
                            className="w-full text-xs text-vet-primary hover:text-vet-secondary font-medium"
                          >
                            {item.isFullUnit 
                              ? `Cambiar a ${item.product.doseUnit}` 
                              : `Cambiar a ${item.product.unit}`}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-vet-muted">
                  <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>Tu carrito está vacío</p>
                  <p className="text-xs mt-1">Agrega productos para comenzar</p>
                </div>
              )}
            </div>

            {/* Resumen y botón de pago */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-vet-text">Total:</span>
                <span className="text-xl font-bold text-vet-primary">${cartTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={!selectedOwner || cart.length === 0 || isCreatingInvoice}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2 ${
                  !selectedOwner || cart.length === 0 || isCreatingInvoice
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-vet-primary hover:bg-vet-secondary"
                }`}
              >
                {isCreatingInvoice ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Procesar Venta
                  </>
                )}
              </button>

              {!selectedOwner && cart.length > 0 && (
                <p className="mt-2 text-xs text-center text-amber-600 flex items-center justify-center gap-1">
                  <User className="w-3 h-3" />
                  Selecciona un cliente para continuar
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de pago */}
      {showPaymentModal && createdInvoiceId && (
        <PaymentModal
          isOpen={true}
          onClose={handlePaymentCancel}
          onConfirm={handlePaymentConfirm}
          amountUSD={cartTotal}
          title="Procesar Pago de Venta"
          subtitle={`Cliente: ${selectedOwner?.name || "N/A"}`}
          allowPartial={true}
          services={cart.map(item => ({
            description: `${item.isFullUnit ? item.quantity + ' ' + item.product.unit : item.quantity + ' ' + item.product.doseUnit} de ${item.product.name}`,
            quantity: item.quantity,
            unitPrice: item.isFullUnit 
              ? item.product.salePrice 
              : (item.product.salePricePerDose ?? item.product.salePrice),
            total: item.isFullUnit 
              ? item.product.salePrice * item.quantity 
              : (item.product.salePricePerDose ?? item.product.salePrice) * item.quantity,
          }))}
          owner={selectedOwner ? {
            name: selectedOwner.name,
            phone: selectedOwner.phone,
          } : undefined}
        />
      )}
    </div>
  );
}