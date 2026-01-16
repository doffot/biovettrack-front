// src/components/payment/PaymentModal.tsx
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  X, 
  CheckCircle2, 
  Wallet, 
  CreditCard,
  TrendingDown,
  Banknote,
  Phone,
  User,
  PawPrint,
  Receipt,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { getPaymentMethods } from "../../api/paymentAPI";
import { getBCVRate } from "../../utils/exchangeRateService";
import { toast } from "../Toast";

// Interfaces
export interface PaymentServiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentPatientInfo {
  name: string;
  photo?: string | null;
}

export interface PaymentOwnerInfo {
  name: string;
  phone?: string;
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
  services?: PaymentServiceItem[];
  patient?: PaymentPatientInfo;
  owner?: PaymentOwnerInfo;
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
  services = [],
  patient,
  owner,
  title = "Procesar Pago",
  allowPartial = true,
}: PaymentModalProps) {
  // Estados
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
  const [reference, setReference] = useState("");
  const [useCredit, setUseCredit] = useState(false);
  const [creditAmount, setCreditAmount] = useState<string>("");
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [bcvRate, setBcvRate] = useState<number | null>(null);
  const [manualRate, setManualRate] = useState<string>("");
  const [useManualRate, setUseManualRate] = useState(false);
  const [isLoadingRate, setIsLoadingRate] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Query métodos de pago
  const { data: paymentMethods = [], isLoading: isLoadingMethods } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: getPaymentMethods,
    enabled: isOpen,
  });

  // Cargar tasa BCV
  useEffect(() => {
    if (isOpen) {
      setIsLoadingRate(true);
      getBCVRate()
        .then((rate) => {
          setBcvRate(rate);
          setIsLoadingRate(false);
        })
        .catch(() => {
          setBcvRate(null);
          setIsLoadingRate(false);
          setUseManualRate(true);
        });
    }
  }, [isOpen]);

  // Reset al cerrar
  useEffect(() => {
    if (!isOpen) {
      setSelectedMethodId("");
      setReference("");
      setUseCredit(false);
      setCreditAmount("");
      setIsPartialPayment(false);
      setCustomAmount("");
      setManualRate("");
      setUseManualRate(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  // Cálculos
  const selectedMethod = useMemo(
    () => paymentMethods.find((m) => m._id === selectedMethodId),
    [paymentMethods, selectedMethodId]
  );

  const isBsMethod = selectedMethod?.currency === "Bs" || selectedMethod?.currency === "VES";
  const currentRate = useManualRate ? parseFloat(manualRate) || 0 : bcvRate || 0;

  const maxCredit = Math.min(creditBalance, amountUSD);
  const effectiveCredit = useCredit ? Math.min(parseFloat(creditAmount) || 0, maxCredit) : 0;
  const remainingAfterCredit = Math.max(0, amountUSD - effectiveCredit);

  const creditCoversAll = effectiveCredit >= amountUSD;

  const paymentAmount = useMemo(() => {
    if (creditCoversAll) return 0;
    if (isPartialPayment) return Math.min(parseFloat(customAmount) || 0, remainingAfterCredit);
    return remainingAfterCredit;
  }, [creditCoversAll, isPartialPayment, customAmount, remainingAfterCredit]);

  const totalBs = currentRate > 0 ? paymentAmount * currentRate : 0;

  // Validación
  const needsPaymentMethod = !creditCoversAll && paymentAmount > 0;
  const needsRate = needsPaymentMethod && isBsMethod && currentRate <= 0;
  const invalidPartialAmount =
    isPartialPayment && (parseFloat(customAmount) <= 0 || parseFloat(customAmount) > remainingAfterCredit);

  const canSubmit =
    (effectiveCredit > 0 || paymentAmount > 0) &&
    (!needsPaymentMethod || selectedMethodId) &&
    !needsRate &&
    !invalidPartialAmount &&
    !isProcessing;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsProcessing(true);
    try {
      let addAmountPaidUSD = 0;
      let addAmountPaidBs = 0;

      if (paymentAmount > 0 && selectedMethodId) {
        if (isBsMethod) {
          addAmountPaidBs = parseFloat(totalBs.toFixed(2));
        } else {
          addAmountPaidUSD = parseFloat(paymentAmount.toFixed(2));
        }
      }

      await onConfirm({
        paymentMethodId: selectedMethodId || undefined,
        reference: reference || undefined,
        addAmountPaidUSD,
        addAmountPaidBs,
        exchangeRate: currentRate || 1,
        isPartial: isPartialPayment || (useCredit && !creditCoversAll && !selectedMethodId),
        creditAmountUsed: effectiveCredit > 0 ? effectiveCredit : undefined,
      });
      onClose();
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      toast.error("Error al procesar el pago");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const activePaymentMethods = paymentMethods.filter((m) => m.isActive);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header con info del paciente/owner */}
        <div className="bg-gradient-to-br from-vet-primary to-vet-accent p-4 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-start gap-4 pr-8">
            {/* Foto del paciente */}
            <div className="flex-shrink-0">
              {patient?.photo ? (
                <img
                  src={patient.photo}
                  alt={patient.name}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-white/30 shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                  <PawPrint className="w-8 h-8 text-white/80" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white truncate">{title}</h2>

              {/* Nombre del paciente */}
              {patient && (
                <p className="text-white/90 text-sm font-medium mt-0.5 flex items-center gap-1.5">
                  <PawPrint className="w-3.5 h-3.5" />
                  {patient.name}
                </p>
              )}

              {/* Info del owner */}
              {owner && (
                <div className="flex items-center gap-3 mt-1 text-white/70 text-xs">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {owner.name}
                  </span>
                  {owner.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {owner.phone}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Total */}
            <div className="text-right flex-shrink-0">
              <p className="text-white/60 text-[10px] uppercase tracking-wide">Total</p>
              <p className="text-2xl font-bold text-white">${amountUSD.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* Tabla de servicios */}
          {services.length > 0 && (
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
              <div className="px-3 py-2 bg-slate-800/80 border-b border-white/10 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-vet-accent" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Detalle de servicios
                </span>
              </div>

              <div className="divide-y divide-white/5">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 px-3 py-1.5 text-[10px] font-medium text-slate-500 uppercase bg-slate-800/40">
                  <div className="col-span-6">Servicio</div>
                  <div className="col-span-3 text-right">Precio</div>
                  <div className="col-span-3 text-right">Total</div>
                </div>

                {/* Filas */}
                {services.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors">
                    <div className="col-span-6 text-slate-300">
                      {item.quantity > 1 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-700 text-[10px] font-medium text-slate-300 mr-1.5">
                          {item.quantity}
                        </span>
                      )}
                      <span className="truncate">{item.description}</span>
                    </div>
                    <div className="col-span-3 text-right text-slate-500">
                      ${item.unitPrice.toFixed(2)}
                    </div>
                    <div className="col-span-3 text-right font-semibold text-white">
                      ${item.total.toFixed(2)}
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="grid grid-cols-12 gap-2 px-3 py-2.5 bg-vet-accent/10">
                  <div className="col-span-6 text-sm font-bold text-white">Total</div>
                  <div className="col-span-3"></div>
                  <div className="col-span-3 text-right text-base font-bold text-vet-accent">
                    ${amountUSD.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sección de Crédito */}
          {creditBalance > 0 && (
            <div
              className={`rounded-xl border-2 p-3 transition-all duration-300 ${
                useCredit 
                  ? "border-emerald-500/50 bg-emerald-500/10" 
                  : "border-white/10 bg-slate-800/40"
              }`}
            >
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      useCredit 
                        ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" 
                        : "bg-slate-700"
                    }`}
                  >
                    <Wallet className={`w-4 h-4 ${useCredit ? "text-white" : "text-slate-400"}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${useCredit ? "text-emerald-400" : "text-slate-300"}`}>
                      Usar crédito a favor
                    </p>
                    <p className="text-xs text-slate-500">
                      Disponible: <span className="font-medium text-emerald-400">${creditBalance.toFixed(2)}</span>
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={useCredit}
                  onChange={(e) => {
                    setUseCredit(e.target.checked);
                    if (e.target.checked) {
                      setCreditAmount(maxCredit.toFixed(2));
                    } else {
                      setCreditAmount("");
                    }
                  }}
                  className="w-5 h-5 text-emerald-500 bg-slate-700 border-white/20 rounded focus:ring-emerald-500/50 focus:ring-offset-0"
                />
              </label>

              {useCredit && (
                <div className="mt-3 pt-3 border-t border-emerald-500/30 flex items-center gap-3">
                  <span className="text-sm text-slate-400">Aplicar:</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={maxCredit}
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-slate-900/60 border border-emerald-500/30 rounded-lg text-sm text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                    />
                  </div>
                  <button
                    onClick={() => setCreditAmount(maxCredit.toFixed(2))}
                    className="px-3 py-2 text-xs font-medium text-emerald-400 bg-emerald-500/20 rounded-lg hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors"
                  >
                    Máx
                  </button>
                </div>
              )}

              {useCredit && effectiveCredit > 0 && (
                <div className="mt-2 text-xs">
                  {creditCoversAll ? (
                    <p className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      El crédito cubre el total
                    </p>
                  ) : (
                    <p className="text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Restante a pagar: <span className="font-semibold">${remainingAfterCredit.toFixed(2)}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Métodos de pago - Solo si hay monto a pagar */}
          {!creditCoversAll && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-300">Método de pago</p>
                {allowPartial && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPartialPayment}
                      onChange={(e) => {
                        setIsPartialPayment(e.target.checked);
                        if (!e.target.checked) setCustomAmount("");
                      }}
                      className="w-4 h-4 text-amber-500 bg-slate-700 border-white/20 rounded focus:ring-amber-500/50 focus:ring-offset-0"
                    />
                    <span className="text-xs text-slate-400">Pago parcial</span>
                  </label>
                )}
              </div>

              {/* Grid de métodos */}
              {isLoadingMethods ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-5 h-5 border-2 border-vet-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {activePaymentMethods.map((method) => {
                    const isSelected = selectedMethodId === method._id;
                    const isBs = method.currency === "Bs" || method.currency === "VES";

                    return (
                      <button
                        key={method._id}
                        onClick={() => setSelectedMethodId(isSelected ? "" : method._id)}
                        className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                          isSelected
                            ? "border-vet-accent bg-vet-accent/10 shadow-lg shadow-vet-accent/20"
                            : "border-white/10 hover:border-white/20 hover:bg-white/5 bg-slate-800/40"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 mx-auto mb-1.5 rounded-lg flex items-center justify-center transition-colors ${
                            isSelected 
                              ? "bg-vet-accent shadow-lg shadow-vet-accent/30" 
                              : "bg-slate-700"
                          }`}
                        >
                          {isBs ? (
                            <Banknote className={`w-4 h-4 ${isSelected ? "text-slate-900" : "text-slate-400"}`} />
                          ) : (
                            <CreditCard className={`w-4 h-4 ${isSelected ? "text-slate-900" : "text-slate-400"}`} />
                          )}
                        </div>
                        <p className={`text-xs font-medium truncate ${isSelected ? "text-vet-accent" : "text-slate-300"}`}>
                          {method.name}
                        </p>
                        <p className="text-[10px] text-slate-500">{isBs ? "Bolívares" : method.currency}</p>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Monto parcial */}
              {isPartialPayment && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-amber-400">Monto a abonar</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={remainingAfterCredit}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className={`w-full pl-7 pr-3 py-2.5 bg-slate-900/60 border rounded-lg text-lg font-semibold text-white focus:ring-2 ${
                        invalidPartialAmount
                          ? "border-red-500/50 focus:ring-red-500/50"
                          : "border-amber-500/30 focus:ring-amber-500/50"
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-amber-400/70 mt-1">Máximo: ${remainingAfterCredit.toFixed(2)}</p>
                </div>
              )}

              {/* Tasa de cambio para Bs */}
              {selectedMethodId && isBsMethod && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-400">Equivalente en Bolívares</span>
                    {isLoadingRate ? (
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <button
                        onClick={() => setUseManualRate(!useManualRate)}
                        className="text-[10px] text-blue-400 underline hover:text-blue-300 transition-colors"
                      >
                        {useManualRate ? "Usar BCV" : "Tasa manual"}
                      </button>
                    )}
                  </div>

                  {useManualRate ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Tasa:</span>
                      <div className="relative flex-1">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">Bs.</span>
                        <input
                          type="number"
                          step="0.01"
                          value={manualRate}
                          onChange={(e) => setManualRate(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-900/60 border border-blue-500/30 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500/50"
                          placeholder="Ej: 45.50"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-blue-400">
                      Tasa BCV: <span className="font-semibold">Bs. {currentRate.toFixed(2)}</span>
                    </p>
                  )}

                  {currentRate > 0 && paymentAmount > 0 && (
                    <p className="text-xl font-bold text-blue-400 mt-2">
                      Bs. {totalBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              )}

              {/* Referencia */}
              {selectedMethodId && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Referencia <span className="text-slate-600">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800/60 border border-white/10 rounded-lg text-sm text-white focus:ring-2 focus:ring-vet-accent/50 focus:border-vet-accent/50 placeholder:text-slate-500"
                    placeholder="Nro. de confirmación o referencia"
                  />
                </div>
              )}
            </div>
          )}

          {/* Resumen del pago */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-vet-accent" />
              Resumen del pago
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Total factura:</span>
                <span className="font-medium text-white">${amountUSD.toFixed(2)}</span>
              </div>

              {effectiveCredit > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Crédito aplicado:</span>
                  <span className="font-medium">-${effectiveCredit.toFixed(2)}</span>
                </div>
              )}

              {paymentAmount > 0 && selectedMethodId && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Pago {selectedMethod?.name}:</span>
                  <span className="font-medium text-white">
                    {isBsMethod && currentRate > 0
                      ? `Bs. ${totalBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`
                      : `$${paymentAmount.toFixed(2)}`}
                  </span>
                </div>
              )}

              <div className="pt-2 mt-2 border-t border-white/10 flex justify-between items-center">
                <span className="font-semibold text-white">Total a pagar:</span>
                <span className="text-xl font-bold text-vet-accent">
                  ${(effectiveCredit + paymentAmount).toFixed(2)}
                </span>
              </div>

              {isPartialPayment && paymentAmount > 0 && (
                <div className="flex justify-between text-amber-400 text-xs">
                  <span>Quedará pendiente:</span>
                  <span className="font-medium">
                    ${(amountUSD - effectiveCredit - paymentAmount).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex gap-3 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-slate-300 font-medium hover:bg-white/5 hover:border-white/20 transition-all duration-300 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              canSubmit
                ? "bg-gradient-to-r from-vet-accent to-cyan-400 hover:from-cyan-400 hover:to-vet-accent text-slate-900 shadow-lg hover:shadow-vet-accent/30"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                {creditCoversAll
                  ? "Usar crédito"
                  : isPartialPayment
                    ? "Abonar"
                    : "Pagar"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}