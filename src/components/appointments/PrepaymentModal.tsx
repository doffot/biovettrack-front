// src/components/appointments/PrepaymentModal.tsx

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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-vet-primary to-vet-secondary p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Banknote className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Anticipo opcional</p>
                <p className="text-blue-600">
                  El monto se agregará como crédito a la cuenta del propietario 
                  y se aplicará automáticamente al momento de facturar.
                </p>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto del anticipo (USD)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="w-5 h-5 text-gray-400" />
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
                  focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary
                  ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                `}
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Montos rápidos:</p>
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
                      ? 'bg-vet-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
        <div className="border-t bg-gray-50 p-4 flex gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            Sin anticipo
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 px-4 rounded-lg bg-vet-primary text-white font-medium hover:bg-vet-secondary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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