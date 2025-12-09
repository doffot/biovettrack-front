// src/views/grooming/EditGroomingServiceView.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../components/Toast";
import {
  updateGroomingService,
  getGroomingServiceById,
} from "../../api/groomingAPI";
import { getInvoices, updateInvoice } from "../../api/invoiceAPI";
import { PaymentModal } from "../../components/payment/PaymentModal";
import { extractId } from "../../utils/extractId";

import {
  Scissors,
  ArrowLeft,
  Check,
  AlertCircle,
  Clock,
} from "lucide-react";
import type { ServiceStatus, ServiceType } from "../../types";
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
    status: "Programado" as ServiceStatus,
    date: "",
  });

  const { data: service, isLoading: isLoadingService } = useQuery({
    queryKey: ["groomingService", serviceId],
    queryFn: () => getGroomingServiceById(serviceId),
    enabled: !!serviceId,
  });

  const { data: invoicesData } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => getInvoices({}),
    enabled: !!service,
  });

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
        status: service.status,
        date: service.date.split("T")[0],
      });
    }
  }, [service]);

  const { mutate: updateService, isPending } = useMutation({
    mutationFn: (updates: Partial<typeof formData>) =>
      updateGroomingService({ formData: updates, groomingId: serviceId }),
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar");
    },
    onSuccess: () => {
      toast.success("Servicio actualizado");
      queryClient.invalidateQueries({ queryKey: ["groomingService", serviceId] });
      queryClient.invalidateQueries({ queryKey: ["groomingServices"] });
      navigate(`/patients/${patientId}/grooming-services/${serviceId}`);
    },
  });

  const handlePaymentConfirm = async (paymentData: {
    paymentMethodId: string;
    reference?: string;
    amountPaidUSD: number;
    amountPaidBs: number;
    exchangeRate: number;
    isPartial: boolean;
  }) => {
    if (!invoice) {
      toast.error("No hay factura asociada");
      return;
    }

    try {
      await updateInvoice(invoice._id!, {
        amountPaidUSD: (invoice.amountPaidUSD || 0) + paymentData.amountPaidUSD,
        amountPaidBs: (invoice.amountPaidBs || 0) + paymentData.amountPaidBs,
        paymentMethod: paymentData.paymentMethodId,
        paymentReference: paymentData.reference,
        exchangeRate: paymentData.exchangeRate,
      });

      toast.success(paymentData.isPartial ? "Abono registrado" : "Pago completado");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
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
    if (formData.status !== service?.status) updates.status = formData.status;
    if (formData.date !== service?.date.split("T")[0]) updates.date = formData.date;

    if (Object.keys(updates).length === 0) {
      toast.info("Sin cambios");
      return;
    }
    updateService(updates);
  };

  if (isLoadingService) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
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
      {/* Header fijo */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {isPending ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Guardar
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Formulario */}
        <section className="space-y-4">
          {/* Fecha y Servicio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Fecha</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Servicio</label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value as ServiceType })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all appearance-none bg-white"
              >
                <option value="Corte">Corte</option>
                <option value="Baño">Baño</option>
                <option value="Corte y Baño">Corte y Baño</option>
              </select>
            </div>
          </div>

          {/* Estado y Costo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ServiceStatus })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all appearance-none bg-white"
              >
                <option value="Programado">Programado</option>
                <option value="En progreso">En progreso</option>
                <option value="Completado">Completado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
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
                  className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Especificaciones */}
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
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all resize-none"
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Observaciones <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              rows={2}
              placeholder="Notas adicionales..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all resize-none"
            />
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Sección de Pago */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Pago</h2>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                paymentInfo.status === "Pagado"
                  ? "bg-emerald-50 text-emerald-700"
                  : paymentInfo.status === "Parcial"
                  ? "bg-amber-50 text-amber-700"
                  : paymentInfo.status === "Pendiente"
                  ? "bg-red-50 text-red-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {paymentInfo.status === "Pagado" && <Check className="w-3 h-3" />}
              {paymentInfo.status === "Parcial" && <Clock className="w-3 h-3" />}
              {paymentInfo.status === "Pendiente" && <AlertCircle className="w-3 h-3" />}
              {paymentInfo.status}
            </span>
          </div>

          {paymentInfo.status !== "Sin facturar" ? (
            <div className="space-y-4">
              {/* Progress bar minimalista */}
              <div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      progress === 100 ? "bg-emerald-500" : "bg-gray-900"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Montos en línea */}
              <div className="flex items-center justify-between text-sm">
                <div className="space-y-0.5">
                  <p className="text-gray-500 text-xs">Pagado</p>
                  <p className="font-semibold text-gray-900">${paymentInfo.amountPaid.toFixed(2)}</p>
                  {/* Desglose */}
                  {(paymentInfo.amountPaidUSD > 0 || paymentInfo.amountPaidBs > 0) && (
                    <div className="flex gap-2 text-xs text-gray-400">
                      {paymentInfo.amountPaidUSD > 0 && (
                        <span>${paymentInfo.amountPaidUSD.toFixed(2)} USD</span>
                      )}
                      {paymentInfo.amountPaidBs > 0 && (
                        <span>Bs {paymentInfo.amountPaidBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-gray-500 text-xs">Pendiente</p>
                  <p className={`font-semibold ${paymentInfo.pending > 0 ? "text-red-600" : "text-emerald-600"}`}>
                    ${paymentInfo.pending.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Botón de pago */}
              {paymentInfo.pending > 0 && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Registrar Pago
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">
              Sin factura asociada
            </p>
          )}
        </section>
      </main>

      {/* Modal de Pago */}
      {showPaymentModal && invoice && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amountUSD={paymentInfo.pending}
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