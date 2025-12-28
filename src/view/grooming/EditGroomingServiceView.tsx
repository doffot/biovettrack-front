// src/views/grooming/EditGroomingServiceView.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../components/Toast";
import {
  updateGroomingService,
  getGroomingServiceById,
} from "../../api/groomingAPI";
import { getInvoices, updateInvoiceItem } from "../../api/invoiceAPI";
import { createPayment } from "../../api/paymentAPI";
import { getPatientById } from "../../api/patientAPI";
import { getOwnersById } from "../../api/OwnerAPI";
import { PaymentModal } from "../../components/payment/PaymentModal";

import {
  ArrowLeft,
  Check,
  AlertCircle,
  Clock,
  AlertTriangle,
  Save,
  CreditCard,
} from "lucide-react";
import type { ServiceType } from "../../types";
import type { Invoice } from "../../types/invoice";

export default function EditGroomingServiceView() {
  const { patientId, serviceId } = useParams<{ patientId: string; serviceId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [formData, setFormData] = useState({
    service: "Corte" as ServiceType,
    specifications: "",
    observations: "",
    cost: 0,
    date: "",
  });

  const { data: service, isLoading: isLoadingService } = useQuery({
    queryKey: ["groomingService", serviceId],
    queryFn: () => getGroomingServiceById(serviceId!),
    enabled: !!serviceId,
  });

  const { data: invoicesData } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => getInvoices({}),
    enabled: !!service,
  });

  // Obtener datos del paciente
  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
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

  const invoices = invoicesData?.invoices || [];

  const invoice = invoices.find((inv: Invoice) =>
    inv.items.some(
      (item) => item.type === "grooming" && item.resourceId === serviceId
    )
  );

  const getPaymentInfo = () => {
    if (!invoice) {
      return {
        status: "Sin facturar",
        amountPaid: 0,
        amountPaidUSD: 0,
        amountPaidBs: 0,
        total: service?.cost || 0,
        pending: service?.cost || 0,
      };
    }

    return {
      status: invoice.paymentStatus,
      amountPaid: invoice.amountPaid || 0,
      amountPaidUSD: invoice.amountPaidUSD || 0,
      amountPaidBs: invoice.amountPaidBs || 0,
      total: invoice.total,
      pending: invoice.total - (invoice.amountPaid || 0),
    };
  };

  const paymentInfo = getPaymentInfo();

  useEffect(() => {
    if (service) {
      setFormData({
        service: service.service,
        specifications: service.specifications,
        observations: service.observations || "",
        cost: service.cost,
        date: service.date.split("T")[0],
      });
    }
  }, [service]);

  const { mutate: updateServiceAndInvoice, isPending } = useMutation({
    mutationFn: async (updates: Partial<typeof formData>) => {
      await updateGroomingService({ formData: updates, groomingId: serviceId! });

      if (invoice && invoice._id && updates.cost !== undefined && updates.cost !== service?.cost) {
        const newDescription = updates.service 
          ? `${updates.service} - ${updates.specifications || formData.specifications || "Servicio de grooming"}`
          : undefined;

        await updateInvoiceItem(invoice._id, serviceId!, {
          cost: updates.cost,
          ...(newDescription && { description: newDescription }),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar");
    },
    onSuccess: () => {
      toast.success(
        invoice && formData.cost !== service?.cost 
          ? "Servicio y factura actualizados" 
          : "Servicio actualizado"
      );
      queryClient.invalidateQueries({ queryKey: ["groomingService", serviceId] });
      queryClient.invalidateQueries({ queryKey: ["groomingServices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      
      navigate(`/patients/${patientId}/grooming-services/${serviceId}`);
    },
  });

  const handlePaymentConfirm = async (paymentData: {
    paymentMethodId?: string;
    reference?: string;
    addAmountPaidUSD: number;
    addAmountPaidBs: number;
    exchangeRate: number;
    isPartial: boolean;
    creditAmountUsed?: number;
  }) => {
    if (!invoice || !invoice._id) {
      toast.error("No hay factura asociada");
      return;
    }

    if (!paymentData.paymentMethodId && !paymentData.creditAmountUsed) {
      toast.error("Debe seleccionar un método de pago o usar crédito");
      return;
    }

    try {
      const isPayingInBs = paymentData.addAmountPaidBs > 0;
      const amount = isPayingInBs 
        ? paymentData.addAmountPaidBs 
        : paymentData.addAmountPaidUSD;
     const currency: "USD" | "Bs" = isPayingInBs ? "Bs" : "USD";

     const payload: {
  invoiceId: string;
  amount?: number;
  currency: "USD" | "Bs";
  exchangeRate: number;
  paymentMethod?: string;
  reference?: string;
  creditAmountUsed?: number;
} = {
  invoiceId: invoice._id,
  currency,
  exchangeRate: paymentData.exchangeRate,
};

      if (amount > 0 && paymentData.paymentMethodId) {
        payload.amount = amount;
        payload.paymentMethod = paymentData.paymentMethodId;
        if (paymentData.reference) {
          payload.reference = paymentData.reference;
        }
      }

      if (paymentData.creditAmountUsed && paymentData.creditAmountUsed > 0) {
        payload.creditAmountUsed = paymentData.creditAmountUsed;
      }

      await createPayment(payload);

      toast.success(paymentData.isPartial ? "Abono registrado" : "Pago completado");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["owner", ownerId] });
      queryClient.invalidateQueries({ queryKey: ["patientDebt", patientId] });
      setShowPaymentModal(false);
    } catch {
      toast.error("Error al procesar pago");
    }
  };

  const handleSave = () => {
    const updates: Partial<typeof formData> = {};
    if (formData.service !== service?.service) updates.service = formData.service;
    if (formData.specifications !== service?.specifications) updates.specifications = formData.specifications;
    if (formData.observations !== (service?.observations || "")) updates.observations = formData.observations;
    if (formData.cost !== service?.cost) updates.cost = formData.cost;
    if (formData.date !== service?.date.split("T")[0]) updates.date = formData.date;

    if (Object.keys(updates).length === 0) {
      toast.info("Sin cambios");
      return;
    }
    
    updateServiceAndInvoice(updates);
  };

  const costChanged = service && formData.cost !== service.cost;
  const newInvoiceTotal = invoice && costChanged 
    ? invoice.total - service.cost + formData.cost 
    : null;

  if (isLoadingService) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-vet-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Servicio no encontrado</p>
      </div>
    );
  }

  const patientName = typeof service.patientId === "string" 
    ? "Mascota" 
    : service.patientId?.name || "Mascota";

  const progress = paymentInfo.total > 0 
    ? Math.min((paymentInfo.amountPaid / paymentInfo.total) * 100, 100) 
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center gap-3">
          <Link
            to={`/patients/${patientId}/grooming-services/${serviceId}`}
            className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">Editar Servicio</h1>
            <p className="text-xs text-gray-500">{patientName}</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Fecha</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Servicio</label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value as ServiceType })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all appearance-none bg-white"
              >
                <option value="Corte">Corte</option>
                <option value="Baño">Baño</option>
                <option value="Corte y Baño">Corte y Baño</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Costo</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost || ""}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          {costChanged && invoice && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-800">
                  <p className="font-medium">La factura se actualizará automáticamente</p>
                  <p className="mt-0.5">
                    Costo: ${service.cost.toFixed(2)} → ${formData.cost.toFixed(2)}
                    {newInvoiceTotal !== null && (
                      <span className="ml-2">• Nuevo total: ${newInvoiceTotal.toFixed(2)}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Especificaciones
            </label>
            <textarea
              value={formData.specifications}
              onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
              rows={2}
              maxLength={300}
              placeholder="Detalles del corte, estilo..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Observaciones <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              rows={2}
              placeholder="Notas adicionales..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-vet-primary hover:bg-vet-secondary text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {costChanged && invoice ? "Guardar y Actualizar Factura" : "Guardar Cambios"}
              </>
            )}
          </button>
        </section>

        <section className="mt-6 -mx-4 px-4 py-5 bg-vet-light">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Pago</h2>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  paymentInfo.status === "Pagado"
                    ? "bg-emerald-100 text-emerald-700"
                    : paymentInfo.status === "Parcial"
                    ? "bg-amber-100 text-amber-700"
                    : paymentInfo.status === "Pendiente"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {paymentInfo.status === "Pagado" && <Check className="w-3 h-3" />}
                {paymentInfo.status === "Parcial" && <Clock className="w-3 h-3" />}
                {paymentInfo.status === "Pendiente" && <AlertCircle className="w-3 h-3" />}
                {paymentInfo.status}
              </span>
            </div>

            {/* Mostrar crédito disponible si el owner tiene */}
            {ownerCreditBalance > 0 && paymentInfo.status !== "Pagado" && paymentInfo.status !== "Sin facturar" && (
              <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-xs text-emerald-700 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Crédito disponible: <strong>${ownerCreditBalance.toFixed(2)}</strong></span>
                </p>
              </div>
            )}

            {paymentInfo.status !== "Sin facturar" ? (
              <div className="space-y-3">
                <div className="h-1.5 bg-white rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      progress === 100 ? "bg-emerald-500" : "bg-vet-primary"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Pagado</p>
                    <p className="font-semibold text-gray-900">${paymentInfo.amountPaid.toFixed(2)}</p>
                    {(paymentInfo.amountPaidUSD > 0 || paymentInfo.amountPaidBs > 0) && (
                      <div className="flex gap-2 text-xs text-gray-400 mt-0.5">
                        {paymentInfo.amountPaidUSD > 0 && <span>${paymentInfo.amountPaidUSD.toFixed(2)} USD</span>}
                        {paymentInfo.amountPaidBs > 0 && <span>Bs {paymentInfo.amountPaidBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</span>}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-xs">Pendiente</p>
                    <p className={`font-semibold ${paymentInfo.pending > 0 ? "text-red-600" : "text-emerald-600"}`}>
                      ${paymentInfo.pending.toFixed(2)}
                    </p>
                  </div>
                </div>

                {paymentInfo.pending > 0 && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-vet-primary border border-vet-primary/30 rounded-lg hover:bg-white transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Registrar Pago
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-2">
                Sin factura asociada
              </p>
            )}
          </div>
        </section>
      </main>

      {showPaymentModal && invoice && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amountUSD={paymentInfo.pending}
          creditBalance={ownerCreditBalance}
          title="Registrar Pago"
          subtitle={`${service.service} • ${patientName}`}
          items={[{ description: service.service, patientName, date: service.date }]}
          allowPartial={true}
          onConfirm={handlePaymentConfirm}
        />
      )}
    </div>
  );
}