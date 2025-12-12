// src/components/patients/PendingPaymentsBanner.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ChevronRight, DollarSign, CreditCard, X } from "lucide-react";
import { getPatientDebtSummary, updateInvoice } from "../../api/invoiceAPI";
import { PaymentModal } from "../payment/PaymentModal";
import Portal from "../ui/Portal";
import { toast } from "../Toast";
import type { Invoice } from "../../types/invoice";

interface PendingPaymentsBannerProps {
  patientId: string;
}

export default function PendingPaymentsBanner({ patientId }: PendingPaymentsBannerProps) {
  const [showInvoiceList, setShowInvoiceList] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const queryClient = useQueryClient();

  const { data: debtSummary, isLoading } = useQuery({
    queryKey: ["patientDebt", patientId],
    queryFn: () => getPatientDebtSummary(patientId),
    enabled: !!patientId,
  });

  const { mutate: processPayment } = useMutation({
    mutationFn: async (paymentData: {
      invoiceId: string;
      paymentMethodId: string;
      reference?: string;
      amountPaidUSD: number;
      amountPaidBs: number;
      exchangeRate: number;
    }) => {
      const invoice = selectedInvoice;
      if (!invoice) throw new Error("No hay factura seleccionada");

      return updateInvoice(paymentData.invoiceId, {
        paymentMethod: paymentData.paymentMethodId,
        paymentReference: paymentData.reference,
        amountPaidUSD: (invoice.amountPaidUSD || 0) + paymentData.amountPaidUSD,
        amountPaidBs: (invoice.amountPaidBs || 0) + paymentData.amountPaidBs,
        exchangeRate: paymentData.exchangeRate,
      });
    },
    onSuccess: () => {
      toast.success("Pago procesado con éxito");
      queryClient.invalidateQueries({ queryKey: ["patientDebt", patientId] });
      setSelectedInvoice(null);
      setShowInvoiceList(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al procesar el pago");
    },
  });

  if (isLoading || !debtSummary || debtSummary.invoicesCount === 0) {
    return null;
  }

  const { totalDebt, invoicesCount, invoices } = debtSummary;

  const getInvoiceRemainingAmount = (invoice: Invoice): number => {
    return invoice.total - (invoice.amountPaid || 0);
  };

  const handlePaymentConfirm = (paymentData: {
    paymentMethodId: string;
    reference?: string;
    amountPaidUSD: number;
    amountPaidBs: number;
    exchangeRate: number;
    isPartial: boolean;
  }) => {
    if (!selectedInvoice?._id) return;

    processPayment({
      invoiceId: selectedInvoice._id,
      ...paymentData,
    });
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "consulta": return "🩺";
      case "vacuna": return "💉";
      case "grooming": return "✂️";
      case "labExam": return "🔬";
      default: return "📋";
    }
  };

  return (
    <>
      <div className="mb-4 animate-fade-in-up">
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-2xl p-4 shadow-soft">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
          
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0 p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-md">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              
              <div className="min-w-0">
                <p className="font-bold text-amber-800 text-sm sm:text-base">
                  {invoicesCount} factura{invoicesCount !== 1 ? "s" : ""} pendiente{invoicesCount !== 1 ? "s" : ""} de pago
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                  <span className="text-lg sm:text-xl font-bold text-amber-700">
                    ${totalDebt.toFixed(2)}
                  </span>
                  <span className="text-xs text-amber-600 hidden sm:inline">
                    USD pendientes
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInvoiceList(true)}
              className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Pagar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-200">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 animate-pulse"
              style={{ width: "60%" }}
            />
          </div>
        </div>
      </div>

      {/* Modal de lista de facturas usando Portal */}
      {showInvoiceList && (
        <Portal>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Facturas Pendientes</h3>
                      <p className="text-sm text-amber-100">Selecciona una factura para pagar</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInvoiceList(false)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Lista */}
              <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                {invoices.map((invoice: Invoice) => {
                  const remaining = getInvoiceRemainingAmount(invoice);
                  const isParcial = invoice.paymentStatus === "Parcial";

                  return (
                    <button
                      key={invoice._id}
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setShowInvoiceList(false);
                      }}
                      className="w-full text-left bg-gray-50 hover:bg-amber-50 border border-gray-200 hover:border-amber-300 rounded-xl p-4 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {invoice.items.map((item, idx) => (
                              <span 
                                key={idx}
                                className="inline-flex items-center gap-1 text-xs bg-white text-gray-700 px-2 py-1 rounded-full border border-gray-200"
                              >
                                {getItemIcon(item.type)}
                                {item.description}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>
                              {new Date(invoice.date).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                            {isParcial && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                                Pago parcial
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-amber-600">
                            ${remaining.toFixed(2)}
                          </p>
                          {isParcial && (
                            <p className="text-xs text-gray-500">
                              de ${invoice.total.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total pendiente:</span>
                  <span className="text-xl font-bold text-amber-600">${totalDebt.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Modal de Pago usando Portal */}
      {selectedInvoice && (
        <Portal>
          <PaymentModal
            isOpen={!!selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            onConfirm={handlePaymentConfirm}
            amountUSD={getInvoiceRemainingAmount(selectedInvoice)}
            items={selectedInvoice.items.map(item => ({
              id: item.resourceId.toString(),
              description: item.description,
            }))}
            title="Procesar Pago"
            subtitle={`Factura del ${new Date(selectedInvoice.date).toLocaleDateString("es-ES")}`}
            allowPartial={true}
          />
        </Portal>
      )}
    </>
  );
}