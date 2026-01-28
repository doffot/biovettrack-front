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
      // Invalidar queries para refrescar la UI automáticamente
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

  // ==================== HELPERS ====================

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
    if (patient) return { name: patient.name, photo: patient.photo };
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

  // ==================== HANDLERS ====================

  const handlePayInvoice = async (invoiceId: string, paymentData: PaymentData) => {
    const invoice = invoices.find((inv) => inv._id === invoiceId);
    if (!invoice) return;
    try {
      const isPayingInBs = paymentData.addAmountPaidBs > 0;
      const amount = isPayingInBs ? paymentData.addAmountPaidBs : paymentData.addAmountPaidUSD;
      const currency: "USD" | "Bs" = isPayingInBs ? "Bs" : "USD";

      const payload: any = {
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
    } catch (e) {}
  };

  // --- CORRECCIÓN PRINCIPAL AQUÍ ---
  const handlePayAll = async (invoiceIds: string[], paymentData: PaymentData) => {
    try {
      let successCount = 0;
      let totalPaidUSD = 0;
      let totalPaidBs = 0;
      const exchangeRate = paymentData.exchangeRate || 1;
      const isPayingInBs = paymentData.addAmountPaidBs > 0;

      // Iteramos sobre las facturas seleccionadas
      for (const id of invoiceIds) {
        const invoice = invoices.find((inv) => inv._id === id);
        if (!invoice) continue;

        // 1. Calcular cuánto se debe de esta factura específica
        const pendingUSD = invoice.total - (invoice.amountPaid || 0);
        
        // Si ya está pagada o el saldo es insignificante, saltamos
        if (pendingUSD <= 0.001) continue;

        // 2. Definir el monto a enviar según moneda seleccionada
        let amountToSend = 0;
        if(isPayingInBs) {
            amountToSend = pendingUSD * exchangeRate;
        } else {
            amountToSend = pendingUSD;
        }

        // 3. Crear el payload con TODOS los datos necesarios
        const payload: any = {
          invoiceId: id,
          currency: isPayingInBs ? "Bs" : "USD",
          exchangeRate,
          amount: amountToSend, // <--- Fundamental: enviar el monto al backend
        };

        // Agregar método de pago y referencia
        if (paymentData.paymentMethodId) {
            payload.paymentMethod = paymentData.paymentMethodId;
        }
        if (paymentData.reference) {
            payload.reference = paymentData.reference;
        }
        
        // No enviamos creditAmountUsed en el bucle para no descontar el mismo crédito múltiples veces
        // (La lógica de crédito masivo requeriría un manejo más complejo en el backend)

        await createPaymentMutation(payload);
        
        // Sumamos para el toast
        if (isPayingInBs) totalPaidBs += amountToSend;
        else totalPaidUSD += amountToSend;
        
        successCount++;
      }

      if (successCount > 0) {
        showPaymentToast({
          amountPaid: isPayingInBs ? totalPaidBs : totalPaidUSD,
          currency: isPayingInBs ? "Bs" : "USD",
          isPartial: false,
          creditUsed: paymentData.creditAmountUsed,
          invoiceCount: successCount,
        });
      }
      setShowPayAllModal(false);
    } catch (e) {
        console.error("Error en pago masivo", e);
    }
  };

  const handlePayAllFromModal = (paymentData: PaymentData) => {
    const ids = pendingInvoices.map((inv) => inv._id!).filter(Boolean);
    handlePayAll(ids, paymentData);
  };

  const handleSinglePayFromModal = (paymentData: PaymentData) => {
    if (selectedInvoice?._id) handlePayInvoice(selectedInvoice._id, paymentData);
  };

  const handleOpenSinglePay = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowSinglePayModal(true);
  };

  // ==================== RENDER LOADING ====================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh] bg-[var(--color-background)]">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto border-3 border-vet-accent border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-[var(--color-muted)] text-sm">Cargando información...</p>
        </div>
      </div>
    );
  }

  // ==================== RENDER NOT FOUND ====================

  if (!owner) {
    return (
      <div className="flex items-center justify-center h-[70vh] bg-[var(--color-background)]">
        <div className="text-center max-w-sm mx-auto p-6">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 bg-red-500/10 rounded-full blur-xl"></div>
            <div className="relative w-16 h-16 rounded-full bg-[var(--color-card)] flex items-center justify-center border border-[var(--color-border)] shadow-sm">
              <PawPrint className="w-8 h-8 text-[var(--color-muted)]" />
            </div>
          </div>
          <h2 className="text-lg font-bold text-[var(--color-text)] mb-2">Propietario no encontrado</h2>
          <p className="text-[var(--color-muted)] text-sm mb-6">El propietario no existe o fue eliminado.</p>
          <Link
            to="/owners"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-vet-primary text-white text-sm font-semibold hover:bg-vet-secondary transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a propietarios
          </Link>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================

  return (
    <div className="min-h-screen bg-[var(--color-background)] transition-colors duration-300">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs Mobile */}
        <div className="lg:hidden mb-4">
          <div className="flex bg-[var(--color-card)] backdrop-blur-sm rounded-xl p-1 border border-[var(--color-border)] shadow-sm">
            <button
              onClick={() => setActiveTab("pets")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === "pets"
                  ? "bg-vet-primary text-white shadow-md"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              <PawPrint className="w-4 h-4" />
              Mascotas
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === "transactions"
                  ? "bg-vet-primary text-white shadow-md"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              <Receipt className="w-4 h-4" />
              Transacciones
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Columna Mascotas */}
          <div className={`lg:col-span-2 ${activeTab !== "pets" ? "hidden lg:block" : ""}`}>
            <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-card)]">
              <div className="px-4 py-3 bg-[var(--color-background)] border-b border-[var(--color-border)] flex items-center justify-between opacity-95">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-vet-accent/10 rounded-lg border border-vet-accent/20">
                    <PawPrint className="w-4 h-4 text-vet-accent" />
                  </div>
                  <h3 className="font-semibold text-[var(--color-text)]">Mascotas</h3>
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] px-1.5 py-0.5 text-xs font-bold bg-[var(--color-card)] text-[var(--color-text)] rounded-full border border-[var(--color-border)]">
                    {patientsData.length}
                  </span>
                </div>
                <Link
                  to={`/owners/${owner._id}/patients/new`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vet-primary text-white text-xs font-bold hover:bg-vet-secondary transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nueva
                </Link>
              </div>
              
              <div className="p-4">
                {patientsData.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 bg-[var(--color-background)] rounded-full flex items-center justify-center border border-[var(--color-border)]">
                      <PawPrint className="w-6 h-6 text-[var(--color-muted)]" />
                    </div>
                    <p className="text-[var(--color-text)] text-sm font-medium mb-1">Sin mascotas registradas</p>
                    <p className="text-[var(--color-muted)] text-xs mb-4">Registra la primera mascota aquí</p>
                    <Link
                      to={`/owners/${owner._id}/patients/new`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-vet-accent hover:bg-vet-accent/5 rounded-lg border border-vet-accent/30 transition-all"
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

          {/* Columna Transacciones */}
          <div className={`lg:col-span-3 ${activeTab !== "transactions" ? "hidden lg:block" : ""}`}>
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

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => removeOwner()}
        title="Confirmar eliminación"
        message={
          <>
            <p className="text-[var(--color-text)] mb-2">
              ¿Seguro que deseas eliminar a <span className="font-bold text-vet-accent">{owner.name}</span>?
            </p>
            <p className="text-[var(--color-muted)] text-sm">Esta acción no se puede deshacer.</p>
          </>
        }
        confirmText="Eliminar"
        confirmIcon={Trash2}
        variant="danger"
        isLoading={isDeleting}
      />

      <PaymentModal
        isOpen={showPayAllModal}
        onClose={() => setShowPayAllModal(false)}
        amountUSD={totalDebtUSD}
        creditBalance={owner.creditBalance || 0}
        title="Pagar Todas las Facturas"
        subtitle={`${pendingInvoices.length} factura(s) pendiente(s)`}
        services={pendingInvoices.flatMap((inv) => getInvoiceServices(inv))}
        owner={{ name: owner.name, phone: owner.contact }}
        onConfirm={handlePayAllFromModal}
      />

      <PaymentModal
        isOpen={showSinglePayModal}
        onClose={() => { setShowSinglePayModal(false); setSelectedInvoice(null); }}
        amountUSD={getSelectedInvoicePending()}
        creditBalance={owner.creditBalance || 0}
        title="Pagar Factura"
        subtitle={selectedInvoice ? getInvoiceDescription(selectedInvoice) : undefined}
        services={selectedInvoice ? getInvoiceServices(selectedInvoice) : []}
        patient={selectedInvoice ? getPatientInfo(selectedInvoice) : undefined}
        owner={{ name: owner.name, phone: owner.contact }}
        onConfirm={handleSinglePayFromModal}
      />
    </div>
  );
}