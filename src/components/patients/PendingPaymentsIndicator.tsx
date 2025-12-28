// src/components/patients/PendingPaymentsIndicator.tsx
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  DollarSign, 
  AlertCircle, 
  Clock,
  CreditCard,
  FileText,
  CheckCircle2
} from "lucide-react";
import { getPatientDebtSummary } from "../../api/invoiceAPI";
import { createPayment } from "../../api/paymentAPI";
import { getPatientById } from "../../api/patientAPI";
import { getOwnersById } from "../../api/OwnerAPI";
import { PaymentModal } from "../payment/PaymentModal";
import Portal from "../ui/Portal";
import { toast } from "../Toast";
import type { Invoice } from "../../types/invoice";

interface PendingPaymentsIndicatorProps {
  patientId: string;
}

const getItemIcon = (type: string) => {
  switch (type) {
    case "consulta": return "🩺";
    case "vacuna": return "💉";
    case "grooming": return "✂️";
    case "labExam": return "🔬";
    case "producto": return "📦";
    default: return "📋";
  }
};

const formatItemType = (type: string) => {
  const types: Record<string, string> = {
    consulta: "Consulta",
    vacuna: "Vacuna",
    grooming: "Peluquería",
    labExam: "Laboratorio",
    producto: "Producto",
  };
  return types[type] || type;
};

export default function PendingPaymentsIndicator({ patientId }: PendingPaymentsIndicatorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: debtSummary, isLoading } = useQuery({
    queryKey: ["patientDebt", patientId],
    queryFn: () => getPatientDebtSummary(patientId),
    enabled: !!patientId,
    refetchInterval: 30000,
  });

  // Obtener datos del paciente
  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId),
    enabled: !!patientId,
  });

  // Obtener el ownerId del paciente
  const ownerId = typeof patient?.owner === "object" 
    ? patient.owner._id 
    : patient?.owner;

  // Query para obtener el owner con creditBalance
  const { data: owner } = useQuery({
    queryKey: ["owner", ownerId],
    queryFn: () => getOwnersById(ownerId!),
    enabled: !!ownerId,
  });

  const ownerCreditBalance = owner?.creditBalance || 0;

  const { mutate: processPayment } = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      toast.success("Pago procesado con éxito");
      queryClient.invalidateQueries({ queryKey: ["patientDebt", patientId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      queryClient.invalidateQueries({ queryKey: ["owner", ownerId] });
      setSelectedInvoice(null);
      setIsPaymentModalOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al procesar el pago");
    },
  });

  const hasPendingPayments = (debtSummary?.invoicesCount || 0) > 0;
  const totalDebt = debtSummary?.totalDebt || 0;
  const invoicesCount = debtSummary?.invoicesCount || 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showDropdown]);

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDropdown(false);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedInvoice(null);
  };

  const handlePaymentConfirm = async (paymentData: {
    paymentMethodId?: string;
    reference?: string;
    addAmountPaidUSD: number;
    addAmountPaidBs: number;
    exchangeRate: number;
    isPartial: boolean;
    creditAmountUsed?: number;
  }) => {
    if (!selectedInvoice || !selectedInvoice._id) {
      toast.error("No hay factura seleccionada");
      return;
    }

    const isPayingInBs = paymentData.addAmountPaidBs > 0;
    const amount = isPayingInBs
      ? paymentData.addAmountPaidBs
      : paymentData.addAmountPaidUSD;
    const currency = isPayingInBs ? "Bs" : "USD";

    const payload: any = {
      invoiceId: selectedInvoice._id,
      currency,
      exchangeRate: paymentData.exchangeRate || 1,
    };

    if (amount > 0) {
      payload.amount = amount;
      if (paymentData.paymentMethodId) {
        payload.paymentMethod = paymentData.paymentMethodId;
      }
      if (paymentData.reference) {
        payload.reference = paymentData.reference;
      }
    }

    if (paymentData.creditAmountUsed && paymentData.creditAmountUsed > 0) {
      payload.creditAmountUsed = paymentData.creditAmountUsed;
    }

    if (!payload.amount && !payload.creditAmountUsed) {
      toast.error("Debe especificar un monto o usar crédito");
      return;
    }

    processPayment(payload);
  };

  const getInvoiceRemainingAmount = (invoice: Invoice): number => {
    return invoice.total - (invoice.amountPaid || 0);
  };

  if (isLoading) {
    return (
      <div className="p-2.5 rounded-xl bg-gray-50 animate-pulse">
        <DollarSign className="w-5 h-5 text-gray-300" />
      </div>
    );
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Botón indicador */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasPendingPayments) {
              setShowDropdown(!showDropdown);
            }
          }}
          onMouseEnter={() => !hasPendingPayments && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`relative p-2.5 rounded-xl transition-all duration-300 ${
            hasPendingPayments
              ? "bg-gradient-to-br from-amber-50 to-orange-100 hover:from-amber-100 hover:to-orange-200 shadow-sm hover:shadow-md"
              : "bg-gray-50 hover:bg-gray-100"
          }`}
        >
          <DollarSign className="w-5 h-5 text-gray-900" />
          
          {hasPendingPayments && (
            <>
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-gradient-to-br from-red-500 to-red-600 rounded-full border-2 border-white shadow-lg animate-pulse">
                {invoicesCount}
              </span>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-400 rounded-full animate-ping opacity-20" />
            </>
          )}
        </button>

        {/* Tooltip */}
        {showTooltip && !hasPendingPayments && (
          <div className="absolute right-0 top-full mt-3 z-50 pointer-events-none">
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white px-3 py-2 rounded-lg shadow-2xl whitespace-nowrap text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Sin pagos pendientes
              </div>
              <div className="absolute -top-1.5 right-3 w-3 h-3 bg-gray-900 transform rotate-45" />
            </div>
          </div>
        )}

        {/* Dropdown */}
        {hasPendingPayments && showDropdown && (
          <div className="absolute right-0 top-full mt-3 w-80 max-w-[calc(100vw-24px)] bg-white border border-gray-200 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">Pagos Pendientes</p>
                  <p className="text-xs text-amber-100">
                    {invoicesCount} factura{invoicesCount !== 1 ? "s" : ""} • Total: ${totalDebt.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto">
              {debtSummary?.invoices.map((invoice: Invoice) => {
                const remaining = getInvoiceRemainingAmount(invoice);
                const isParcial = invoice.paymentStatus === "Parcial";
                
                return (
                  <button
                    key={invoice._id}
                    onClick={() => handleInvoiceClick(invoice)}
                    className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-amber-50 hover:to-transparent transition-all duration-200 border-b border-gray-100 last:border-b-0 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
                        isParcial 
                          ? "bg-gradient-to-br from-blue-100 to-blue-200" 
                          : "bg-gradient-to-br from-amber-100 to-orange-200"
                      }`}>
                        <FileText className={`w-5 h-5 ${isParcial ? "text-blue-600" : "text-amber-600"}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-1 mb-1">
                          {invoice.items.slice(0, 2).map((item, idx) => (
                            <span 
                              key={idx}
                              className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
                            >
                              {getItemIcon(item.type)}
                              {formatItemType(item.type)}
                            </span>
                          ))}
                          {invoice.items.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{invoice.items.length - 2}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {new Date(invoice.date).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>

                        <div className="flex items-center justify-between mt-1.5">
                          <span className={`text-sm font-bold ${
                            isParcial ? "text-blue-600" : "text-amber-600"
                          }`}>
                            ${remaining.toFixed(2)}
                          </span>
                          
                          {isParcial && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                              Parcial
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-shrink-0 p-2 rounded-lg bg-emerald-100 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CreditCard className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Click en una factura para procesar el pago
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Pago */}
      <Portal>
        <PaymentModal
          isOpen={isPaymentModalOpen && !!selectedInvoice}
          onClose={handleClosePaymentModal}
          onConfirm={handlePaymentConfirm}
          amountUSD={selectedInvoice ? getInvoiceRemainingAmount(selectedInvoice) : 0}
          creditBalance={ownerCreditBalance}
          items={selectedInvoice?.items.map(item => ({
            id: item.resourceId.toString(),
            description: item.description,
          })) || []}
          title="Procesar Pago"
          subtitle={selectedInvoice ? `Factura del ${new Date(selectedInvoice.date).toLocaleDateString("es-ES")}` : ""}
          allowPartial={true}
        />
      </Portal>
    </>
  );
}