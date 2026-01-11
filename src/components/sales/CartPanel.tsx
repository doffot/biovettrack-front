// src/components/sales/CartPanel.tsx
import { User, ShoppingCart, X, Receipt, Loader2 } from "lucide-react";
import { CartItem } from "./CartItem";
import type { CartItem as CartItemType } from "../../types/sale";

type SelectedClient = {
  id: string;
  name: string;
  phone?: string;
  creditBalance?: number;
} | null;

interface CartPanelProps {
  client: SelectedClient;
  cart: CartItemType[];
  discountTotal: number;
  isPending: boolean;
  onChangeClient: () => void;
  onClearClient: () => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemove: (index: number) => void;
  onToggleMode: (index: number) => void;
  onDiscountTotalChange: (discount: number) => void;
  onCheckout: () => void;
}

export function CartPanel({
  client,
  cart,
  discountTotal,
  isPending,
  onChangeClient,
  onClearClient,
  onUpdateQuantity,
  onRemove,
  onToggleMode,
  onDiscountTotalChange,
  onCheckout,
}: CartPanelProps) {
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const itemDiscounts = cart.reduce((sum, item) => sum + item.discount, 0);
  const total = Math.max(0, subtotal - itemDiscounts - discountTotal);
  const isValid = cart.length > 0 && total > 0;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Cliente */}
      <div className="p-2 border-b border-gray-100 bg-gray-50">
        {client ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-vet-light flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-vet-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-vet-text truncate">{client.name}</p>
              {(client.creditBalance || 0) > 0 && (
                <p className="text-[9px] text-green-600">${client.creditBalance?.toFixed(2)} crédito</p>
              )}
            </div>
            <button onClick={onClearClient} className="p-0.5 text-gray-400 hover:text-red-500">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={onChangeClient}
            className="w-full py-1.5 text-xs text-vet-primary font-medium rounded border border-dashed border-vet-primary/30 hover:border-vet-primary hover:bg-vet-light"
          >
            + Agregar cliente
          </button>
        )}
      </div>

      {/* Header carrito */}
      <div className="px-2 py-1 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <ShoppingCart className="w-3.5 h-3.5 text-vet-primary" />
          <span className="text-[10px] font-medium text-gray-700">Carrito</span>
        </div>
        <span className="text-[9px] text-gray-500">{cart.length} items</span>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-2 min-h-0">
        {cart.length === 0 ? (
          <div className="py-6 text-center">
            <ShoppingCart className="w-6 h-6 text-gray-300 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500">Carrito vacío</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {cart.map((item, index) => (
              <CartItem
                key={`${item.productId}-${item.isFullUnit}-${index}`}
                item={item}
                index={index}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemove}
                onToggleMode={onToggleMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {cart.length > 0 && (
        <div className="border-t border-gray-100 p-2 bg-gray-50 space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-700">${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500">Descuento</span>
            <input
              type="number"
              value={discountTotal || ""}
              onChange={(e) => onDiscountTotalChange(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-16 text-[10px] text-right border border-gray-200 rounded px-1.5 py-0.5"
            />
          </div>

          <div className="flex justify-between pt-1.5 border-t border-gray-200">
            <span className="text-xs font-semibold text-vet-text">Total</span>
            <span className="text-sm font-bold text-vet-primary">${total.toFixed(2)}</span>
          </div>

          <button
            onClick={onCheckout}
            disabled={!isValid || isPending}
            className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 ${
              isValid && !isPending
                ? "bg-vet-primary hover:bg-vet-secondary text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Receipt className="w-3.5 h-3.5" />
                Pagar ${total.toFixed(2)}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}