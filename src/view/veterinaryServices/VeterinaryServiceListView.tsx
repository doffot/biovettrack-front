import { Link, useParams } from "react-router-dom";
import { Eye, Plus, CheckCircle, Clock, CreditCard, AlertCircle, Stethoscope, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import { getServicesByPatient, deleteVeterinaryService } from "../../api/veterinaryServiceAPI";
import { getInvoices } from "../../api/invoiceAPI";
import type { VeterinaryService } from "../../types/veterinaryService";
import type { Invoice } from "../../types/invoice";
import { toast } from "../../components/Toast";
import ConfirmationModal from "../../components/modal/ConfirmationModal";

export default function VeterinaryServiceListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; service: VeterinaryService | null }>({
    isOpen: false,
    service: null,
  });

  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ["veterinaryServices", patientId],
    queryFn: () => getServicesByPatient(patientId!),
    enabled: !!patientId,
  });

  const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["invoices", { patientId }],
    queryFn: () => getInvoices({ patientId }),
    enabled: !!patientId,
  });

  const { mutate: deleteMutate, isPending: isDeleting } = useMutation({
    mutationFn: deleteVeterinaryService,
    onSuccess: () => {
      toast.success("Servicio eliminado", "El servicio ha sido eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["veterinaryServices", patientId] });
      setDeleteModal({ isOpen: false, service: null });
    },
    onError: (error: Error) => {
      toast.error("Error al eliminar", error.message);
    },
  });

  const invoices = invoicesData?.invoices || [];
  const isLoading = isLoadingServices || isLoadingInvoices;

  useEffect(() => {
    setMounted(true);
  }, []);

  const findInvoiceForService = (serviceId: string): Invoice | undefined => {
    return invoices.find((invoice) =>
      invoice.items.some((item) => item.resourceId === serviceId)
    );
  };

  const getPaymentInfo = (service: VeterinaryService) => {
    const invoice = findInvoiceForService(service._id);

    if (!invoice) {
      return {
        status: "Sin facturar",
        statusColor: "bg-[var(--color-vet-light)] text-[var(--color-vet-muted)] border border-[var(--color-border)]",
        statusIcon: <AlertCircle className="w-4 h-4 text-[var(--color-vet-muted)]" />,
        isPaid: false,
      };
    }

    switch (invoice.paymentStatus) {
      case "Pagado":
        return {
          status: "Pagado",
          statusColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
          statusIcon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
          isPaid: true,
        };
      case "Parcial":
        return {
          status: "Pago Parcial",
          statusColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
          statusIcon: <Clock className="w-4 h-4 text-amber-500" />,
          isPaid: false,
        };
      case "Pendiente":
        return {
          status: "Por Cobrar",
          statusColor: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
          statusIcon: <CreditCard className="w-4 h-4 text-red-500" />,
          isPaid: false,
        };
      default:
        return {
          status: invoice.paymentStatus,
          statusColor: "bg-[var(--color-vet-light)] text-[var(--color-vet-muted)] border border-[var(--color-border)]",
          statusIcon: <AlertCircle className="w-4 h-4 text-[var(--color-vet-muted)]" />,
          isPaid: false,
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-[var(--color-vet-primary)] border-t-transparent rounded-full animate-spin" />
            <p className="text-[var(--color-vet-text)] font-normal">Cargando servicios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-vet-text)] font-montserrat">
            Servicios Veterinarios
          </h2>
        </div>
        <Link
          to="create"
          className="inline-flex justify-center items-center gap-2 px-2 py-2 rounded-md bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white font-medium shadow-soft hover:shadow-card transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </Link>
      </div>
      <div className="border border-[var(--color-border)] mb-5"></div>

      <div
        className={`${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        } transition-all duration-500`}
      >
        {services.length ? (
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-card">
            {/* Header Desktop */}
            <div className="hidden sm:block bg-[var(--color-vet-light)]/50 px-6 py-2 border-b border-[var(--color-border)]">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-[var(--color-vet-muted)] tracking-wide uppercase">
                <div className="col-span-4">Servicio</div>
                <div className="col-span-2">Fecha</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-2">Estado Pago</div>
                <div className="col-span-2 text-center">Acciones</div>
              </div>
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {services.map((service: VeterinaryService) => {
                const paymentInfo = getPaymentInfo(service);

                return (
                  <div
                    key={service._id}
                    className="px-4 sm:px-6 py-4 hover:bg-[var(--color-hover)] transition-colors group"
                  >
                    {/* Mobile */}
                    <div className="sm:hidden space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-[var(--color-vet-primary)]" />
                            <h3 className="font-medium text-[var(--color-vet-text)] truncate">
                              {service.serviceName}
                            </h3>
                          </div>
                          {service.description && (
                            <p className="text-sm text-[var(--color-vet-muted)] mt-1 line-clamp-2">
                              {service.description}
                            </p>
                          )}
                        </div>
                        <Link
                          to={`${service._id}`}
                          className="p-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-500 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-vet-muted)]">{formatDate(service.serviceDate)}</span>
                        <span className="font-semibold text-[var(--color-vet-accent)]">
                          ${service.totalCost.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          {paymentInfo.statusIcon}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentInfo.statusColor}`}>
                            {paymentInfo.status}
                          </span>
                        </div>
                        {service.products.length > 0 && (
                          <span className="text-xs text-[var(--color-vet-muted)]">
                            {service.products.length} producto(s)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Desktop */}
                    <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[var(--color-vet-primary)]/10 border border-[var(--color-vet-primary)]/20 flex items-center justify-center">
                            <Stethoscope className="w-4 h-4 text-[var(--color-vet-primary)]" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-sm text-[var(--color-vet-text)] truncate">
                              {service.serviceName}
                            </h3>
                            {service.products.length > 0 && (
                              <p className="text-xs text-[var(--color-vet-muted)]">
                                {service.products.length} producto(s) utilizados
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <span className="text-[var(--color-vet-muted)] text-sm">
                          {formatDate(service.serviceDate)}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[var(--color-vet-primary)]">
                            ${service.totalCost.toFixed(2)}
                          </span>
                          {service.discount > 0 && (
                            <span className="text-xs text-emerald-500">
                              -${service.discount.toFixed(2)} desc.
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <div className="flex items-center gap-1.5">
                          {paymentInfo.statusIcon}
                          <span className={`px-2 py-0.5 rounded-md text-xs ${paymentInfo.statusColor}`}>
                            {paymentInfo.status}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-2 flex items-center justify-center gap-2">
                        <Link
                          to={`${service._id}`}
                          className="p-2 rounded-md bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-500 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => setDeleteModal({ isOpen: true, service })}
                          className="p-2 rounded-md bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-8 text-center shadow-soft">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-vet-light)] border border-[var(--color-border)] flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-[var(--color-vet-muted)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--color-vet-text)] mb-2">
              No hay servicios registrados
            </h3>
            <p className="text-[var(--color-vet-muted)] mb-6 max-w-md mx-auto">
              Este paciente no tiene servicios veterinarios registrados.
            </p>
            <Link
              to="create"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white font-medium shadow-soft hover:shadow-card transition-all"
            >
              <Plus className="w-4 h-4" />
              Agregar Primer Servicio
            </Link>
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, service: null })}
        onConfirm={() => deleteModal.service && deleteMutate(deleteModal.service._id)}
        title="Eliminar servicio"
        message={
          <p className="text-[var(--color-vet-muted)]">
            ¿Estás seguro de eliminar el servicio{" "}
            <span className="font-semibold text-[var(--color-vet-text)]">
              {deleteModal.service?.serviceName}
            </span>
            ? Esta acción no se puede deshacer.
          </p>
        }
        confirmText="Eliminar"
        confirmIcon={Trash2}
        variant="danger"
        isLoading={isDeleting}
        loadingText="Eliminando..."
      />
    </>
  );
}