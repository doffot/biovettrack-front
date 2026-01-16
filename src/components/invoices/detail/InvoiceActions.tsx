// src/components/invoices/detail/InvoiceActions.tsx
import { CreditCard, XCircle, Trash2 } from "lucide-react";

interface InvoiceActionsProps {
  canPay: boolean;
  canCancel: boolean;
  onPay: () => void;
  onCancel: () => void;
  onDelete: () => void;
  isPaying: boolean;
  isCanceling: boolean;
  isDeleting: boolean;
}

export function InvoiceActions({
  canPay,
  canCancel,
  onPay,
  onCancel,
  onDelete,
  isPaying,
  isCanceling,
  isDeleting,
}: InvoiceActionsProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-md p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Registrar Pago */}
        {canPay && (
          <button
            onClick={onPay}
            disabled={isPaying}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-vet-primary rounded-md hover:bg-vet-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPaying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Registrar Pago
              </>
            )}
          </button>
        )}

        {/* Cancelar Factura */}
        {canCancel && (
          <button
            onClick={onCancel}
            disabled={isCanceling}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-amber-400 bg-amber-900/30 border border-amber-900/50 rounded-md hover:bg-amber-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCanceling ? (
              <>
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                Cancelando...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Cancelar
              </>
            )}
          </button>
        )}

        {/* Eliminar Factura */}
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-400 bg-red-900/30 border border-red-900/50 rounded-md hover:bg-red-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? (
            <>
              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              Eliminando...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              Eliminar
            </>
          )}
        </button>
      </div>
    </div>
  );
}