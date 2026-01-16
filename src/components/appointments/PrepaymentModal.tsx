import { useState } from "react";
import { DollarSign, X, CreditCard, Banknote } from "lucide-react";

type PrepaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  onSkip: () => void;
  appointmentType: string;
  isLoading?: boolean;
};

export default function PrepaymentModal({
  isOpen,
  onClose,
  onConfirm,
  onSkip,
  appointmentType,
  isLoading = false,
}: PrepaymentModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string>("");

  if (!isOpen) return null;

  const handleAmountChange = (value: string) => {
    // Solo permitir números y punto decimal
    const sanitized = value.replace(/[^0-9.]/g, "");
    // Evitar múltiples puntos
    const parts = sanitized.split(".");
    if (parts.length > 2) return;
    // Máximo 2 decimales
    if (parts[1] && parts[1].length > 2) return;
    
    setAmount(sanitized);
    setError("");
  };

  const handleConfirm = () => {
    const numericAmount = parseFloat(amount);
    
    if (!amount || isNaN(numericAmount)) {
      setError("Ingresa un monto válido");
      return;
    }
    
    if (numericAmount <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }
    
    if (numericAmount > 10000) {
      setError("El monto máximo es $10,000");
      return;
    }
    
    onConfirm(numericAmount);
  };

  const quickAmounts = [10, 20, 50, 100];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[var(--color-card)] rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200 border border-[var(--color-border)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  ¿Desea realizar un anticipo?
                </h3>
                <p className="text-white/80 text-sm">
                  Cita de {appointmentType}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info */}
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex gap-3">
              <Banknote className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1 text-blue-200">Anticipo opcional</p>
                <p className="text-blue-400/90">
                  El monto se agregará como crédito a la cuenta del propietario 
                  y se aplicará automáticamente al momento de facturar.
                </p>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-vet-text)] mb-2">
              Monto del anticipo (USD)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="w-5 h-5 text-[var(--color-vet-muted)]" />
              </div>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className={`
                  block w-full pl-10 pr-4 py-3 text-lg font-medium
                  border rounded-lg transition-colors
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)]
                  bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)]
                  ${error ? 'border-red-500/50 bg-red-600/10' : 'border-[var(--color-border)]'}
                `}
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="mt-1 text-sm text-red-400">{error}</p>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <p className="text-sm text-[var(--color-vet-muted)] mb-2">Montos rápidos:</p>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => {
                    setAmount(quickAmount.toString());
                    setError("");
                  }}
                  className={`
                    py-2 px-3 rounded-lg text-sm font-medium transition-all
                    ${amount === quickAmount.toString()
                      ? 'bg-[var(--color-vet-primary)] text-white'
                      : 'bg-[var(--color-hover)] text-[var(--color-vet-text)] hover:bg-[var(--color-vet-primary)]/10 hover:text-[var(--color-vet-primary)]'
                    }
                  `}
                  disabled={isLoading}
                >
                  ${quickAmount}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--color-border)] bg-[var(--color-hover)] p-4 flex gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 py-2.5 px-4 rounded-lg border border-[var(--color-border)] text-[var(--color-vet-text)] font-medium hover:bg-[var(--color-card)] transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            Sin anticipo
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 px-4 rounded-lg bg-[var(--color-vet-primary)] text-white font-medium hover:bg-[var(--color-vet-secondary)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={isLoading || !amount}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                Confirmar anticipo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}