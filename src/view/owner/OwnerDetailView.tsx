// src/views/owners/OwnerDetailView.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { PawPrint, ArrowLeft, Plus, Trash2, Receipt, Sparkles } from "lucide-react";

import { getOwnersById, deleteOwners, getOwnerAppointments, getOwnerGroomingServices } from "../../api/OwnerAPI";
import { getInvoices } from "../../api/invoiceAPI";
import { createPayment } from "../../api/paymentAPI";
import { getPatientsByOwner } from "../../api/patientAPI";
import { toast } from "../../components/Toast";
import { showPaymentToast, showPaymentErrorToast } from "../../utils/paymentToasts";
import PatientListView from "./PatientListOwnerView";
import { getOwnerId } from "../../types/invoice";
import { OwnerAccountHeader } from "../../components/owners/OwnerAccountHeader";
import { TransactionHistory } from "../../components/owners/TransactionHistory";
import { PaymentModal } from "../../components/payment/PaymentModal";
import type { PaymentServiceItem, PaymentPatientInfo } from "../../components/payment/PaymentModal";
import type { Owner } from "../../types/owner";
import type { Invoice } from "../../types/invoice";
import type { GroomingService } from "../../types/grooming";
import type { Patient } from "../../types/patient";
import ConfirmationModal from "../../components/modal/ConfirmationModal";

interface PaymentData {
  paymentMethodId?: string;
  reference?: string;
  addAmountPaidUSD: number;
  addAmountPaidBs: number;
  exchangeRate: number;
  isPartial: boolean;
  creditAmountUsed?: number;
}

export default function OwnerDetailView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPayAllModal, setShowPayAllModal] = useState(false);
  const [showSinglePayModal, setShowSinglePayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState<"pets" | "transactions">("pets");

  const { ownerId } = useParams<{ ownerId: string }>();

  // ==================== QUERIES ====================

  const { data: owner, isLoading } = useQuery<Owner>({
    queryKey: ["owner", ownerId],
    queryFn: () => getOwnersById(ownerId!),
    enabled: !!ownerId,
  });

  const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["invoices", { ownerId }],
    queryFn: () => getInvoices({ ownerId }),
    enabled: !!ownerId,
  });

  const { data: patientsData = [] } = useQuery<Patient[]>({
    queryKey: ["patients", { ownerId }],
    queryFn: () => getPatientsByOwner(ownerId!),
    enabled: !!ownerId,
  });

  const { data: appointmentsData } = useQuery({
    queryKey: ["ownerAppointments", ownerId],
    queryFn: () => getOwnerAppointments(ownerId!),
    enabled: !!ownerId,
  });

  const { data: groomingData } = useQuery({
    queryKey: ["ownerGroomingServices", ownerId],
    queryFn: () => getOwnerGroomingServices(ownerId!),
    enabled: !!ownerId,
  });

  const ownerAppointments = appointmentsData?.appointments || [];
  const ownerGroomingServices: GroomingService[] = groomingData?.services || [];

  // Filtrar solo los servicios de hoy
  const todayGroomingServices = ownerGroomingServices.filter((service) => {
    if (!service.date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const serviceDate = new Date(service.date);
    serviceDate.setHours(0, 0, 0, 0);

    return serviceDate.getTime() === today.getTime();
  });

  // ==================== MUTATIONS ====================

  const { mutate: removeOwner, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteOwners(ownerId!),
    onError: (error: Error) => {
      toast.error("Error al eliminar", error.message);
      setShowDeleteModal(false);
    },
    onSuccess: (data) => {
      toast.success("Propietario eliminado", data.msg);
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      setShowDeleteModal(false);
      navigate("/owners");
    },
  });

  const { mutateAsync: createPaymentMutation } = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices", { ownerId }] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["owner", ownerId] });
    },
    onError: (error: Error) => {
      showPaymentErrorToast(error.message || "Error al procesar el pago");
    },
  });

  // ==================== DATOS CALCULADOS ====================

  const allInvoices = invoicesData?.invoices || [];
  const invoices = allInvoices.filter((inv) => getOwnerId(inv) === ownerId);

  // Calcular totales
  const totalConsumedUSD = invoices.reduce((sum, inv) => {
    if (inv.currency === "Bs" && inv.exchangeRate) {
      return sum + inv.total / inv.exchangeRate;
    }
    return sum + inv.total;
  }, 0);

  const totalPaidUSD = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const totalDebtUSD = Math.max(0, totalConsumedUSD - totalPaidUSD);

  const pendingInvoices = invoices.filter(
    (inv) => inv.paymentStatus === "Pendiente" || inv.paymentStatus === "Parcial"
  );

  // ==================== HELPERS PARA EL MODAL ====================

  const getInvoiceServices = (invoice: Invoice): PaymentServiceItem[] => {
    return invoice.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.cost,
      total: item.cost * item.quantity,
    }));
  };

  const getPatientInfo = (invoice: Invoice): PaymentPatientInfo | undefined => {
    const patient = patientsData.find((p) => {
      if (typeof invoice.patientId === "string") return p._id === invoice.patientId;
      return p._id === invoice.patientId?._id;
    });

    if (patient) {
      return {
        name: patient.name,
        photo: patient.photo,
      };
    }

    if (typeof invoice.patientId === "object" && invoice.patientId) {
      return { name: invoice.patientId.name };
    }

    return undefined;
  };

  const getInvoiceDescription = (invoice: Invoice): string => {
    if (!invoice.items || invoice.items.length === 0) return "Factura";
    const descriptions = invoice.items.map((i) => i.description);
    if (descriptions.length <= 2) return descriptions.join(", ");
    return `${descriptions.slice(0, 2).join(", ")} +${descriptions.length - 2}`;
  };

  const getSelectedInvoicePending = (): number => {
    if (!selectedInvoice) return 0;
    return selectedInvoice.total - (selectedInvoice.amountPaid || 0);
  };

  // ==================== HANDLERS DE PAGO ====================

  const handlePayInvoice = async (invoiceId: string, paymentData: PaymentData) => {
    const invoice = invoices.find((inv) => inv._id === invoiceId);
    if (!invoice) return;

    try {
      const isPayingInBs = paymentData.addAmountPaidBs > 0;
      const amount = isPayingInBs ? paymentData.addAmountPaidBs : paymentData.addAmountPaidUSD;
      const currency: "USD" | "Bs" = isPayingInBs ? "Bs" : "USD";

      const payload: {
        invoiceId: string;
        currency: "USD" | "Bs";
        exchangeRate: number;
        amount?: number;
        paymentMethod?: string;
        reference?: string;
        creditAmountUsed?: number;
      } = {
        invoiceId,
        currency,
        exchangeRate: paymentData.exchangeRate || 1,
      };

      if (amount > 0) {
        payload.amount = amount;
        if (paymentData.paymentMethodId) payload.paymentMethod = paymentData.paymentMethodId;
        if (paymentData.reference) payload.reference = paymentData.reference;
      }

      if (paymentData.creditAmountUsed && paymentData.creditAmountUsed > 0) {
        payload.creditAmountUsed = paymentData.creditAmountUsed;
      }

      if (!payload.amount && !payload.creditAmountUsed) {
        toast.error("Error", "Debe especificar un monto o usar crédito");
        return;
      }

      await createPaymentMutation(payload);

      showPaymentToast({
        amountPaid: amount,
        currency,
        isPartial: paymentData.isPartial,
        creditUsed: paymentData.creditAmountUsed,
        invoiceDescription: getInvoiceDescription(invoice),
      });

      setShowSinglePayModal(false);
      setSelectedInvoice(null);
    } catch {
      // Error manejado en onError
    }
  };

  const handlePayAll = async (invoiceIds: string[], paymentData: PaymentData) => {
    try {
      let successCount = 0;
      let totalPaidUSD = 0;
      let totalPaidBs = 0;
      const exchangeRate = paymentData.exchangeRate || 1;
      const isPayingInBs = paymentData.addAmountPaidBs > 0;
      const onlyCredit =
        paymentData.creditAmountUsed &&
        paymentData.creditAmountUsed > 0 &&
        !paymentData.paymentMethodId;

      for (const id of invoiceIds) {
        const invoice = invoices.find((inv) => inv._id === id);
        if (!invoice) continue;

        const currentPaidUSD = invoice.amountPaidUSD || 0;
        const currentPaidBs = invoice.amountPaidBs || 0;
        const invoiceRate = invoice.exchangeRate || exchangeRate;
        const currentPaidTotal = currentPaidUSD + currentPaidBs / invoiceRate;
        const invoiceTotalUSD =
          invoice.currency === "Bs" ? invoice.total / invoiceRate : invoice.total;
        const pendingUSD = Math.max(0, invoiceTotalUSD - currentPaidTotal);

        if (pendingUSD <= 0.01) continue;

        const currency: "USD" | "Bs" = isPayingInBs ? "Bs" : "USD";

        const payload: {
          invoiceId: string;
          currency: "USD" | "Bs";
          exchangeRate: number;
          amount?: number;
          paymentMethod?: string;
          reference?: string;
          creditAmountUsed?: number;
        } = {
          invoiceId: id,
          currency,
          exchangeRate: paymentData.exchangeRate || 1,
        };

        if (onlyCredit) {
          payload.creditAmountUsed = Math.min(paymentData.creditAmountUsed!, pendingUSD);
        } else {
          const amount = isPayingInBs ? pendingUSD * exchangeRate : pendingUSD;
          payload.amount = amount;
          if (paymentData.paymentMethodId) payload.paymentMethod = paymentData.paymentMethodId;
          if (paymentData.reference) payload.reference = paymentData.reference;
          if (paymentData.creditAmountUsed && paymentData.creditAmountUsed > 0) {
            payload.creditAmountUsed = paymentData.creditAmountUsed;
          }

          if (isPayingInBs) {
            totalPaidBs += amount;
          } else {
            totalPaidUSD += amount;
          }
        }

        await createPaymentMutation(payload);
        successCount++;
      }

      if (successCount > 0) {
        const amount = isPayingInBs ? totalPaidBs : totalPaidUSD;
        const currency: "USD" | "Bs" = isPayingInBs ? "Bs" : "USD";

        showPaymentToast({
          amountPaid: amount,
          currency,
          isPartial: false,
          creditUsed: paymentData.creditAmountUsed,
          invoiceCount: successCount,
        });
      }
      setShowPayAllModal(false);
    } catch {
      // Error manejado en onError
    }
  };

  const handlePayAllFromModal = async (paymentData: PaymentData) => {
    const ids = pendingInvoices.map((inv) => inv._id!).filter(Boolean);
    await handlePayAll(ids, paymentData);
  };

  const handleSinglePayFromModal = async (paymentData: PaymentData) => {
    if (selectedInvoice && selectedInvoice._id) {
      await handlePayInvoice(selectedInvoice._id, paymentData);
    }
  };

  const handleOpenSinglePay = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowSinglePayModal(true);
  };

  // ==================== LOADING STATE ====================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto border-3 border-vet-accent border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-400 text-sm">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center max-w-sm mx-auto p-6">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-full blur-xl"></div>
            <div className="relative w-16 h-16 rounded-full bg-slate-800/60 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <PawPrint className="w-8 h-8 text-slate-500" />
            </div>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Propietario no encontrado</h2>
          <p className="text-slate-400 text-sm mb-6">
            El propietario que buscas no existe o fue eliminado.
          </p>
          <Link
            to="/owners"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-vet-accent to-cyan-400 text-slate-900 text-sm font-semibold hover:shadow-lg hover:shadow-vet-accent/25 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a propietarios
          </Link>
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================

  return (
    <>
      {/* Header tipo cuenta bancaria */}
      <OwnerAccountHeader
        owner={owner}
        creditBalance={owner.creditBalance || 0}
        totalConsumed={totalConsumedUSD}
        totalPaid={totalPaidUSD}
        totalPending={totalDebtUSD}
        pendingInvoices={pendingInvoices}
        patients={patientsData}
        appointments={ownerAppointments}
        groomingServices={todayGroomingServices}
        onBack={() => navigate("/owners")}
        onEdit={() => navigate(`/owners/${owner._id}/edit`)}
        onDelete={() => setShowDeleteModal(true)}
        onPayInvoice={handleOpenSinglePay}
        onOpenPayAll={pendingInvoices.length > 0 ? () => setShowPayAllModal(true) : undefined}
        isLoadingFinancial={isLoadingInvoices}
      />

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs para móvil */}
        <div className="lg:hidden mb-4">
          <div className="flex bg-slate-800/60 backdrop-blur-sm rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setActiveTab("pets")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === "pets"
                  ? "bg-gradient-to-r from-vet-accent to-cyan-400 text-slate-900 shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <PawPrint className="w-4 h-4" />
              Mascotas
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === "transactions"
                  ? "bg-gradient-to-r from-vet-accent to-cyan-400 text-slate-900 shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Receipt className="w-4 h-4" />
              Transacciones
            </button>
          </div>
        </div>

        {/* Layout desktop: 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Mascotas */}
          <div className={`lg:col-span-2 ${activeTab !== "pets" ? "hidden lg:block" : ""}`}>
            <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-xl">
              {/* Header de la sección */}
              <div className="px-4 py-3 bg-gradient-to-r from-vet-accent/10 via-slate-800/40 to-cyan-500/10 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-vet-accent/20 rounded-lg border border-vet-accent/30">
                    <PawPrint className="w-4 h-4 text-vet-accent" />
                  </div>
                  <h3 className="font-semibold text-white">Mascotas</h3>
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] px-1.5 py-0.5 text-xs font-semibold bg-slate-800/80 text-slate-300 rounded-full">
                    {patientsData.length}
                  </span>
                </div>
                <Link
                  to={`/owners/${owner._id}/patients/new`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-vet-accent to-cyan-400 hover:shadow-lg hover:shadow-vet-accent/20 text-slate-900 text-xs font-semibold transition-all duration-300"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nueva
                </Link>
              </div>
              
              {/* Lista de mascotas */}
              <div className="p-4">
                {patientsData.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 bg-slate-800/60 rounded-full flex items-center justify-center border border-white/10">
                      <PawPrint className="w-6 h-6 text-slate-500" />
                    </div>
                    <p className="text-white text-sm font-medium mb-1">Sin mascotas registradas</p>
                    <p className="text-slate-500 text-xs mb-4">Registra la primera mascota de este propietario</p>
                    <Link
                      to={`/owners/${owner._id}/patients/new`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-vet-accent hover:text-white bg-vet-accent/10 hover:bg-vet-accent/20 rounded-lg border border-vet-accent/30 transition-all duration-300"
                    >
                      <Sparkles className="w-4 h-4" />
                      Agregar mascota
                    </Link>
                  </div>
                ) : (
                  <PatientListView ownerId={ownerId!} ownerName={owner.name} />
                )}
              </div>
            </div>
          </div>

          {/* Transacciones */}
          <div
            className={`lg:col-span-3 ${activeTab !== "transactions" ? "hidden lg:block" : ""}`}
          >
            <TransactionHistory
              invoices={invoices}
              creditBalance={owner.creditBalance || 0}
              isLoading={isLoadingInvoices}
              owner={owner}
              patients={patientsData}
              onPayInvoice={handlePayInvoice}
              onPayAll={handlePayAll}
            />
          </div>
        </div>
      </div>

      {/* Modal de eliminación */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => removeOwner()}
        title="Confirmar eliminación"
        message={
          <>
            <p className="text-white mb-2">
              ¿Estás seguro de que deseas eliminar a{" "}
              <span className="font-bold text-vet-accent">{owner.name}</span>?
            </p>
            <p className="text-slate-400 text-sm">
              Esta acción no se puede deshacer. Se eliminarán todos los datos asociados a este propietario.
            </p>
          </>
        }
        confirmText="Eliminar"
        confirmIcon={Trash2}
        variant="danger"
        isLoading={isDeleting}
        loadingText="Eliminando..."
      />

      {/* Modal de Pagar Todo */}
      <PaymentModal
        isOpen={showPayAllModal}
        onClose={() => setShowPayAllModal(false)}
        amountUSD={totalDebtUSD}
        creditBalance={owner.creditBalance || 0}
        title="Pagar Todas las Facturas"
        subtitle={`${pendingInvoices.length} factura${pendingInvoices.length > 1 ? "s" : ""} pendiente${pendingInvoices.length > 1 ? "s" : ""}`}
        services={pendingInvoices.flatMap((inv) => getInvoiceServices(inv))}
        owner={{
          name: owner.name,
          phone: owner.contact,
        }}
        onConfirm={handlePayAllFromModal}
      />

      {/* Modal de Pagar Factura Individual */}
      <PaymentModal
        isOpen={showSinglePayModal}
        onClose={() => {
          setShowSinglePayModal(false);
          setSelectedInvoice(null);
        }}
        amountUSD={getSelectedInvoicePending()}
        creditBalance={owner.creditBalance || 0}
        title="Pagar Factura"
        subtitle={selectedInvoice ? getInvoiceDescription(selectedInvoice) : undefined}
        services={selectedInvoice ? getInvoiceServices(selectedInvoice) : []}
        patient={selectedInvoice ? getPatientInfo(selectedInvoice) : undefined}
        owner={{
          name: owner.name,
          phone: owner.contact,
        }}
        onConfirm={handleSinglePayFromModal}
      />
    </>
  );
}