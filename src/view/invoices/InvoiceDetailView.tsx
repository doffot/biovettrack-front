// src/views/invoices/InvoiceDetailView.tsx
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Printer, 
  AlertTriangle, 
  RefreshCw,
  FileText,
  DollarSign,
  CheckCircle2,
  XCircle as XCircleIcon,
  Clock,
  Ban,
  Trash2
} from "lucide-react";
import { getInvoiceById, updateInvoice, cancelInvoice, deleteInvoice } from "../../api/invoiceAPI";
import { PaymentModal } from "../../components/payment/PaymentModal";
import { toast } from "../../components/Toast";
import { printInvoice } from "../../utils/invoicePrintUtils";
import { InvoiceHeader } from "../../components/invoices/detail/InvoiceHeader";
import { InvoiceClientInfo } from "../../components/invoices/detail/InvoiceClientInfo";
import { InvoiceItemsTable } from "../../components/invoices/detail/InvoiceItemsTable";
import { InvoicePaymentSummary } from "../../components/invoices/detail/InvoicePaymentSummary";
import { InvoiceActions } from "../../components/invoices/detail/InvoiceActions";
import ConfirmationModal from "../../components/modal/ConfirmationModal";

function LoadingState() {
  return (
    <div className="h-screen flex items-center justify-center bg-[var(--color-vet-light)]">
      <div className="text-center">
        <div className="relative w-12 h-12 mx-auto mb-3">
          <div className="absolute inset-0 border-3 border-[var(--color-border)] rounded-full"></div>
          <div className="absolute inset-0 border-3 border-[var(--color-vet-primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-sm font-medium text-[var(--color-vet-text)]">Cargando factura...</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="h-screen flex items-center justify-center bg-[var(--color-vet-light)] p-4">
      <div className="text-center max-w-md w-full">
        <div className="relative mx-auto w-16 h-16 mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full blur-xl"></div>
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-lg font-bold text-[var(--color-vet-text)] mb-2">Error al cargar</h2>
        <p className="text-sm text-[var(--color-vet-muted)] mb-4">{message}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] rounded-lg hover:shadow-lg transition-all"
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

  const cancelMutation = useMutation({
    mutationFn: () => cancelInvoice(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Factura cancelada exitosamente");
      setShowCancelModal(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Error al cancelar la factura");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteInvoice(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Factura eliminada permanentemente");
      navigate("/invoices/report");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Error al eliminar la factura");
    },
  });

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

  const getStatusIcon = () => {
    switch (invoice.paymentStatus) {
      case "Pagado":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "Cancelado":
        return <XCircleIcon className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-vet-light)]">
      {/* Spacer para HeaderMobile/Desktop - Ajustado según AppLayout */}
      <div className="h-4 lg:h-0" />

      {/* Header Compacto - Sticky debajo del header principal */}
      <header className="sticky   z-30 bg-[var(--color-card)]/95 backdrop-blur-lg border-b border-[var(--color-border)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link
                to="/invoices/report"
                className="group flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-hover)] hover:bg-[var(--color-vet-primary)] transition-all"
              >
                <ArrowLeft className="w-4 h-4 text-[var(--color-vet-muted)] group-hover:text-white transition-colors" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)]">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-[var(--color-vet-text)] flex items-center gap-2">
                    Factura
                    <span className="text-xs font-mono font-normal text-[var(--color-vet-muted)] bg-[var(--color-hover)] px-1.5 py-0.5 rounded">
                      #{invoice._id?.slice(-6).toUpperCase()}
                    </span>
                  </h1>
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon()}
                    <span className="text-xs text-[var(--color-vet-muted)]">
                      {invoice.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--color-vet-text)] bg-[var(--color-hover)] hover:bg-[var(--color-vet-primary)] rounded-lg transition-all"
            >
              <Printer className="w-4 h-4 group-hover:text-white transition-colors" />
              <span className="hidden sm:inline group-hover:text-white">Imprimir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content Compacto */}
      <main className="pb-6 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          {/* Stats Cards Compactas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="bg-gradient-to-br from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] rounded-lg p-3 text-white shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 opacity-90" />
                <span className="text-xs font-medium opacity-90">Total</span>
              </div>
              <p className="text-xl font-bold">
                {invoice.currency === "USD" ? "$" : "Bs."} {invoice.total.toFixed(2)}
              </p>
            </div>

            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium text-[var(--color-vet-muted)]">Pagado</span>
              </div>
              <p className="text-xl font-bold text-[var(--color-vet-text)]">
                {invoice.currency === "USD" ? "$" : "Bs."} {(invoice.amountPaid || 0).toFixed(2)}
              </p>
            </div>

            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-xs font-medium text-[var(--color-vet-muted)]">Pendiente</span>
              </div>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {invoice.currency === "USD" ? "$" : "Bs."} {remainingAmount.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Grid Layout 2 columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Columna Izquierda */}
            <div className="lg:col-span-2 space-y-3">
              <InvoiceHeader invoice={invoice} />
              <InvoiceClientInfo
                ownerName={ownerName}
                ownerPhone={ownerPhone}
                patientName={patientName}
              />
              <InvoiceItemsTable items={invoice.items || []} currency={invoice.currency} />
            </div>

            {/* Columna Derecha */}
            <div className="space-y-3">
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
            </div>
          </div>
        </div>
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
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        title="Cancelar Factura"
        message={
          <div className="space-y-2">
            <p className="text-vet-text">
              ¿Estás seguro de que deseas <strong>cancelar</strong> esta factura?
            </p>
            <p className="text-sm text-vet-muted">
              Esta acción marcará la factura como cancelada y no se podrán registrar más pagos.
            </p>
          </div>
        }
        confirmText="Sí, cancelar factura"
        cancelText="No, volver"
        confirmIcon={Ban}
        variant="warning"
        isLoading={cancelMutation.isPending}
        loadingText="Cancelando..."
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar Factura"
        message={
          <div className="space-y-2">
            <p className="text-vet-text font-semibold">
              ⚠️ Esta acción es <strong className="text-red-500">PERMANENTE</strong>
            </p>
            <p className="text-vet-text">
              ¿Estás completamente seguro de que deseas eliminar esta factura?
            </p>
            <p className="text-sm text-vet-muted">
              Se perderán todos los datos incluyendo pagos, items y referencias. Esta acción NO se puede deshacer.
            </p>
          </div>
        }
        confirmText="Sí, eliminar permanentemente"
        cancelText="No, conservar factura"
        confirmIcon={Trash2}
        variant="danger"
        isLoading={deleteMutation.isPending}
        loadingText="Eliminando..."
      />
    </div>
  );
}