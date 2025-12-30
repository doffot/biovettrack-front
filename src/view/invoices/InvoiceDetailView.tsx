// src/views/invoices/InvoiceDetailView.tsx
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Printer, AlertTriangle, RefreshCw } from "lucide-react";
import { getInvoiceById, updateInvoice, cancelInvoice, deleteInvoice } from "../../api/invoiceAPI";
import { PaymentModal } from "../../components/payment/PaymentModal";
import { toast } from "../../components/Toast";
import { printInvoice } from "../../utils/invoicePrintUtils";
import { InvoiceHeader } from "../../components/invoices/detail/InvoiceHeader";
import { InvoiceClientInfo } from "../../components/invoices/detail/InvoiceClientInfo";
import { InvoiceItemsTable } from "../../components/invoices/detail/InvoiceItemsTable";
import { InvoicePaymentSummary } from "../../components/invoices/detail/InvoicePaymentSummary";
import { InvoiceActions } from "../../components/invoices/detail/InvoiceActions";
import { ConfirmModal } from "../../components/ConfirmModal";

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="text-center">
        <div className="w-8 h-8 mx-auto mb-3 border-2 border-gray-200 border-t-[#0A7EA4] rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Cargando factura...</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar</h2>
        <p className="text-sm text-gray-500 mb-4">{message}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0A7EA4] rounded-md hover:bg-[#085F7A] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    </div>
  );
}

export default function InvoiceDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Query para obtener la factura
  const {
    data: invoice,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoiceById(id!),
    enabled: !!id,
  });

  // Mutation para actualizar factura (pagos)
  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateInvoice>[1]) => updateInvoice(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Pago registrado correctamente");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Error al registrar el pago");
    },
  });

  // Mutation para cancelar factura
  const cancelMutation = useMutation({
    mutationFn: () => cancelInvoice(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Factura cancelada");
      setShowCancelModal(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Error al cancelar la factura");
    },
  });

  // Mutation para eliminar factura
  const deleteMutation = useMutation({
    mutationFn: () => deleteInvoice(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Factura eliminada");
      navigate("/invoices/report");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Error al eliminar la factura");
    },
  });

  // Handlers
  const handlePayment = async (paymentData: {
    paymentMethodId?: string;
    reference?: string;
    addAmountPaidUSD: number;
    addAmountPaidBs: number;
    exchangeRate: number;
  }) => {
    await updateMutation.mutateAsync({
      addAmountPaidUSD: paymentData.addAmountPaidUSD,
      addAmountPaidBs: paymentData.addAmountPaidBs,
      exchangeRate: paymentData.exchangeRate,
      paymentMethod: paymentData.paymentMethodId,
      paymentReference: paymentData.reference,
    });
  };

  const handlePrint = () => {
    if (invoice) {
      printInvoice(invoice);
    }
  };

  const handleCancel = () => {
    cancelMutation.mutate();
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  // Estados de carga y error
  if (isLoading) return <LoadingState />;
  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : "Error desconocido"}
        onRetry={refetch}
      />
    );
  }
  if (!invoice) {
    return (
      <ErrorState
        message="No se encontró la factura"
        onRetry={() => navigate("/invoices/report")}
      />
    );
  }

  // Calcular datos
  const remainingAmount = invoice.total - (invoice.amountPaid || 0);
  const canPay = invoice.paymentStatus !== "Pagado" && invoice.paymentStatus !== "Cancelado";
  const canCancel = invoice.paymentStatus !== "Cancelado";

  const services =
    invoice.items?.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.cost,
      total: item.cost * item.quantity,
    })) || [];

  const ownerName =
    invoice.ownerName || (typeof invoice.ownerId === "object" && invoice.ownerId?.name) || "";

  const ownerPhone =
    invoice.ownerPhone || (typeof invoice.ownerId === "object" && invoice.ownerId?.contact) || "";

  const patientName =
    typeof invoice.patientId === "object" && invoice.patientId?.name ? invoice.patientId.name : "";

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link
                to="/invoices/report"
                className="p-1.5 -ml-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-base font-semibold text-gray-900">Factura</h1>
                <p className="text-xs text-gray-500">{invoice._id?.slice(-8).toUpperCase()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="Imprimir"
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <InvoiceHeader invoice={invoice} />

        <InvoiceClientInfo
          ownerName={ownerName}
          ownerPhone={ownerPhone}
          patientName={patientName}
        />

        <InvoiceItemsTable items={invoice.items || []} currency={invoice.currency} />

        <InvoicePaymentSummary invoice={invoice} />

        <InvoiceActions
          canPay={canPay}
          canCancel={canCancel}
          onPay={() => setShowPaymentModal(true)}
          onCancel={() => setShowCancelModal(true)}
          onDelete={() => setShowDeleteModal(true)}
          isPaying={updateMutation.isPending}
          isCanceling={cancelMutation.isPending}
          isDeleting={deleteMutation.isPending}
        />
      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePayment}
        amountUSD={remainingAmount}
        services={services}
        patient={{ name: patientName }}
        owner={{ name: ownerName, phone: ownerPhone }}
        title="Registrar Pago"
        allowPartial={true}
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        title="Cancelar Factura"
        message="¿Estás seguro de que deseas cancelar esta factura? Esta acción no se puede deshacer."
        confirmText="Sí, cancelar"
        cancelText="No, volver"
        variant="warning"
        isLoading={cancelMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar Factura"
        message="¿Estás seguro de que deseas ELIMINAR esta factura permanentemente? Esta acción NO se puede deshacer y se perderán todos los datos."
        confirmText="Sí, eliminar"
        cancelText="No, volver"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}