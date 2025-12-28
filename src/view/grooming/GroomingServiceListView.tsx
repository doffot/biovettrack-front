// src/views/patient/GroomingServiceListView.tsx
import { Link, useParams } from "react-router-dom";
import { Eye, Plus, CheckCircle, Clock, CreditCard, AlertCircle, Scissors } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getGroomingServicesByPatient } from "../../api/groomingAPI";
import { getInvoices } from "../../api/invoiceAPI";
import type { GroomingService } from "../../types/grooming";
import type { Invoice } from "../../types/invoice";
import { useState, useEffect } from "react";

export default function GroomingServiceListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const [mounted, setMounted] = useState(false);

  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ["groomingServices", patientId],
    queryFn: () => getGroomingServicesByPatient(patientId!),
    enabled: !!patientId,
  });

  const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["invoices", { patientId }],
    queryFn: () => getInvoices({ patientId }),
    enabled: !!patientId,
  });

  const invoices = invoicesData?.invoices || [];
  const isLoading = isLoadingServices || isLoadingInvoices;

  useEffect(() => {
    setMounted(true);
  }, []);

  const findInvoiceForService = (serviceId: string): Invoice | undefined => {
    return invoices.find(invoice =>
      invoice.items.some(item =>
        item.type === "grooming" &&
        item.resourceId === serviceId
      )
    );
  };

  const getPaymentInfo = (service: GroomingService) => {
    const invoice = findInvoiceForService(service._id!);

    if (!invoice) {
      return {
        status: "Sin facturar",
        statusColor: "bg-gray-100 text-gray-600 border-gray-200",
        statusIcon: <AlertCircle className="w-4 h-4 text-gray-500" />,
        amount: null,
        isPaid: false
      };
    }

    const serviceItem = invoice.items.find(
      item => item.type === "grooming" && item.resourceId === service._id
    );

    const serviceAmount = serviceItem ? serviceItem.cost * serviceItem.quantity : 0;

    const formatAmount = (amount: number, currency: string) => {
      if (currency === "USD") {
        return `$${amount.toFixed(2)}`;
      } else {
        return `Bs. ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    };

    switch (invoice.paymentStatus) {
      case "Pagado":
        return {
          status: "Pagado",
          statusColor: "bg-green-100 text-green-700 border-green-200",
          statusIcon: <CheckCircle className="w-4 h-4 text-green-600" />,
          amount: formatAmount(serviceAmount, invoice.currency),
          isPaid: true
        };

      case "Parcial":
        const paidAmount = (invoice.amountPaid || 0) * (serviceAmount / invoice.total);
        return {
          status: "Pago Parcial",
          statusColor: "bg-amber-100 text-amber-700 border-amber-200",
          statusIcon: <Clock className="w-4 h-4 text-amber-600" />,
          amount: formatAmount(paidAmount, invoice.currency),
          isPaid: false
        };

      case "Pendiente":
        return {
          status: "Por Cobrar",
          statusColor: "bg-red-100 text-red-700 border-red-200",
          statusIcon: <CreditCard className="w-4 h-4 text-red-600" />,
          amount: formatAmount(serviceAmount, invoice.currency),
          isPaid: false
        };

      default:
        return {
          status: invoice.paymentStatus,
          statusColor: "bg-gray-100 text-gray-600 border-gray-200",
          statusIcon: <AlertCircle className="w-4 h-4 text-gray-500" />,
          amount: null,
          isPaid: false
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
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-vet-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-vet-text font-normal">Cargando servicios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-semibold text-vet-secondary font-montserrat">
            Peluquería y Baño
          </h2>
        </div>
        <Link
          to="create"
          className="inline-flex justify-center items-center gap-2 px-2 py-2 rounded-md bg-vet-primary/10 hover:bg-vet-secondary text-vet-primary font-medium hover:text-white shadow-sm hover:shadow-md transition-all text-sm font-playfair-display"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </Link>
      </div>
      <div className="border border-gray-200 mb-5"></div>

      <div
        className={`${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        } transition-all duration-500`}
      >
        {services.length ? (
          <div className="bg-white overflow-hidden">
            <div className="hidden sm:block bg-gray-50 px-6 py-2 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-400 tracking-wide uppercase">
                <div className="col-span-4">Servicio</div>
                <div className="col-span-2">Fecha</div>
                <div className="col-span-2">Costo</div>
                <div className="col-span-2">Estado Pago</div>
                <div className="col-span-2 text-center">Acciones</div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {services.map((service: GroomingService) => {
                const paymentInfo = getPaymentInfo(service);

                return (
                  <div
                    key={service._id}
                    className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors group"
                  >
                    {/* Mobile */}
                    <div className="sm:hidden space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Scissors className="w-4 h-4 text-vet-primary" />
                            <h3 className="font-medium text-vet-text truncate">
                              {service.service}
                            </h3>
                          </div>
                          {service.specifications && (
                            <p className="text-sm text-vet-muted mt-1 line-clamp-2">
                              {service.specifications}
                            </p>
                          )}
                        </div>
                        <Link
                          to={`${service._id}`}
                          className="p-1.5 rounded-md bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-600"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{formatDate(service.date)}</span>
                        <span className="font-semibold text-vet-primary">${service.cost.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          {paymentInfo.statusIcon}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentInfo.statusColor}`}>
                            {paymentInfo.status}
                          </span>
                        </div>
                        {paymentInfo.amount && (
                          <span className="font-medium text-vet-text">
                            {paymentInfo.amount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Desktop */}
                    <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-vet-primary/10 flex items-center justify-center">
                            <Scissors className="w-4 h-4 text-vet-primary" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-sm text-vet-primary truncate">
                              {service.service}
                            </h3>
                            {service.specifications && (
                              <p className="text-xs text-vet-muted line-clamp-1">
                                {service.specifications}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <span className="text-gray-500 text-sm">
                          {formatDate(service.date)}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <span className="font-semibold text-vet-primary">
                          ${service.cost.toFixed(2)}
                        </span>
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
                          className="p-2 rounded-md bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-600 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {!paymentInfo.isPaid && (
                          <button
                            className="p-2 rounded-md bg-red-50 hover:bg-red-500 hover:text-white text-red-600 transition-colors"
                            title="Pendiente de pago"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-vet-light flex items-center justify-center">
              <Scissors className="w-6 h-6 text-vet-muted" />
            </div>
            <h3 className="text-lg font-medium text-vet-text mb-2">
              No hay servicios de peluquería
            </h3>
            <p className="text-vet-muted mb-6 max-w-md mx-auto">
              Esta mascota no tiene servicios de peluquería registrados.
            </p>
            <Link
              to="create"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-vet-primary hover:bg-vet-secondary text-white font-medium shadow-sm hover:shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              Agregar Primer Servicio
            </Link>
          </div>
        )}
      </div>
    </>
  );
}