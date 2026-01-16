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

//  Función helper para fecha local
// const getLocalDateString = () => {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, '0');
//   const day = String(now.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// };

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

  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  const ownerId = typeof patient?.owner === "object" 
    ? patient.owner._id 
    : patient?.owner;

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
        <p className="text-vet-muted">Servicio no encontrado</p>
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-sky-soft border-b border-slate-700/50 shadow-lg shadow-black/10">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center gap-3">
          <Link
            to={`/patients/${patientId}/grooming-services/${serviceId}`}
            className="p-1.5 -ml-1.5 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-vet-muted hover:text-vet-text" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-vet-text">Editar Servicio</h1>
            <p className="text-xs text-vet-muted">{patientName}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <section className="space-y-4">
          {/* Fecha y Servicio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-vet-muted mb-1.5">Fecha</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-700 bg-sky-soft text-vet-text rounded-lg focus:outline-none focus:ring-2 focus:ring-vet-primary/30 focus:border-vet-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-vet-muted mb-1.5">Servicio</label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value as ServiceType })}
                className="w-full px-3 py-2 text-sm border border-slate-700 bg-sky-soft text-vet-text rounded-lg focus:outline-none focus:ring-2 focus:ring-vet-primary/30 focus:border-vet-primary transition-all appearance-none"
              >
                <option value="Corte">Corte</option>
                <option value="Baño">Baño</option>
                <option value="Corte y Baño">Corte y Baño</option>
              </select>
            </div>
          </div>

          {/* Costo */}
          <div>
            <label className="block text-xs font-medium text-vet-muted mb-1.5">Costo</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-vet-muted text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost || ""}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                className="w-full pl-7 pr-3 py-2 text-sm border border-slate-700 bg-sky-soft text-vet-text rounded-lg focus:outline-none focus:ring-2 focus:ring-vet-primary/30 focus:border-vet-primary transition-all placeholder:text-slate-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Alerta de cambio de costo */}
          {costChanged && invoice && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-300">
                  <p className="font-medium">La factura se actualizará automáticamente</p>
                  <p className="mt-0.5 text-amber-400/90">
                    Costo: ${service.cost.toFixed(2)} → ${formData.cost.toFixed(2)}
                    {newInvoiceTotal !== null && (
                      <span className="ml-2">• Nuevo total: ${newInvoiceTotal.toFixed(2)}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Especificaciones */}
          <div>
            <label className="block text-xs font-medium text-vet-muted mb-1.5">
              Especificaciones
            </label>
            <textarea
              value={formData.specifications}
              onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
              rows={2}
              maxLength={300}
              placeholder="Detalles del corte, estilo..."
              className="w-full px-3 py-2 text-sm border border-slate-700 bg-sky-soft text-vet-text rounded-lg focus:outline-none focus:ring-2 focus:ring-vet-primary/30 focus:border-vet-primary transition-all resize-none placeholder:text-slate-500"
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-medium text-vet-muted mb-1.5">
              Observaciones <span className="text-slate-500 font-normal">(opcional)</span>
            </label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              rows={2}
              placeholder="Notas adicionales..."
              className="w-full px-3 py-2 text-sm border border-slate-700 bg-sky-soft text-vet-text rounded-lg focus:outline-none focus:ring-2 focus:ring-vet-primary/30 focus:border-vet-primary transition-all resize-none placeholder:text-slate-500"
            />
          </div>

          {/* Botón Guardar */}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-vet-primary to-vet-secondary hover:from-vet-secondary hover:to-vet-primary text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-vet-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Sección de Pago */}
        <section className="mt-6 -mx-4 px-4 py-5 bg-vet-light/50 border-y border-slate-700/30">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-vet-text">Pago</h2>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                  paymentInfo.status === "Pagado"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : paymentInfo.status === "Parcial"
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    : paymentInfo.status === "Pendiente"
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : "bg-slate-700 text-slate-400 border-slate-600"
                }`}
              >
                {paymentInfo.status === "Pagado" && <Check className="w-3 h-3" />}
                {paymentInfo.status === "Parcial" && <Clock className="w-3 h-3" />}
                {paymentInfo.status === "Pendiente" && <AlertCircle className="w-3 h-3" />}
                {paymentInfo.status}
              </span>
            </div>

            {/* Crédito disponible */}
            {ownerCreditBalance > 0 && paymentInfo.status !== "Pagado" && paymentInfo.status !== "Sin facturar" && (
              <div className="mb-3 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Crédito disponible: <strong>${ownerCreditBalance.toFixed(2)}</strong></span>
                </p>
              </div>
            )}

            {paymentInfo.status !== "Sin facturar" ? (
              <div className="space-y-3">
                {/* Barra de progreso */}
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      progress === 100 ? "bg-emerald-500" : "bg-vet-primary"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Montos */}
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-vet-muted text-xs">Pagado</p>
                    <p className="font-semibold text-vet-text">${paymentInfo.amountPaid.toFixed(2)}</p>
                    {(paymentInfo.amountPaidUSD > 0 || paymentInfo.amountPaidBs > 0) && (
                      <div className="flex gap-2 text-xs text-slate-500 mt-0.5">
                        {paymentInfo.amountPaidUSD > 0 && <span>${paymentInfo.amountPaidUSD.toFixed(2)} USD</span>}
                        {paymentInfo.amountPaidBs > 0 && <span>Bs {paymentInfo.amountPaidBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</span>}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-vet-muted text-xs">Pendiente</p>
                    <p className={`font-semibold ${paymentInfo.pending > 0 ? "text-red-400" : "text-emerald-400"}`}>
                      ${paymentInfo.pending.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Botón registrar pago */}
                {paymentInfo.pending > 0 && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-vet-accent border border-vet-primary/30 bg-vet-primary/10 rounded-lg hover:bg-vet-primary/20 transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Registrar Pago
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-vet-muted text-center py-2">
                Sin factura asociada
              </p>
            )}
          </div>
        </section>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && invoice && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handlePaymentConfirm}
          amountUSD={paymentInfo.pending}
          creditBalance={ownerCreditBalance}
          title="Registrar Pago"
          subtitle={`${service.service} • ${patientName}`}
          services={[
            {
              description: service.service,
              quantity: 1,
              unitPrice: service.cost,
              total: service.cost,
            },
          ]}
          patient={{
            name: patientName,
          }}
          allowPartial={true}
        />
      )}
    </div>
  );
}