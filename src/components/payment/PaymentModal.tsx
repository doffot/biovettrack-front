// src/components/payment/PaymentModal.tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, CheckCircle2, DollarSign, ChevronDown } from "lucide-react";
import { getPaymentMethods } from "../../api/paymentAPI";
import { getBCVRate } from "../../utils/exchangeRateService";
import { toast } from "../Toast";

export interface PaymentItem {
  id?: string;
  description: string;
  patientName?: string;
  date?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentData: {
    paymentMethodId: string;
    reference?: string;
    amountPaidUSD: number;
    amountPaidBs: number;
    exchangeRate: number;
    isPartial: boolean;
  }) => void;
  amountUSD: number;
  items?: PaymentItem[];
  title?: string;
  subtitle?: string;
  allowPartial?: boolean;
}

export function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  amountUSD,
  items = [],
  title = "Procesar Pago",
  subtitle,
  allowPartial = true,
}: PaymentModalProps) {
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
  const [reference, setReference] = useState("");
  const [bcvRate, setBcvRate] = useState<number | null>(null);
  const [useOfficialRate, setUseOfficialRate] = useState<boolean>(true);
  const [manualRate, setManualRate] = useState<string>("");
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(true);
  const [rateError, setRateError] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentType, setPaymentType] = useState<"full" | "partial">("full");
  const [customAmountUSD, setCustomAmountUSD] = useState<string>("");
  const [showRateOptions, setShowRateOptions] = useState(false);

  const { data: paymentMethods = [], isLoading } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: getPaymentMethods,
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      setIsLoadingRate(true);
      setRateError(false);
      setBcvRate(null);
      getBCVRate()
        .then((rate) => {
          setBcvRate(rate);
          setIsLoadingRate(false);
        })
        .catch(() => {
          setBcvRate(null);
          setIsLoadingRate(false);
          setRateError(true);
          setUseOfficialRate(false);
        });
    }
  }, [isOpen]);

  // Método de pago seleccionado
  const selectedMethod = paymentMethods.find(m => m._id === selectedMethodId);
  const isBsMethod = selectedMethod?.currency === "Bs" || selectedMethod?.currency === "VES";
  // const isUsdMethod = selectedMethod?.currency === "USD";

  const currentRate: number = useOfficialRate ? (bcvRate ?? 0) : (parseFloat(manualRate) || 0);
  const effectiveAmountUSD = paymentType === "full" ? amountUSD : (parseFloat(customAmountUSD) || 0);
  const totalBs = currentRate > 0 ? effectiveAmountUSD * currentRate : 0;

  const handleSubmit = async () => {
    if (!selectedMethodId) {
      toast.error("Selecciona un método de pago");
      return;
    }
    
    // Solo validar tasa si es pago en Bs
    if (isBsMethod && currentRate <= 0) {
      toast.error("Ingresa una tasa de cambio válida");
      return;
    }
    
    if (paymentType === "partial" && (effectiveAmountUSD <= 0 || effectiveAmountUSD > amountUSD)) {
      toast.error("Monto de abono inválido");
      return;
    }

    setIsProcessing(true);
    try {
      // Determinar montos según la moneda del método de pago
      let amountPaidUSD = 0;
      let amountPaidBs = 0;

      if (isBsMethod) {
        // Pago en Bolívares: guardar el monto en Bs
        amountPaidBs = parseFloat(totalBs.toFixed(2));
        amountPaidUSD = 0;
      } else {
        // Pago en USD: guardar el monto en USD
        amountPaidUSD = parseFloat(effectiveAmountUSD.toFixed(2));
        amountPaidBs = 0;
      }

      console.log("💰 ENVIANDO PAGO:", {
        isBsMethod,
        amountPaidUSD,
        amountPaidBs,
        exchangeRate: currentRate,
      });

      await onConfirm({
        paymentMethodId: selectedMethodId,
        reference: reference || undefined,
        amountPaidUSD,
        amountPaidBs,
        exchangeRate: currentRate,
        isPartial: paymentType === "partial",
      });
      onClose();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedMethodId("");
      setReference("");
      setUseOfficialRate(true);
      setManualRate("");
      setRateError(false);
      setBcvRate(null);
      setIsProcessing(false);
      setPaymentType("full");
      setCustomAmountUSD("");
      setShowRateOptions(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Validación: para USD no necesita tasa, para Bs sí
  const isRateReady = isBsMethod 
    ? (useOfficialRate ? (bcvRate !== null && bcvRate > 0) : (parseFloat(manualRate) > 0))
    : true;
    
  const isValid = selectedMethodId && 
    isRateReady && 
    !isProcessing && 
    (paymentType === "full" || (effectiveAmountUSD > 0 && effectiveAmountUSD <= amountUSD));

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      
      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] flex items-end sm:items-center justify-center">
        <div className="relative bg-white w-full sm:w-[600px] lg:w-[700px] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh]">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-vet-primary to-vet-secondary px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate">{title}</h2>
              {subtitle && <p className="text-white/80 text-xs truncate">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Columna Izquierda */}
              <div className="space-y-4">
                
                {/* Tipo de Pago */}
                {allowPartial && amountUSD > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">Tipo de pago</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentType("full")}
                        className={`p-2.5 rounded-lg border-2 transition-all text-center ${
                          paymentType === "full"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 mx-auto mb-1 ${paymentType === "full" ? "text-emerald-600" : "text-gray-400"}`} />
                        <span className="text-xs font-semibold block">Total</span>
                        <span className="text-[10px] text-gray-500">${amountUSD.toFixed(2)}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentType("partial")}
                        className={`p-2.5 rounded-lg border-2 transition-all text-center ${
                          paymentType === "partial"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <DollarSign className={`w-4 h-4 mx-auto mb-1 ${paymentType === "partial" ? "text-blue-600" : "text-gray-400"}`} />
                        <span className="text-xs font-semibold block">Abono</span>
                        <span className="text-[10px] text-gray-500">Parcial</span>
                      </button>
                    </div>

                    {paymentType === "partial" && (
                      <div className="mt-2">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={amountUSD}
                            value={customAmountUSD}
                            onChange={(e) => setCustomAmountUSD(e.target.value)}
                            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder={`Máx: ${amountUSD.toFixed(2)}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Método de Pago */}
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">Método de pago *</p>
                  <select
                    value={selectedMethodId}
                    onChange={(e) => setSelectedMethodId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-vet-primary"
                    disabled={isLoading || isProcessing}
                  >
                    <option value="">Seleccionar...</option>
                    {paymentMethods.filter((m) => m.isActive).map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.currency === "VES" ? "Bs" : m.currency})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Referencia */}
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    Referencia <span className="text-gray-400">(opcional)</span>
                  </p>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-vet-primary"
                    placeholder="Nro. de referencia"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="space-y-4">
                
                {/* Tasa de Cambio - Solo si es método en Bs */}
                {isBsMethod && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowRateOptions(!showRateOptions)}
                      className="w-full flex items-center justify-between"
                    >
                      <span className="text-xs font-medium text-gray-600">Tasa de cambio</span>
                      <div className="flex items-center gap-2">
                        {isLoadingRate ? (
                          <div className="w-3 h-3 border-2 border-vet-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span className="text-sm font-bold text-emerald-600">
                            {currentRate > 0 ? `Bs. ${currentRate.toFixed(2)}` : "—"}
                          </span>
                        )}
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showRateOptions ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {showRateOptions && (
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">
                            {useOfficialRate ? "🏛️ BCV" : "✏️ Manual"}
                          </span>
                          <button
                            type="button"
                            onClick={() => !rateError && setUseOfficialRate(!useOfficialRate)}
                            className={`relative w-10 h-5 rounded-full transition-colors ${
                              useOfficialRate ? "bg-emerald-500" : "bg-gray-300"
                            }`}
                          >
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              useOfficialRate ? "left-0.5" : "left-5"
                            }`} />
                          </button>
                        </div>
                        
                        {!useOfficialRate && (
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">Bs.</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={manualRate}
                              onChange={(e) => setManualRate(e.target.value)}
                              className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm"
                              placeholder="Ej: 45.50"
                            />
                          </div>
                        )}
                        
                        {rateError && (
                          <p className="text-[10px] text-red-500">BCV no disponible</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Total a Pagar */}
                <div className={`rounded-lg p-4 border-2 ${
                  paymentType === "full" 
                    ? "bg-emerald-50 border-emerald-300" 
                    : "bg-blue-50 border-blue-300"
                }`}>
                  <p className={`text-xs font-medium mb-1 ${
                    paymentType === "full" ? "text-emerald-600" : "text-blue-600"
                  }`}>
                    {paymentType === "full" ? "Total a pagar" : "Monto del abono"}
                  </p>
                  
                  {/* Mostrar según moneda del método */}
                  {isBsMethod ? (
                    <>
                      <div className={`text-2xl font-bold ${
                        paymentType === "full" ? "text-emerald-700" : "text-blue-700"
                      }`}>
                        {currentRate > 0 && effectiveAmountUSD > 0 ? (
                          `Bs. ${totalBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        ) : (
                          <span className="text-base text-gray-400">Selecciona tasa</span>
                        )}
                      </div>
                      <div className="mt-2 pt-2 border-t border-current/20 flex justify-between text-sm">
                        <span className="text-gray-600">Equivale a:</span>
                        <span className="font-semibold">${effectiveAmountUSD.toFixed(2)} USD</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={`text-2xl font-bold ${
                        paymentType === "full" ? "text-emerald-700" : "text-blue-700"
                      }`}>
                        ${effectiveAmountUSD.toFixed(2)}
                      </div>
                      {currentRate > 0 && (
                        <div className="mt-2 pt-2 border-t border-current/20 flex justify-between text-sm">
                          <span className="text-gray-600">Referencia en Bs:</span>
                          <span className="font-semibold">
                            Bs. {totalBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {paymentType === "partial" && effectiveAmountUSD > 0 && effectiveAmountUSD <= amountUSD && (
                    <div className="mt-1 flex justify-between text-xs">
                      <span className="text-gray-500">Restante:</span>
                      <span className="text-red-600 font-medium">${(amountUSD - effectiveAmountUSD).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Items */}
                {items.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-[10px] font-medium text-gray-500 uppercase mb-2">Detalle</p>
                    {items.slice(0, 2).map((item, idx) => (
                      <p key={idx} className="text-xs text-gray-700 truncate">
                        {item.description} {item.patientName && `• ${item.patientName}`}
                      </p>
                    ))}
                    {items.length > 2 && (
                      <p className="text-[10px] text-gray-400">+{items.length - 2} más</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-4 border-t border-gray-200 bg-white flex-shrink-0">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                !isValid
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : paymentType === "full"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Procesando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{paymentType === "full" ? "Pagar" : "Abonar"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}