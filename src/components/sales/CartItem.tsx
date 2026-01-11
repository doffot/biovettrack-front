// src/components/sales/CartItem.tsx
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem as CartItemType } from "../../types/sale";

interface CartItemProps {
  item: CartItemType;
  index: number;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemove: (index: number) => void;
  onToggleMode: (index: number) => void;
}

export function CartItem({
  item,
  index,
  onUpdateQuantity,
  onRemove,
  onToggleMode,
}: CartItemProps) {
  const unitPrice = item.isFullUnit ? item.unitPrice : item.pricePerDose || item.unitPrice;

  return (
    <div className="py-1.5 flex items-center gap-2">
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-vet-text truncate">{item.productName}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <button
            onClick={() => onToggleMode(index)}
            disabled={!item.isDivisible}
            className={`text-[9px] px-1 py-0.5 rounded ${
              item.isDivisible
                ? "bg-vet-light text-vet-primary cursor-pointer"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {item.isFullUnit ? item.unit : item.doseUnit}
          </button>
          <span className="text-[9px] text-gray-500">${unitPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Cantidad */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onUpdateQuantity(index, item.quantity - 1)}
          className="w-5 h-5 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-100"
        >
          <Minus className="w-2.5 h-2.5" />
        </button>
        <input
          type="number"
          value={item.quantity}
          onChange={(e) => onUpdateQuantity(index, parseFloat(e.target.value) || 0)}
          className="w-8 text-center text-[10px] font-medium border border-gray-200 rounded py-0.5"
        />
        <button
          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
          disabled={item.quantity >= item.availableStock}
          className="w-5 h-5 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-50"
        >
          <Plus className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Total */}
      <div className="w-14 text-right">
        <p className="text-xs font-bold text-vet-text">${item.total.toFixed(2)}</p>
      </div>

      {/* Eliminar */}
      <button
        onClick={() => onRemove(index)}
        className="p-0.5 text-gray-400 hover:text-red-500 rounded"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}