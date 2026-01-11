// src/views/sales/CreateSaleView.tsx
import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ShoppingCart, Package } from "lucide-react";
import { createSale } from "../../api/saleAPI";
import { ClientSelectModal } from "../../components/sales/ClientSelectModal";
import { ProductSearch } from "../../components/sales/ProductSearch";
import { CartPanel } from "../../components/sales/CartPanel";
import { PaymentModal } from "../../components/payment/PaymentModal";
import { toast } from "../../components/Toast";
import type { CartItem, SaleFormData } from "../../types/sale";
import type { ProductWithInventory } from "../../types/inventory";

type SelectedClient = {
  id: string;
  name: string;
  phone?: string;
  creditBalance?: number;
} | null;

export default function CreateSaleView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showClientModal, setShowClientModal] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [client, setClient] = useState<SelectedClient>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [discountTotal, setDiscountTotal] = useState(0);
  
  // ✅ NUEVO: Tab activo para móvil (productos o carrito)
  const [mobileTab, setMobileTab] = useState<"products" | "cart">("products");

  const { mutate, isPending } = useMutation({
    mutationFn: createSale,
    onSuccess: (response) => {
      toast.success(
        `Venta registrada${response.changeAmount > 0 ? `. Cambio: $${response.changeAmount.toFixed(2)}` : ""}`
      );
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products", "with-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      if (client?.id) {
        queryClient.invalidateQueries({ queryKey: ["owner", client.id] });
        queryClient.invalidateQueries({ queryKey: ["owners"] });
      }
      navigate("/sales");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const itemDiscounts = cart.reduce((sum, item) => sum + item.discount, 0);
    const total = Math.max(0, subtotal - itemDiscounts - discountTotal);
    return { subtotal, itemDiscounts, total };
  }, [cart, discountTotal]);

  const paymentServices = useMemo(() => {
    return cart.map((item) => ({
      description: `${item.productName} (${item.quantity} ${item.isFullUnit ? item.unit : item.doseUnit})`,
      quantity: 1,
      unitPrice: item.total,
      total: item.total,
    }));
  }, [cart]);

  const getAvailableStock = useCallback((product: ProductWithInventory, isFullUnit: boolean): number => {
    if (!product.inventory) return 0;
    if (isFullUnit) return product.inventory.stockUnits;
    return product.inventory.stockUnits * product.dosesPerUnit + product.inventory.stockDoses;
  }, []);

  const handleAddProduct = useCallback((product: ProductWithInventory, isFullUnit: boolean) => {
    const availableStock = getAvailableStock(product, isFullUnit);

    if (availableStock <= 0) {
      toast.error(`Sin stock de "${product.name}"`);
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product._id && item.isFullUnit === isFullUnit
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
          productId: product._id!,
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
    
    // ✅ NUEVO: Feedback visual - mostrar carrito en móvil si se agrega producto
    // (opcional: descomentar si quieres que cambie automáticamente al carrito)
    // setMobileTab("cart");
  }, [getAvailableStock]);

  const handleUpdateQuantity = useCallback((index: number, newQuantity: number) => {
    setCart((prev) => {
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

  const handleToggleMode = useCallback((index: number) => {
    setCart((prev) => {
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

  const handleRemove = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handlePaymentConfirm = useCallback(
    (paymentData: {
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
        ...(client && { ownerId: client.id }),
      };

      mutate(formData);
      setShowPaymentModal(false);
    },
    [cart, discountTotal, client, mutate]
  );

  // ✅ Calcular total de items en carrito
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="p-2 md:p-4 h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-4rem)]">
      <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-vet-primary to-vet-secondary px-3 py-2.5 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <ShoppingCart className="w-5 h-5 text-white" />
            <h1 className="text-base font-bold text-white">Punto de Venta</h1>
          </div>
          
          {/* ✅ Badge del carrito en header (solo móvil) */}
          <div className="md:hidden">
            {cartItemCount > 0 && (
              <span className="px-2 py-0.5 bg-white text-vet-primary text-xs font-bold rounded-full">
                {cartItemCount}
              </span>
            )}
          </div>
        </header>

        {/* ✅ NUEVO: Tabs para móvil */}
        <div className="md:hidden flex border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setMobileTab("products")}
            className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              mobileTab === "products"
                ? "text-vet-primary border-b-2 border-vet-primary bg-vet-light/50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Package className="w-4 h-4" />
            Productos
          </button>
          <button
            onClick={() => setMobileTab("cart")}
            className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${
              mobileTab === "cart"
                ? "text-vet-primary border-b-2 border-vet-primary bg-vet-light/50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Carrito
            {cartItemCount > 0 && (
              <span className={`px-1.5 py-0.5 text-xs font-bold rounded-full ${
                mobileTab === "cart" 
                  ? "bg-vet-primary text-white" 
                  : "bg-gray-200 text-gray-600"
              }`}>
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        {/* Main content */}
        <main className="flex-1 flex overflow-hidden">
          {/* Panel de productos - Oculto en móvil cuando está en tab carrito */}
          <div className={`flex-1 flex flex-col overflow-hidden border-r border-gray-200 ${
            mobileTab === "cart" ? "hidden md:flex" : "flex"
          }`}>
            <ProductSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onAddProduct={handleAddProduct}
            />
          </div>

          {/* Panel del carrito - Oculto en móvil cuando está en tab productos */}
          <div className={`w-full md:w-[320px] lg:w-[350px] flex-shrink-0 flex flex-col overflow-hidden ${
            mobileTab === "products" ? "hidden md:flex" : "flex"
          }`}>
            <CartPanel
              client={client}
              cart={cart}
              discountTotal={discountTotal}
              isPending={isPending}
              onChangeClient={() => setShowClientModal(true)}
              onClearClient={() => setClient(null)}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemove}
              onToggleMode={handleToggleMode}
              onDiscountTotalChange={setDiscountTotal}
              onCheckout={() => setShowPaymentModal(true)}
            />
          </div>
        </main>

        {/* ✅ NUEVO: Botón flotante para ir al carrito en móvil (cuando hay items) */}
        {mobileTab === "products" && cartItemCount > 0 && (
          <div className="md:hidden absolute bottom-24 right-4">
            <button
              onClick={() => setMobileTab("cart")}
              className="flex items-center gap-2 px-4 py-3 bg-vet-primary text-white rounded-full shadow-lg hover:bg-vet-secondary transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="font-semibold">${cartTotals.total.toFixed(2)}</span>
              <span className="px-2 py-0.5 bg-white text-vet-primary text-xs font-bold rounded-full">
                {cartItemCount}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Modales */}
      <ClientSelectModal
        isOpen={showClientModal}
        onSelect={(selected) => {
          setClient(selected);
          setShowClientModal(false);
        }}
        onSkip={() => setShowClientModal(false)}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        amountUSD={cartTotals.total}
        creditBalance={client?.creditBalance || 0}
        services={paymentServices}
        owner={client ? { name: client.name, phone: client.phone } : undefined}
        title="Completar Venta"
        allowPartial={true}
      />
    </div>
  );
}