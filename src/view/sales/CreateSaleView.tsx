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
  const [productSaleMode, setProductSaleMode] = useState<{ [key: string]: boolean }>({});

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products", "with-inventory"],
    queryFn: getProductsWithInventory,
  });

  const productsWithStock = useMemo(() => {
    return products.filter(product => {
      if (!product.divisible) {
        return product.inventory?.stockUnits && product.inventory.stockUnits > 0;
      }
      const totalDoses = (product.inventory?.stockUnits || 0) * product.dosesPerUnit + (product.inventory?.stockDoses || 0);
      return totalDoses > 0;
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    return productsWithStock.filter(product => {
      return (
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [productsWithStock, searchTerm]);

  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const itemDiscounts = cart.reduce((sum, item) => sum + item.discount, 0);
    const total = Math.max(0, subtotal - itemDiscounts - discountTotal);
    return { subtotal, itemDiscounts, total };
  }, [cart, discountTotal]);

  const getAvailableStock = useCallback((product: ProductWithInventory, isFullUnit: boolean): number => {
    if (!product.inventory) return 0;
    if (isFullUnit) return product.inventory.stockUnits;
    return product.inventory.stockUnits * product.dosesPerUnit + product.inventory.stockDoses;
  }, []);

  const addToCart = useCallback((product: ProductWithInventory) => {
    if (!product._id) return;
    
    const productId = product._id;
    const isFullUnit = product.divisible ? (productSaleMode[productId] ?? true) : true;
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

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter(item => item.productId !== productId));
  }, []);

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
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-vet-light)]">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-3">
            <div className="absolute inset-0 border-3 border-[var(--color-border)] rounded-full"></div>
            <div className="absolute inset-0 border-3 border-[var(--color-vet-primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[var(--color-vet-muted)] text-sm">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-vet-light)]">
      {/* Spacer para header mobile/desktop */}
      <div className="h-4 lg:h-0" />

      {/* Header Compacto - Sticky */}
      <div className="sticky top-14 lg:top-0 z-30 bg-[var(--color-card)]/95 backdrop-blur-lg border-b border-[var(--color-border)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 h-14">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-[var(--color-hover)] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--color-vet-text)]" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] rounded-lg">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-[var(--color-vet-text)]">Punto de Venta</h1>
                <p className="text-xs text-[var(--color-vet-muted)]">
                  {filteredProducts.length} productos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Columna Izquierda: Productos */}
          <div className="lg:col-span-2 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm">
            {/* Búsqueda */}
            <div className="p-4 border-b border-[var(--color-border)]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-vet-muted)]" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-vet-light)] border border-[var(--color-border)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] transition-all"
                />
              </div>
            </div>

            {/* Tabla Desktop / Cards Mobile */}
            <div className="max-h-[500px] lg:max-h-[600px] overflow-auto custom-scrollbar">
              {filteredProducts.length > 0 ? (
                <>
                  {/* Desktop Table */}
                  <table className="hidden md:table w-full text-sm">
                    <thead className="sticky top-0 bg-[var(--color-hover)] border-b border-[var(--color-border)] z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-vet-muted)] uppercase">Producto</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-vet-muted)] uppercase">Precio</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-vet-muted)] uppercase">Stock</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--color-vet-muted)] uppercase">Modo</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--color-vet-muted)] uppercase">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {filteredProducts.map((product) => {
                        if (!product._id) return null;
                        
                        const inCart = cart.some(item => item.productId === product._id);
                        const inventory = product.inventory;
                        const stockUnits = inventory?.stockUnits || 0;
                        const stockDoses = inventory?.stockDoses || 0;
                        const totalDoses = (stockUnits * product.dosesPerUnit) + stockDoses;
                        const isFullUnitMode = productSaleMode[product._id] ?? true;

                        return (
                          <tr key={product._id} className="hover:bg-[var(--color-hover)] transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-[var(--color-vet-light)] rounded-lg border border-[var(--color-border)]">
                                  <Package className="w-4 h-4 text-[var(--color-vet-primary)]" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-[var(--color-vet-text)]">{product.name}</p>
                                  <p className="text-xs text-[var(--color-vet-muted)] capitalize">{product.category}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {product.divisible ? (
                                <div>
                                  <p className="text-sm font-medium text-[var(--color-vet-text)]">
                                    ${isFullUnitMode 
                                      ? product.salePrice.toFixed(2) 
                                      : (product.salePricePerDose ?? product.salePrice).toFixed(2)
                                    }
                                  </p>
                                  <p className="text-xs text-[var(--color-vet-muted)]">
                                    {isFullUnitMode ? product.unit : product.doseUnit}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm font-medium text-[var(--color-vet-text)]">${product.salePrice.toFixed(2)}</p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                {product.divisible ? (
                                  <span className="text-sm text-amber-600 dark:text-amber-400">
                                    {totalDoses} {product.doseUnit}
                                  </span>
                                ) : (
                                  <span className="text-sm text-amber-600 dark:text-amber-400">
                                    {stockUnits} {product.unit}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {product.divisible ? (
                                <div className="flex gap-1 justify-center">
                                  <button
                                    onClick={() => setProductSaleMode(prev => ({ ...prev, [product._id!]: true }))}
                                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                      isFullUnitMode
                                        ? "bg-[var(--color-vet-primary)] text-white shadow-sm"
                                        : "bg-[var(--color-vet-light)] text-[var(--color-vet-muted)] hover:bg-[var(--color-hover)] border border-[var(--color-border)]"
                                    }`}
                                  >
                                    {product.unit}
                                  </button>
                                  <button
                                    onClick={() => setProductSaleMode(prev => ({ ...prev, [product._id!]: false }))}
                                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                      !isFullUnitMode
                                        ? "bg-[var(--color-vet-primary)] text-white shadow-sm"
                                        : "bg-[var(--color-vet-light)] text-[var(--color-vet-muted)] hover:bg-[var(--color-hover)] border border-[var(--color-border)]"
                                    }`}
                                  >
                                    {product.doseUnit}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-[var(--color-vet-muted)] text-center block">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => addToCart(product)}
                                disabled={inCart}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  inCart
                                    ? "bg-[var(--color-vet-accent)]/10 text-[var(--color-vet-accent)] cursor-not-allowed border border-[var(--color-vet-accent)]/20"
                                    : "bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] hover:shadow-md text-white"
                                }`}
                              >
                                {inCart ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    En carrito
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5" />
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

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y divide-[var(--color-border)]">
                    {filteredProducts.map((product) => {
                      if (!product._id) return null;
                      
                      const inCart = cart.some(item => item.productId === product._id);
                      const inventory = product.inventory;
                      const stockUnits = inventory?.stockUnits || 0;
                      const stockDoses = inventory?.stockDoses || 0;
                      const totalDoses = (stockUnits * product.dosesPerUnit) + stockDoses;
                      const isFullUnitMode = productSaleMode[product._id] ?? true;

                      return (
                        <div key={product._id} className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="p-2 bg-[var(--color-vet-light)] rounded-lg border border-[var(--color-border)] flex-shrink-0">
                                <Package className="w-5 h-5 text-[var(--color-vet-primary)]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[var(--color-vet-text)] truncate">{product.name}</p>
                                <p className="text-xs text-[var(--color-vet-muted)] capitalize">{product.category}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                  <span className="text-xs text-amber-600 dark:text-amber-400">
                                    {product.divisible 
                                      ? `${totalDoses} ${product.doseUnit}` 
                                      : `${stockUnits} ${product.unit}`
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-[var(--color-vet-text)]">
                                ${isFullUnitMode 
                                  ? product.salePrice.toFixed(2) 
                                  : (product.salePricePerDose ?? product.salePrice).toFixed(2)
                                }
                              </p>
                              <p className="text-xs text-[var(--color-vet-muted)]">
                                {isFullUnitMode ? product.unit : product.doseUnit}
                              </p>
                            </div>
                          </div>

                          {product.divisible && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => setProductSaleMode(prev => ({ ...prev, [product._id!]: true }))}
                                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                  isFullUnitMode
                                    ? "bg-[var(--color-vet-primary)] text-white shadow-sm"
                                    : "bg-[var(--color-vet-light)] text-[var(--color-vet-muted)] border border-[var(--color-border)]"
                                }`}
                              >
                                {product.unit}
                              </button>
                              <button
                                onClick={() => setProductSaleMode(prev => ({ ...prev, [product._id!]: false }))}
                                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                  !isFullUnitMode
                                    ? "bg-[var(--color-vet-primary)] text-white shadow-sm"
                                    : "bg-[var(--color-vet-light)] text-[var(--color-vet-muted)] border border-[var(--color-border)]"
                                }`}
                              >
                                {product.doseUnit}
                              </button>
                            </div>
                          )}

                          <button
                            onClick={() => addToCart(product)}
                            disabled={inCart}
                            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                              inCart
                                ? "bg-[var(--color-vet-accent)]/10 text-[var(--color-vet-accent)] cursor-not-allowed border border-[var(--color-vet-accent)]/20"
                                : "bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] hover:shadow-lg text-white"
                            }`}
                          >
                            {inCart ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                En carrito
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                Agregar al carrito
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-vet-light)] rounded-xl flex items-center justify-center border border-[var(--color-border)]">
                      <Package className="w-8 h-8 text-[var(--color-vet-muted)]" />
                    </div>
                    <h3 className="text-base font-medium text-[var(--color-vet-text)] mb-1">
                      {searchTerm ? "Sin resultados" : "Sin productos disponibles"}
                    </h3>
                    <p className="text-sm text-[var(--color-vet-muted)]">
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
          <div className="lg:col-span-1 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm lg:sticky lg:top-28 lg:self-start">
            {/* Header del Carrito */}
            <div className="p-4 border-b border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[var(--color-vet-text)] flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[var(--color-vet-primary)]" />
                  Carrito
                </h2>
                <span className="text-xs px-2 py-1 bg-[var(--color-vet-primary)]/10 text-[var(--color-vet-primary)] rounded-full font-medium">
                  {cart.length}
                </span>
              </div>
              
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
            <div className="max-h-[300px] lg:max-h-[400px] overflow-auto p-3 custom-scrollbar bg-[var(--color-vet-light)]/30">
              {cart.length > 0 ? (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.productId} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-3 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                          <span className="text-sm font-medium text-[var(--color-vet-text)] truncate">
                            {item.productName}
                          </span>

                          {item.isDivisible && (
                            <button
                              onClick={() => toggleUnitMode(item.productId)}
                              className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-vet-light)] text-[var(--color-vet-primary)] hover:bg-[var(--color-hover)] flex-shrink-0 border border-[var(--color-border)] transition-colors"
                              title="Cambiar modo"
                            >
                              {item.isFullUnit ? item.unit : item.doseUnit}
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-1 rounded border border-[var(--color-border)] hover:bg-[var(--color-hover)] transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5 text-[var(--color-vet-text)]" />
                          </button>
                          <span className="text-sm font-medium text-[var(--color-vet-text)] min-w-[32px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="p-1 rounded border border-[var(--color-border)] hover:bg-[var(--color-hover)] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 text-[var(--color-vet-text)]" />
                          </button>
                        </div>

                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          ${item.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-40">
                  <div className="text-center">
                    <ShoppingCart className="w-12 h-12 mx-auto text-[var(--color-vet-muted)]/30 mb-2" />
                    <p className="text-[var(--color-vet-muted)] text-sm">Carrito vacío</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer del Carrito */}
            <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-vet-light)]/30">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-[var(--color-vet-muted)]">Total:</span>
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${cartTotals.total.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={!selectedOwner || cart.length === 0 || isProcessing}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                  !selectedOwner || cart.length === 0 || isProcessing
                    ? "bg-[var(--color-border)] cursor-not-allowed"
                    : "bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Procesar Venta
                  </>
                )}
              </button>

              {!selectedOwner && cart.length > 0 && (
                <p className="mt-3 text-xs text-center text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Selecciona un cliente para continuar
                </p>
              )}
            </div>
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