// src/views/owner/OwnerDetailView.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { PawPrint, ArrowLeft, Plus } from "lucide-react";

import { getOwnersById, deleteOwners, getOwnerAppointments, getOwnerGroomingServices } from "../../api/OwnerAPI";
import { getInvoices } from "../../api/invoiceAPI";
import { createPayment } from "../../api/paymentAPI";
import { getPatientsByOwner } from "../../api/patientAPI";
import { toast } from "../../components/Toast";
import PatientListView from "./PatientListOwnerView";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { getOwnerId} from "../../types/invoice";
import { OwnerAccountHeader } from "../../components/owners/OwnerAccountHeader";
import { TransactionHistory } from "../../components/owners/TransactionHistory";
import { PaymentModal } from "../../components/payment/PaymentModal";
import type { PaymentServiceItem, PaymentPatientInfo } from "../../components/payment/PaymentModal";
import type { Owner } from "../../types/owner";
import type { Invoice } from "../../types/invoice";
import type { GroomingService } from "../../types/grooming";
import type { Patient } from "../../types/patient";

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
      toast.error(error.message);
      setShowDeleteModal(false);
    },
    onSuccess: (data) => {
      toast.success(data.msg);
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
      toast.error(error.message || "Error al procesar el pago");
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

  // Convertir items de invoice a PaymentServiceItem
  const getInvoiceServices = (invoice: Invoice): PaymentServiceItem[] => {
    return invoice.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.cost,
      total: item.cost * item.quantity,
    }));
  };

  // Obtener info del paciente de una factura
  const getPatientInfo = (invoice: Invoice): PaymentPatientInfo | undefined => {
    // Buscar el paciente en la lista de pacientes del owner
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

    // Fallback al nombre del patientId poblado
    if (typeof invoice.patientId === "object" && invoice.patientId) {
      return { name: invoice.patientId.name };
    }

    return undefined;
  };

  // Descripción de factura para mostrar
  const getInvoiceDescription = (invoice: Invoice): string => {
    if (!invoice.items || invoice.items.length === 0) return "Factura";
    const descriptions = invoice.items.map((i) => i.description);
    if (descriptions.length <= 2) return descriptions.join(", ");
    return `${descriptions.slice(0, 2).join(", ")} +${descriptions.length - 2}`;
  };

  // Monto pendiente de la factura seleccionada
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
        toast.error("Debe especificar un monto o usar crédito");
        return;
      }

      await createPaymentMutation(payload);
      toast.success(paymentData.isPartial ? "Abono registrado" : "Pago procesado");
      setShowSinglePayModal(false);
      setSelectedInvoice(null);
    } catch {
      // Error manejado en onError
    }
  };

  const handlePayAll = async (invoiceIds: string[], paymentData: PaymentData) => {
    try {
      let successCount = 0;
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
        }

        await createPaymentMutation(payload);
        successCount++;
      }

      if (successCount > 0) {
        toast.success(
          `${successCount} factura${successCount > 1 ? "s" : ""} pagada${successCount > 1 ? "s" : ""}`
        );
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
     console.log("🧾 Invoice seleccionada:", invoice);
  console.log("🐾 Pacientes disponibles:", patientsData);
  console.log("👤 Owner:", owner);

   const services = getInvoiceServices(invoice);
  const patientInfo = getPatientInfo(invoice);
  
  console.log("📋 Services calculados:", services);
  console.log("🐕 Patient info:", patientInfo);


    setSelectedInvoice(invoice);
    setShowSinglePayModal(true);
  };

  // ==================== LOADING STATE ====================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-8 h-8 border-3 border-vet-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center max-w-sm mx-auto p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <PawPrint className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Propietario no encontrado</h2>
          <p className="text-gray-500 text-sm mb-4">
            El propietario que buscas no existe o fue eliminado.
          </p>
          <Link
            to="/owners"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-vet-primary text-white text-sm font-medium hover:bg-vet-secondary transition-colors"
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
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("pets")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "pets"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <PawPrint className="w-4 h-4" />
              Mascotas
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "transactions"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Transacciones
            </button>
          </div>
        </div>

        {/* Layout desktop: 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Mascotas */}
          <div className={`lg:col-span-2 ${activeTab !== "pets" ? "hidden lg:block" : ""}`}>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-vet-primary/5 to-vet-secondary/5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PawPrint className="w-5 h-5 text-vet-primary" />
                  <h3 className="font-semibold text-gray-900">Mascotas</h3>
                </div>
                <Link
                  to={`/owners/${owner._id}/patients/new`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vet-primary hover:bg-vet-secondary text-white text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nueva
                </Link>
              </div>
              <div className="p-4">
                <PatientListView ownerId={ownerId!} ownerName={owner.name} />
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
  owner={owner}              // ✅ AGREGA ESTO
  patients={patientsData}    // ✅ AGREGA ESTO
  onPayInvoice={handlePayInvoice}
  onPayAll={handlePayAll}
/>
          </div>
        </div>
      </div>

      {/* Modal de eliminación */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => removeOwner()}
        petName={owner.name}
        isDeleting={isDeleting}
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