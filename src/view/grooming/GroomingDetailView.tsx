// src/views/grooming/GroomingDetailView.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import {
  Scissors,
  Edit3,
  Trash2,
  ArrowLeft,
  CreditCard,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "../../components/Toast";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { PaymentModal } from "../../components/payment/PaymentModal";
import {
  deleteGroomingService,
  getGroomingServiceById,
} from "../../api/groomingAPI";
import { getInvoices } from "../../api/invoiceAPI";
import { createPayment } from "../../api/paymentAPI";
import { extractId } from "../../utils/extractId";
import type { Invoice } from "../../types/invoice";

export default function GroomingDetailView() {
  const navigate = useNavigate();
  const { serviceId } = useParams<{ serviceId?: string }>();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Query para el servicio
  const { data: service, isLoading } = useQuery({
    queryKey: ["groomingService", serviceId],
    queryFn: () => getGroomingServiceById(serviceId!),
    enabled: !!serviceId,
  });

  // Query para buscar la factura de este servicio
  const { data: invoicesData } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => getInvoices({}),
    enabled: !!service,
  });

  const invoices = invoicesData?.invoices || [];

  // Buscar factura relacionada con este servicio
  const invoice = invoices.find((inv: Invoice) =>
    inv.items.some(
      (item) => item.type === "grooming" && item.resourceId === serviceId
    )
  );

  // Obtener información de pago
  const getPaymentInfo = () => {
    if (!invoice) {
      return {
        status: "Sin facturar",
        amountPaid: 0,
        amountPaidUSD: 0,
        amountPaidBs: 0,
        total: service?.cost || 0,
        pending: service?.cost || 0,
        currency: "USD",
        invoiceId: null,
      };
    }

    const serviceItem = invoice.items.find(
      (item) => item.type === "grooming" && item.resourceId === serviceId
    );
    const serviceAmount = serviceItem
      ? serviceItem.cost * serviceItem.quantity
      : 0;

    const amountPaidUSD = invoice.amountPaidUSD || 0;
    const amountPaidBs = invoice.amountPaidBs || 0;
    const amountPaid = invoice.amountPaid || 0;

    return {
      status: invoice.paymentStatus,
      amountPaid,
      amountPaidUSD,
      amountPaidBs,
      total: serviceAmount,
      pending: serviceAmount - amountPaid,
      currency: invoice.currency || "USD",
      exchangeRate: invoice.exchangeRate,
      invoiceId: invoice._id,
      invoiceTotal: invoice.total,
    };
  };

  const paymentInfo = getPaymentInfo();

  // Mutations
  const { mutate: removeService, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteGroomingService(serviceId!),
    onError: (error) => {
      toast.error(error.message || "Error al eliminar el servicio");
      setShowDeleteModal(false);
    },
    onSuccess: () => {
      toast.success("Servicio eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["groomingServices"] });
      setShowDeleteModal(false);
      const patientId = extractId(service?.patientId);
      navigate(patientId ? `/patients/${patientId}/grooming-services` : "/grooming");
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
      toast.error("Debe seleccionar un método de pago");
      return;
    }

    try {
      const isPayingInBs = paymentData.addAmountPaidBs > 0;
      const amount = isPayingInBs 
        ? paymentData.addAmountPaidBs 
        : paymentData.addAmountPaidUSD;
      const currency = isPayingInBs ? "Bs" : "USD";

      if (amount > 0 && paymentData.paymentMethodId) {
        await createPayment({
          invoiceId: invoice._id,
          amount,
          currency,
          exchangeRate: paymentData.exchangeRate,
          paymentMethod: paymentData.paymentMethodId,
          reference: paymentData.reference,
        });
      }

      toast.success(paymentData.isPartial ? "Abono registrado" : "Pago completado");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setShowPaymentModal(false);
    } catch {
      toast.error("Error al procesar pago");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-vet-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Scissors className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">Servicio no encontrado</p>
          <Link to="/grooming" className="text-vet-primary hover:underline">
            Volver
          </Link>
        </div>
      </div>
    );
  }

  const patientId = extractId(service.patientId);
  const patientName =
    typeof service.patientId === "string"
      ? "Mascota"
      : service.patientId?.name || "Mascota";

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const progressPercent = paymentInfo.total > 0 
    ? Math.min((paymentInfo.amountPaid / paymentInfo.total) * 100, 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header minimalista */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to={`/patients/${patientId}/grooming-services`}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Volver</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to={`/patients/${patientId}/grooming-services/${service._id}/edit`}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Encabezado del servicio */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-vet-primary/10 rounded-xl flex items-center justify-center">
                <Scissors className="w-6 h-6 text-vet-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {service.service}
                </h1>
                <p className="text-sm text-gray-500">{patientName}</p>
              </div>
            </div>
          </div>

          {/* Detalles */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Fecha</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(service.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Costo</p>
                  <p className="text-sm font-medium text-gray-900">
                    ${service.cost.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {service.specifications && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Especificaciones</p>
                <p className="text-sm text-gray-700">{service.specifications}</p>
              </div>
            )}

            {service.observations && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Observaciones</p>
                <p className="text-sm text-gray-700">{service.observations}</p>
              </div>
            )}
          </div>

          {/* Sección de Pago */}
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                Estado de Pago
              </h3>

              {/* Badge de estado de pago - ✅ ESTO SÍ SE MANTIENE */}
              <span
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  paymentInfo.status === "Pagado"
                    ? "bg-green-100 text-green-700"
                    : paymentInfo.status === "Parcial"
                    ? "bg-blue-100 text-blue-700"
                    : paymentInfo.status === "Pendiente"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {paymentInfo.status === "Pagado" && <CheckCircle className="w-3 h-3" />}
                {paymentInfo.status === "Parcial" && <Clock className="w-3 h-3" />}
                {paymentInfo.status === "Pendiente" && <AlertCircle className="w-3 h-3" />}
                {paymentInfo.status}
              </span>
            </div>

            {/* Barra de progreso */}
            {paymentInfo.status !== "Sin facturar" && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Pagado: ${paymentInfo.amountPaid.toFixed(2)}</span>
                  <span>Total: ${paymentInfo.total.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      progressPercent === 100 ? "bg-green-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs mt-2">
                  {paymentInfo.amountPaidUSD > 0 && (
                    <span className="text-green-600">
                      USD: ${paymentInfo.amountPaidUSD.toFixed(2)}
                    </span>
                  )}
                  {paymentInfo.amountPaidBs > 0 && (
                    <span className="text-blue-600">
                      Bs: {paymentInfo.amountPaidBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
                
                {paymentInfo.pending > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    Pendiente: ${paymentInfo.pending.toFixed(2)}
                  </p>
                )}
              </div>
            )}

            {/* Botón de Pago */}
            {paymentInfo.status !== "Pagado" && paymentInfo.status !== "Sin facturar" && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="group relative w-full py-3.5 bg-gradient-to-r from-vet-primary to-vet-secondary hover:from-vet-secondary hover:to-vet-primary text-white font-semibold rounded-xl shadow-lg shadow-vet-primary/25 hover:shadow-xl hover:shadow-vet-primary/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Pagar ${paymentInfo.pending.toFixed(2)}
                </span>
              </button>
            )}

            {paymentInfo.status === "Sin facturar" && (
              <p className="text-sm text-gray-500 text-center py-2">
                Este servicio aún no ha sido facturado
              </p>
            )}

            {paymentInfo.status === "Pagado" && (
              <div className="flex items-center justify-center gap-2 py-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Pago completado</span>
              </div>
            )}
          </div>
        </div>
      </div>

     {/* Modal de Pago */}
{showPaymentModal && invoice && (
  <PaymentModal
    isOpen={showPaymentModal}
    onClose={() => setShowPaymentModal(false)}
    onConfirm={handlePaymentConfirm} // ✅ Esta función ya está bien
    amountUSD={paymentInfo.pending}
    // creditBalance: No lo tenemos aquí, así que no se pasa
    title="Procesar Pago"
    subtitle={`${service.service} - ${patientName}`}
    // ✅ NUEVO: Usamos 'services' en lugar de 'items'
    services={[
      {
        description: service.service,
        quantity: 1,
        unitPrice: service.cost,
        total: service.cost,
      },
    ]}
    // ✅ NUEVO: Pasamos la info del paciente
    patient={{
      name: patientName,
    }}
    allowPartial={true}
  />
)}

      {/* Modal de Eliminación */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => removeService()}
        petName={`el servicio de ${service.service.toLowerCase()}`}
        isDeleting={isDeleting}
      />
    </div>
  );
}