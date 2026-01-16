// src/views/sales/CreateSaleView.tsx
import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
  User,
  ArrowLeft
} from "lucide-react";
import { getProductsWithInventory } from "../../api/productAPI";
import { createSale } from "../../api/saleAPI";
import { PaymentModal } from "../../components/payment/PaymentModal";
import { toast } from "../../components/Toast";
import { showPaymentToast, showPaymentErrorToast } from "../../utils/paymentToasts";
import type { CartItem, SaleFormData } from "../../types/sale";
import type { ProductWithInventory } from "../../types/inventory";
import { OwnerSelector } from "../../components/owners/OwnerSelector";

type SelectedClient = {
  id: string;
  name: string;
  phone?: string;
  creditBalance?: number;
} | null;

export default function CreateSaleView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<SelectedClient>(null);
  const [ownerError, setOwnerError] = useState("");
  const [discountTotal, setDiscountTotal] = useState(0);
  
  // Estado para modo de venta por producto
  const [productSaleMode, setProductSaleMode] = useState<{ [key: string]: boolean }>({});

  // Cargar productos con inventario
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products", "with-inventory"],
    queryFn: getProductsWithInventory,
  });

  // Filtrar productos con stock
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

  // Calcular totales
  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const itemDiscounts = cart.reduce((sum, item) => sum + item.discount, 0);
    const total = Math.max(0, subtotal - itemDiscounts - discountTotal);
    return { subtotal, itemDiscounts, total };
  }, [cart, discountTotal]);

  // Obtener stock disponible
  const getAvailableStock = useCallback((product: ProductWithInventory, isFullUnit: boolean): number => {
    if (!product.inventory) return 0;
    if (isFullUnit) return product.inventory.stockUnits;
    return product.inventory.stockUnits * product.dosesPerUnit + product.inventory.stockDoses;
  }, []);

  // Agregar producto al carrito
  const addToCart = useCallback((product: ProductWithInventory) => {
    if (!product._id) return;
    
    const productId = product._id; // Guardamos en variable para TypeScript
    
    const isFullUnit = product.divisible 
      ? (productSaleMode[productId] ?? true) 
      : true;
    
    const availableStock = getAvailableStock(product, isFullUnit);

    if (availableStock <= 0) {
      toast.error(`No hay stock disponible de "${product.name}"`);
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === productId && item.isFullUnit === isFullUnit
      );

      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        if (existing.quantity >= availableStock) {
          toast.error(`Stock máximo: ${availableStock}`);
          return prev;
        }

        const updated = [...prev];
        const item = updated[existingIndex];
        const price = isFullUnit ? item.unitPrice : item.pricePerDose || item.unitPrice;
        item.quantity += 1;
        item.subtotal = price * item.quantity;
        item.total = item.subtotal - item.discount;
        return updated;
      }

      const unitPrice = product.salePrice;
      const pricePerDose = product.salePricePerDose || product.salePrice;
      const price = isFullUnit ? unitPrice : pricePerDose;

      return [
        ...prev,
        {
          productId,
          productName: product.name,
          quantity: 1,
          isFullUnit,
          unitPrice,
          pricePerDose,
          subtotal: price,
          discount: 0,
          total: price,
          unit: product.unit,
          doseUnit: product.doseUnit,
          availableStock,
          isDivisible: product.divisible || false,
        },
      ];
    });
  }, [productSaleMode, getAvailableStock]);

  // Actualizar cantidad
  const updateQuantity = useCallback((productId: string, newQuantity: number) => {
    setCart((prev) => {
      const index = prev.findIndex(item => item.productId === productId);
      if (index < 0) return prev;

      const updated = [...prev];
      const item = updated[index];

      if (newQuantity <= 0) {
        updated.splice(index, 1);
        return updated;
      }

      if (newQuantity > item.availableStock) {
        toast.error(`Stock máximo: ${item.availableStock}`);
        return prev;
      }

      const price = item.isFullUnit ? item.unitPrice : item.pricePerDose || item.unitPrice;
      item.quantity = newQuantity;
      item.subtotal = price * newQuantity;
      item.total = item.subtotal - item.discount;
      return updated;
    });
  }, []);

  // Cambiar modo en carrito
  const toggleUnitMode = useCallback((productId: string) => {
    setCart((prev) => {
      const index = prev.findIndex(item => item.productId === productId);
      if (index < 0) return prev;

      const updated = [...prev];
      const item = updated[index];

      if (!item.isDivisible) return prev;

      const newIsFullUnit = !item.isFullUnit;
      const newPrice = newIsFullUnit ? item.unitPrice : item.pricePerDose || item.unitPrice;

      item.isFullUnit = newIsFullUnit;
      item.subtotal = newPrice * item.quantity;
      item.total = item.subtotal - item.discount;
      return updated;
    });
  }, []);

  // Eliminar del carrito
  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter(item => item.productId !== productId));
  }, []);

  // Validar venta
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

  // Mutación para crear venta
  const { mutate: createSaleMutation, isPending: isProcessing } = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products", "with-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      if (selectedOwner?.id) {
        queryClient.invalidateQueries({ queryKey: ["owner", selectedOwner.id] });
        queryClient.invalidateQueries({ queryKey: ["owners"] });
      }
      
      // Limpiar estado
      setCart([]);
      setSelectedOwner(null);
      setDiscountTotal(0);
      setSearchTerm("");
      setShowPaymentModal(false);
      
      toast.success("Venta procesada exitosamente");
      navigate("/");
    },
    onError: (error: Error) => {
      showPaymentErrorToast(error.message);
    },
  });

  // Procesar pago
  const handlePaymentConfirm = useCallback((paymentData: {
    paymentMethodId?: string;
    reference?: string;
    addAmountPaidUSD: number;
    addAmountPaidBs: number;
    exchangeRate: number;
    isPartial: boolean;
    creditAmountUsed?: number;
  }) => {
    const formData: SaleFormData = {
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        isFullUnit: item.isFullUnit,
        discount: item.discount,
      })),
      discountTotal,
      amountPaidUSD: paymentData.addAmountPaidUSD,
      amountPaidBs: paymentData.addAmountPaidBs,
      creditUsed: paymentData.creditAmountUsed || 0,
      exchangeRate: paymentData.exchangeRate,
      paymentMethodId: paymentData.paymentMethodId,
      paymentReference: paymentData.reference,
      ...(selectedOwner && { ownerId: selectedOwner.id }),
    };

    // Toast personalizado
    const isPayingInBs = paymentData.addAmountPaidBs > 0;
    const amount = isPayingInBs ? paymentData.addAmountPaidBs : paymentData.addAmountPaidUSD;
    const currency: "USD" | "Bs" = isPayingInBs ? "Bs" : "USD";

    const itemCount = cart.length;
    const itemDescription = itemCount === 1 
      ? cart[0].productName 
      : `${itemCount} producto${itemCount > 1 ? "s" : ""}`;

    showPaymentToast({
      amountPaid: amount,
      currency,
      isPartial: paymentData.isPartial,
      creditUsed: paymentData.creditAmountUsed,
      invoiceDescription: itemDescription,
    });

    createSaleMutation(formData);
  }, [cart, discountTotal, selectedOwner, createSaleMutation]);

  const handleCheckout = () => {
    if (!validateSale()) return;
    setShowPaymentModal(true);
  };

  if (loadingProducts) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto border-3 border-vet-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-vet-muted text-sm">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-vet-light">
      {/* Header Compacto */}
      <div className="flex-shrink-0 px-6 py-2.5 bg-sky-soft border-b border-vet-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 hover:bg-vet-hover rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-vet-text" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-vet-text">Punto de Venta</h1>
              <p className="text-xs text-vet-muted">
                {filteredProducts.length} productos disponibles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 p-3 overflow-hidden">
        {/* Columna Izquierda: Productos */}
        <div className="lg:col-span-2 flex flex-col bg-sky-soft rounded-xl border border-vet-border overflow-hidden">
          {/* Búsqueda */}
          <div className="flex-shrink-0 p-3 border-b border-vet-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 bg-vet-light border border-vet-border text-vet-text placeholder-vet-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
              />
            </div>
          </div>

          {/* Tabla de Productos */}
          <div className="flex-1 overflow-auto">
            {filteredProducts.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-vet-light border-b border-vet-border">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-vet-muted uppercase">Producto</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-vet-muted uppercase">Precio</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-vet-muted uppercase">Stock</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-vet-muted uppercase">Modo</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-vet-muted uppercase">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vet-border">
                  {filteredProducts.map((product) => {
                    if (!product._id) return null;
                    
                    const inCart = cart.some(item => item.productId === product._id);
                    const inventory = product.inventory;
                    const stockUnits = inventory?.stockUnits || 0;
                    const stockDoses = inventory?.stockDoses || 0;
                    const totalDoses = (stockUnits * product.dosesPerUnit) + stockDoses;
                    const isFullUnitMode = productSaleMode[product._id] ?? true;

                    return (
                      <tr key={product._id} className="hover:bg-vet-light/50 transition-colors">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-vet-light rounded-lg flex-shrink-0">
                              <Package className="w-3.5 h-3.5 text-vet-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-vet-text truncate">{product.name}</p>
                              <p className="text-xs text-vet-muted capitalize">{product.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          {product.divisible ? (
                            <div className="text-xs">
                              <p className="text-vet-text font-medium">
                                ${isFullUnitMode 
                                  ? product.salePrice.toFixed(2) 
                                  : (product.salePricePerDose ?? product.salePrice).toFixed(2)
                                }
                              </p>
                              <p className="text-vet-muted text-xs">
                                {isFullUnitMode ? product.unit : product.doseUnit}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs font-medium text-vet-text">${product.salePrice.toFixed(2)}</p>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                            {product.divisible ? (
                              <span className="text-xs text-amber-600">
                                {totalDoses} {product.doseUnit}
                              </span>
                            ) : (
                              <span className="text-xs text-amber-600">
                                {stockUnits} {product.unit}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          {product.divisible ? (
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => setProductSaleMode(prev => ({ ...prev, [product._id!]: true }))}
                                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                                  isFullUnitMode
                                    ? "bg-vet-primary text-white"
                                    : "bg-vet-light text-vet-muted hover:bg-vet-hover"
                                }`}
                              >
                                {product.unit}
                              </button>
                              <button
                                onClick={() => setProductSaleMode(prev => ({ ...prev, [product._id!]: false }))}
                                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                                  !isFullUnitMode
                                    ? "bg-vet-primary text-white"
                                    : "bg-vet-light text-vet-muted hover:bg-vet-hover"
                                }`}
                              >
                                {product.doseUnit}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-vet-muted text-center block">N/A</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => addToCart(product)}
                            disabled={inCart}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                              inCart
                                ? "bg-vet-accent/20 text-vet-accent cursor-not-allowed"
                                : "bg-vet-primary hover:bg-vet-secondary text-white"
                            }`}
                          >
                            {inCart ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                En carrito
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                Agregar
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-vet-light rounded-xl flex items-center justify-center">
                    <Package className="w-8 h-8 text-vet-muted" />
                  </div>
                  <h3 className="text-lg font-medium text-vet-text mb-1">
                    {searchTerm ? "Sin resultados" : "Sin productos disponibles"}
                  </h3>
                  <p className="text-sm text-vet-muted">
                    {searchTerm 
                      ? "No hay productos con esos criterios" 
                      : "Registra productos para venderlos"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Carrito */}
        <div className="lg:col-span-1 flex flex-col bg-sky-soft rounded-xl border border-vet-border overflow-hidden">
          {/* Header del Carrito */}
          <div className="flex-shrink-0 p-3 border-b border-vet-border">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-vet-text flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Carrito
              </h2>
              <span className="text-xs text-vet-muted">
                {cart.length} item{cart.length !== 1 ? "s" : ""}
              </span>
            </div>
            
            {/* Selector de Cliente */}
            <OwnerSelector
              selectedOwner={selectedOwner ? {id: selectedOwner.id, name: selectedOwner.name, phone: selectedOwner.phone} : null}
              onSelectOwner={(owner) => setSelectedOwner(owner ? {
                id: owner.id,
                name: owner.name,
                phone: owner.phone,
                creditBalance: 0
              } : null)}
              required
              error={ownerError}
            />
          </div>

          {/* Items del Carrito */}
          <div className="flex-1 overflow-auto p-1.5">
            {cart.length > 0 ? (
              <div className="space-y-1">
                {cart.map((item) => (
                  <div key={item.productId} className="bg-vet-light border border-vet-border rounded p-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 flex-1 min-w-0 mr-1">
                        <span className="text-xs font-medium text-vet-text truncate">
                          {item.productName}
                        </span>

                        {item.isDivisible && (
                          <button
                            onClick={() => toggleUnitMode(item.productId)}
                            className="text-[10px] px-1 py-0.5 rounded bg-vet-light text-vet-primary hover:bg-vet-hover flex-shrink-0 border border-vet-primary/20"
                            title="Cambiar modo"
                          >
                            {item.isFullUnit ? "completo" : "dosis"}
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-0.5 text-vet-danger hover:bg-vet-danger/10 rounded transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-0.5 rounded border border-vet-border hover:bg-vet-hover transition-colors"
                        >
                          <Minus className="w-2.5 h-2.5 text-vet-text" />
                        </button>
                        <span className="text-xs font-medium text-vet-text min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-0.5 rounded border border-vet-border hover:bg-vet-hover transition-colors"
                        >
                          <Plus className="w-2.5 h-2.5 text-vet-text" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-emerald-400">
                        ${item.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <ShoppingCart className="w-8 h-8 mx-auto text-vet-muted/30 mb-2" />
                  <p className="text-vet-muted text-xs">Carrito vacío</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer del Carrito */}
          <div className="flex-shrink-0 p-3 border-t border-vet-border bg-vet-light">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-vet-muted">Total:</span>
              <span className="text-3xl font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                ${cartTotals.total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={!selectedOwner || cart.length === 0 || isProcessing}
              className={`w-full py-2.5 px-4 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2 ${
                !selectedOwner || cart.length === 0 || isProcessing
                  ? "bg-vet-muted/50 cursor-not-allowed"
                  : "bg-vet-primary hover:bg-vet-secondary"
              }`}
            >
              {isProcessing ? (
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
                Selecciona un cliente
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal de pago */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        amountUSD={cartTotals.total}
        creditBalance={selectedOwner?.creditBalance || 0}
        services={cart.map(item => ({
          description: `${item.productName} (${item.quantity} ${item.isFullUnit ? item.unit : item.doseUnit})`,
          quantity: 1,
          unitPrice: item.total,
          total: item.total,
        }))}
        owner={selectedOwner ? { name: selectedOwner.name, phone: selectedOwner.phone } : undefined}
        title="Completar Venta"
        allowPartial={true}
      />
    </div>
  );
}