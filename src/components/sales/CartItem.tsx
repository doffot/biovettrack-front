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
                ? "bg-vet-primary/20 text-vet-primary cursor-pointer"
                : "bg-slate-700/50 text-slate-500"
            }`}
          >
            {item.isFullUnit ? item.unit : item.doseUnit}
          </button>
          <span className="text-[9px] text-vet-muted">${unitPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Cantidad */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onUpdateQuantity(index, item.quantity - 1)}
          className="w-5 h-5 flex items-center justify-center rounded border border-slate-700 hover:bg-slate-700/50"
        >
          <Minus className="w-2.5 h-2.5 text-vet-text" />
        </button>
        <input
          type="number"
          value={item.quantity}
          onChange={(e) => onUpdateQuantity(index, parseFloat(e.target.value) || 0)}
          className="w-8 text-center text-[10px] font-medium border border-slate-700 rounded py-0.5 bg-slate-800 text-vet-text"
        />
        <button
          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
          disabled={item.quantity >= item.availableStock}
          className="w-5 h-5 flex items-center justify-center rounded border border-slate-700 hover:bg-slate-700/50 disabled:opacity-50"
        >
          <Plus className="w-2.5 h-2.5 text-vet-text" />
        </button>
      </div>

      {/* Total */}
      <div className="w-14 text-right">
        <p className="text-xs font-bold text-vet-text">${item.total.toFixed(2)}</p>
      </div>

      {/* Eliminar */}
      <button
        onClick={() => onRemove(index)}
        className="p-0.5 text-slate-400 hover:text-red-400 rounded"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}