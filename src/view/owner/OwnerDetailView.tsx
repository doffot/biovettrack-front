// src/views/owner/OwnerDetailView.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  PawPrint,
  ArrowLeft,
  CreditCard,
  Plus,
} from "lucide-react";

import { getOwnersById, deleteOwners } from "../../api/OwnerAPI";
import { getInvoices, updateInvoice } from "../../api/invoiceAPI";
import { toast } from "../../components/Toast";
import PatientListView from "./PatientListOwnerView";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { getOwnerId } from "../../types/invoice";
import { FinancialSummary } from "../../components/owners/FinancialSummary";
import type { Owner } from "../../types/owner";

interface PaymentData {
  paymentMethodId: string;
  reference?: string;
  amountPaidUSD: number;
  amountPaidBs: number;
  exchangeRate: number;
  isPartial: boolean;
}

export default function OwnerDetailView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { ownerId } = useParams<{ ownerId: string }>();

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

  const { mutateAsync: payInvoiceMutation } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) =>
      updateInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices", { ownerId }] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] }); // Para el reporte
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al procesar el pago");
    },
  });

  const allInvoices = invoicesData?.invoices || [];
  const invoices = allInvoices.filter((inv) => getOwnerId(inv) === ownerId);

  // ✅ CORREGIDO: Enviar los campos correctos al backend
  const handlePayInvoice = async (invoiceId: string, paymentData: PaymentData) => {
    const invoice = invoices.find((inv) => inv._id === invoiceId);
    if (!invoice) return;

    // Acumular los pagos existentes
    const currentPaidUSD = invoice.amountPaidUSD || 0;
    const currentPaidBs = invoice.amountPaidBs || 0;

    // Sumar el nuevo pago
    const newAmountPaidUSD = currentPaidUSD + paymentData.amountPaidUSD;
    const newAmountPaidBs = currentPaidBs + paymentData.amountPaidBs;

    // Calcular si está pagado completamente
    // El total siempre está en la moneda de la factura
    const exchangeRate = paymentData.exchangeRate || invoice.exchangeRate || 1;
    const totalPaidInUSD = newAmountPaidUSD + (newAmountPaidBs / exchangeRate);
    const isPaidInFull = totalPaidInUSD >= invoice.total;

    try {
      await payInvoiceMutation({
        id: invoiceId,
        data: {
          amountPaidUSD: newAmountPaidUSD,
          amountPaidBs: newAmountPaidBs,
          exchangeRate: exchangeRate,
          paymentMethod: paymentData.paymentMethodId, // ✅ Ahora se envía
          paymentReference: paymentData.reference,
          paymentStatus: isPaidInFull ? "Pagado" : "Parcial",
        },
      });
      toast.success(
        isPaidInFull ? "Factura pagada completamente" : "Abono registrado correctamente"
      );
    } catch {
      // Error handled in mutation
    }
  };

  // ✅ CORREGIDO: handlePayAll también
  const handlePayAll = async (invoiceIds: string[], paymentData: PaymentData) => {
    try {
      let successCount = 0;
      const exchangeRate = paymentData.exchangeRate || 1;

      for (const id of invoiceIds) {
        const invoice = invoices.find((inv) => inv._id === id);
        if (invoice) {
          // Calcular el monto pendiente de esta factura
          const currentPaidUSD = invoice.amountPaidUSD || 0;
          const currentPaidBs = invoice.amountPaidBs || 0;
          const currentPaidTotal = currentPaidUSD + (currentPaidBs / (invoice.exchangeRate || exchangeRate));
          const pendingAmount = invoice.total - currentPaidTotal;

          if (pendingAmount <= 0) continue; // Ya está pagada

          // Determinar cuánto pagar según la moneda del método
          let newAmountPaidUSD = currentPaidUSD;
          let newAmountPaidBs = currentPaidBs;

          if (paymentData.amountPaidBs > 0) {
            // Pago en Bs: convertir el pendiente a Bs
            newAmountPaidBs = currentPaidBs + (pendingAmount * exchangeRate);
          } else {
            // Pago en USD
            newAmountPaidUSD = currentPaidUSD + pendingAmount;
          }

          await payInvoiceMutation({
            id,
            data: {
              amountPaidUSD: newAmountPaidUSD,
              amountPaidBs: newAmountPaidBs,
              exchangeRate: exchangeRate,
              paymentMethod: paymentData.paymentMethodId, // ✅ Ahora se envía
              paymentReference: paymentData.reference,
              paymentStatus: "Pagado",
            },
          });
          successCount++;
        }
      }

      toast.success(
        `${successCount} factura${successCount > 1 ? "s" : ""} pagada${
          successCount > 1 ? "s" : ""
        } correctamente`
      );
    } catch {
      // Error handled in mutation
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Propietario no encontrado
          </h2>
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

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/owners")}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-vet-primary to-vet-secondary flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {getInitials(owner.name)}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{owner.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {owner.nationalId && (
                      <>
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{owner.nationalId}</span>
                      </>
                    )}
                    {!owner.nationalId && <span>Propietario</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/owners/${owner._id}/edit`}
                className="p-2.5 rounded-xl hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"
                title="Editar"
              >
                <Edit className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
                className="p-2.5 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Eliminar"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Info del propietario */}
          <div className="space-y-6">
            {/* Card de contacto */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700">
                  Información de Contacto
                </h3>
              </div>

              <div className="p-4 space-y-3">
                {/* Cédula */}
                {owner.nationalId && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 text-gray-700">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Cédula / ID</p>
                      <p className="font-medium">{owner.nationalId}</p>
                    </div>
                  </div>
                )}

                {/* Teléfono */}
                {owner.contact && (
                  <a
                    href={`https://wa.me/${owner.contact.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-100 group-hover:bg-green-200 flex items-center justify-center flex-shrink-0 transition-colors">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-green-600/70">Teléfono / WhatsApp</p>
                      <p className="font-medium">{owner.contact}</p>
                    </div>
                  </a>
                )}

                {/* Email */}
                {owner.email && (
                  <a
                    href={`mailto:${owner.email}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center flex-shrink-0 transition-colors">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-blue-600/70">Correo electrónico</p>
                      <p className="font-medium truncate">{owner.email}</p>
                    </div>
                  </a>
                )}

                {/* Dirección */}
                {owner.address && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 text-purple-700">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-600/70">Dirección</p>
                      <p className="font-medium">{owner.address}</p>
                    </div>
                  </div>
                )}

                {/* Sin información */}
                {!owner.contact && !owner.email && !owner.address && !owner.nationalId && (
                  <div className="text-center py-6">
                    <User className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-400 text-sm">
                      Sin información de contacto
                    </p>
                    <Link
                      to={`/owners/${owner._id}/edit`}
                      className="inline-flex items-center gap-1 mt-2 text-vet-primary text-sm hover:underline"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Agregar información
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna derecha - Finanzas */}
          <div className="lg:col-span-2">
            <FinancialSummary
              invoices={invoices}
              isLoading={isLoadingInvoices}
              onPayInvoice={handlePayInvoice}
              onPayAll={handlePayAll}
            />
          </div>
        </div>

        {/* Mascotas */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-vet-primary" />
              <h3 className="text-sm font-semibold text-gray-700">Mascotas</h3>
            </div>
            <Link
              to={`/owners/${owner._id}/patients/new`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vet-primary hover:bg-vet-secondary text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva mascota
            </Link>
          </div>

          <div className="p-4">
            <PatientListView ownerId={ownerId!} ownerName={owner.name} />
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
    </>
  );
}