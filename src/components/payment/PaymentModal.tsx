// src/components/payment/PaymentModal.tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, CheckCircle2, DollarSign, ChevronDown, Wallet } from "lucide-react";
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
    paymentMethodId?: string;
    reference?: string;
    addAmountPaidUSD: number;
    addAmountPaidBs: number;
    exchangeRate: number;
    isPartial: boolean;
    creditAmountUsed?: number;
  }) => void;
  amountUSD: number;
  creditBalance?: number;
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
  creditBalance = 0,
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
  
  // Estado para crédito
  const [useCredit, setUseCredit] = useState(false);
  const [creditToUse, setCreditToUse] = useState<string>("");

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

  // Calcular crédito máximo aplicable
  const maxCreditToUse = Math.min(creditBalance, amountUSD);
  
  // Crédito efectivo a usar
  const effectiveCreditToUse = useCredit 
    ? Math.min(parseFloat(creditToUse) || 0, maxCreditToUse)
    : 0;

  // Monto restante después del crédito
  const amountAfterCredit = Math.max(0, amountUSD - effectiveCreditToUse);

  const selectedMethod = paymentMethods.find(m => m._id === selectedMethodId);
  const isBsMethod = selectedMethod?.currency === "Bs" || selectedMethod?.currency === "VES";

  const currentRate: number = useOfficialRate ? (bcvRate ?? 0) : (parseFloat(manualRate) || 0);
  
  // Monto efectivo a pagar CON MÉTODO DE PAGO (no crédito)
  // Si no hay método seleccionado, es 0
  const effectiveAmountUSD = !selectedMethodId 
    ? 0 
    : paymentType === "full" 
      ? amountAfterCredit 
      : Math.min(parseFloat(customAmountUSD) || 0, amountAfterCredit);
  
  const totalBs = currentRate > 0 ? effectiveAmountUSD * currentRate : 0;

  // Si el crédito cubre todo, no necesita método de pago
  const creditCoversAll = effectiveCreditToUse >= amountUSD;
  
  // Solo pagando con crédito (sin método de pago adicional)
  const onlyPayingWithCredit = effectiveCreditToUse > 0 && !selectedMethodId;

  const handleSubmit = async () => {
    // Validar que hay algo que pagar
    if (effectiveAmountUSD <= 0 && effectiveCreditToUse <= 0) {
      toast.error("Debe especificar un monto a pagar");
      return;
    }

    // Solo validar método de pago si hay monto a pagar con método
    if (effectiveAmountUSD > 0 && !selectedMethodId) {
      toast.error("Selecciona un método de pago");
      return;
    }

    if (effectiveAmountUSD > 0 && isBsMethod && currentRate <= 0) {
      toast.error("Ingresa una tasa de cambio válida");
      return;
    }

    setIsProcessing(true);
    try {
      let addAmountPaidUSD = 0;
      let addAmountPaidBs = 0;

      if (effectiveAmountUSD > 0) {
        if (isBsMethod) {
          addAmountPaidBs = parseFloat(totalBs.toFixed(2));
          addAmountPaidUSD = 0;
        } else {
          addAmountPaidUSD = parseFloat(effectiveAmountUSD.toFixed(2));
          addAmountPaidBs = 0;
        }
      }

      await onConfirm({
        paymentMethodId: selectedMethodId || undefined,
        reference: reference || undefined,
        addAmountPaidUSD,
        addAmountPaidBs,
        exchangeRate: currentRate || 1,
        isPartial: !creditCoversAll && (onlyPayingWithCredit || paymentType === "partial"),
        creditAmountUsed: effectiveCreditToUse > 0 ? effectiveCreditToUse : undefined,
      });
      onClose();
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      toast.error("Error al procesar el pago");
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
      setUseCredit(false);
      setCreditToUse("");
    }
  }, [isOpen]);

  const hasPaymentToDo = effectiveCreditToUse > 0 || effectiveAmountUSD > 0;
  const rateRequiredAndMissing = selectedMethodId && isBsMethod && currentRate <= 0;
  const partialAmountInvalid = paymentType === "partial" && selectedMethodId && 
    (parseFloat(customAmountUSD) <= 0 || parseFloat(customAmountUSD) > amountAfterCredit);

  const isValid = 
    hasPaymentToDo && 
    !rateRequiredAndMissing &&
    !partialAmountInvalid &&
    !isProcessing;

  if (!isOpen) return null;

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
            
            {/* Sección de Crédito Disponible */}
            {creditBalance > 0 && (
              <div className={`p-4 rounded-xl border-2 transition-all ${
                useCredit 
                  ? "bg-blue-50 border-blue-300" 
                  : "bg-gray-50 border-gray-200"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Wallet className={`w-5 h-5 ${useCredit ? "text-blue-600" : "text-gray-500"}`} />
                    <span className="font-medium text-gray-800">Crédito a favor</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    ${creditBalance.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCredit}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setUseCredit(checked);
                        if (checked) {
                          setCreditToUse(maxCreditToUse.toFixed(2));
                        } else {
                          setCreditToUse("");
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Usar crédito</span>
                  </label>
                  
                  {useCredit && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Usar:</span>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={maxCreditToUse}
                          value={creditToUse}
                          onChange={(e) => setCreditToUse(e.target.value)}
                          className="w-24 pl-6 pr-2 py-1.5 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                          placeholder={maxCreditToUse.toFixed(2)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {useCredit && effectiveCreditToUse > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Restante a pagar:</span>
                      <span className={`font-bold ${amountAfterCredit > 0 ? "text-amber-600" : "text-green-600"}`}>
                        {amountAfterCredit > 0 ? `$${amountAfterCredit.toFixed(2)}` : "¡Cubierto!"}
                      </span>
                    </div>
                    
                    {amountAfterCredit > 0 && !selectedMethodId && (
                      <p className="text-xs text-blue-600 bg-blue-100 rounded-lg px-2 py-1">
                        💡 Puedes abonar solo el crédito o seleccionar un método de pago para el resto
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Opciones de pago adicional - Solo si hay monto restante */}
            {(!creditCoversAll) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Columna Izquierda */}
                <div className="space-y-4">
                  
                  {/* Tipo de Pago - Solo si hay método seleccionado */}
                  {allowPartial && selectedMethodId && amountAfterCredit > 0 && (
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
                          <span className="text-[10px] text-gray-500">${amountAfterCredit.toFixed(2)}</span>
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
                              max={amountAfterCredit}
                              value={customAmountUSD}
                              onChange={(e) => setCustomAmountUSD(e.target.value)}
                              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                              placeholder={`Máx: ${amountAfterCredit.toFixed(2)}`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Método de Pago - Opcional si ya hay crédito */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">
                      Método de pago {!useCredit && "*"}
                      {useCredit && amountAfterCredit > 0 && (
                        <span className="text-gray-400 font-normal"> (opcional)</span>
                      )}
                    </p>
                    <select
                      value={selectedMethodId}
                      onChange={(e) => setSelectedMethodId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-vet-primary"
                      disabled={isLoading || isProcessing}
                    >
                      <option value="">
                        {useCredit ? "Solo usar crédito..." : "Seleccionar..."}
                      </option>
                      {paymentMethods.filter((m) => m.isActive).map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name} ({m.currency === "VES" ? "Bs" : m.currency})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Referencia */}
                  {selectedMethodId && (
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
                  )}
                </div>

                {/* Columna Derecha */}
                <div className="space-y-4">
                  
                  {/* Tasa de Cambio - Solo si es método en Bs */}
                  {selectedMethodId && isBsMethod && (
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
                    creditCoversAll || onlyPayingWithCredit
                      ? "bg-blue-50 border-blue-300"
                      : paymentType === "full" 
                        ? "bg-emerald-50 border-emerald-300" 
                        : "bg-blue-50 border-blue-300"
                  }`}>
                    
                    {/* Resumen si usa crédito */}
                    {useCredit && effectiveCreditToUse > 0 && (
                      <div className="mb-3 pb-3 border-b border-current/20">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Total factura:</span>
                          <span className="font-medium">${amountUSD.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-600">Crédito aplicado:</span>
                          <span className="font-medium text-blue-600">-${effectiveCreditToUse.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    <p className={`text-xs font-medium mb-1 ${
                      creditCoversAll || onlyPayingWithCredit
                        ? "text-blue-600"
                        : paymentType === "full" 
                          ? "text-emerald-600" 
                          : "text-blue-600"
                    }`}>
                      {creditCoversAll 
                        ? "Pago total con crédito"
                        : onlyPayingWithCredit
                          ? "Abono con crédito"
                          : paymentType === "full" 
                            ? "Total a pagar" 
                            : "Monto del abono"}
                    </p>
                    
                    {creditCoversAll ? (
                      <div className="text-2xl font-bold text-green-700">
                        $0.00
                        <span className="block text-sm font-normal text-green-600 mt-1">
                          ✓ Cubierto con crédito
                        </span>
                      </div>
                    ) : onlyPayingWithCredit ? (
                      <div className="text-2xl font-bold text-blue-700">
                        ${effectiveCreditToUse.toFixed(2)}
                        <span className="block text-sm font-normal text-amber-600 mt-1">
                          Quedará pendiente: ${amountAfterCredit.toFixed(2)}
                        </span>
                      </div>
                    ) : isBsMethod && selectedMethodId ? (
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
                    ) : selectedMethodId ? (
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
                    ) : (
                      <div className="text-base text-gray-400">
                        Selecciona un método de pago o usa crédito
                      </div>
                    )}
                    
                    {selectedMethodId && paymentType === "partial" && effectiveAmountUSD > 0 && effectiveAmountUSD <= amountAfterCredit && (
                      <div className="mt-1 flex justify-between text-xs">
                        <span className="text-gray-500">Restante después:</span>
                        <span className="text-red-600 font-medium">${(amountAfterCredit - effectiveAmountUSD).toFixed(2)}</span>
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
            )}

            {/* Mensaje cuando crédito cubre todo */}
            {creditCoversAll && (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-semibold text-green-700">
                  El crédito cubre el total
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Se descontarán ${effectiveCreditToUse.toFixed(2)} de tu crédito
                </p>
              </div>
            )}
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
                  : creditCoversAll
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : onlyPayingWithCredit
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
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
                  <span>
                    {creditCoversAll 
                      ? "Usar crédito" 
                      : onlyPayingWithCredit
                        ? "Abonar crédito"
                        : paymentType === "full" 
                          ? "Pagar" 
                          : "Abonar"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}