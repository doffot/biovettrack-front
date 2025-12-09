// src/view/patient/GroomingServiceListView.tsx
import { Link, useParams } from "react-router-dom";
import { Eye, Plus, CheckCircle, Clock, XCircle, CreditCard, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getGroomingServicesByPatient } from "../../api/groomingAPI";
import { getInvoices } from "../../api/invoiceAPI";
import type { GroomingService } from "../../types/grooming";
import type { Invoice } from "../../types/invoice";
import { useState, useEffect } from "react";

export default function GroomingServiceListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const [mounted, setMounted] = useState(false);

  // Servicios del paciente
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ["groomingServices", patientId],
    queryFn: () => getGroomingServicesByPatient(patientId!),
    enabled: !!patientId,
  });

  // Obtener TODAS las facturas para buscar las de este paciente
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

  // Función para encontrar la factura de un servicio específico
  const findInvoiceForService = (serviceId: string): Invoice | undefined => {
    return invoices.find(invoice => 
      invoice.items.some(item => 
        item.type === "grooming" && 
        item.resourceId === serviceId
      )
    );
  };

  // Función para obtener info del pago de un servicio
  const getPaymentInfo = (service: GroomingService) => {
    const invoice = findInvoiceForService(service._id!);
    
    if (!invoice) {
      return {
        status: "Sin facturar",
        statusColor: "bg-gray-100 text-gray-600 border-gray-200",
        statusIcon: <AlertCircle className="w-4 h-4 text-gray-500" />,
        amount: null,
        currency: null,
        paymentMethod: null,
        isPaid: false
      };
    }

    const serviceItem = invoice.items.find(
      item => item.type === "grooming" && item.resourceId === service._id
    );
    
    const serviceAmount = serviceItem ? serviceItem.cost * serviceItem.quantity : 0;

    // Determinar el monto pagado para este servicio (proporcional al total)
    let paidAmount = 0;
    if (invoice.amountPaid && invoice.amountPaid > 0) {
      const proportion = serviceAmount / invoice.total;
      paidAmount = invoice.amountPaid * proportion;
    }

    // Formatear cantidad según moneda
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
          currency: invoice.currency,
          paymentMethod: invoice.paymentMethod,
          isPaid: true
        };
      
      case "Parcial":
        return {
          status: "Pago Parcial",
          statusColor: "bg-amber-100 text-amber-700 border-amber-200",
          statusIcon: <Clock className="w-4 h-4 text-amber-600" />,
          amount: formatAmount(paidAmount, invoice.currency),
          currency: invoice.currency,
          paymentMethod: invoice.paymentMethod,
          isPaid: false
        };
      
      case "Pendiente":
        return {
          status: "Por Cobrar",
          statusColor: "bg-red-100 text-red-700 border-red-200",
          statusIcon: <CreditCard className="w-4 h-4 text-red-600" />,
          amount: formatAmount(serviceAmount, invoice.currency),
          currency: invoice.currency,
          paymentMethod: null,
          isPaid: false
        };
      
      case "Cancelado":
        return {
          status: "Cancelado",
          statusColor: "bg-gray-100 text-gray-600 border-gray-200",
          statusIcon: <XCircle className="w-4 h-4 text-gray-600" />,
          amount: null,
          currency: null,
          paymentMethod: null,
          isPaid: false
        };
      
      default:
        return {
          status: invoice.paymentStatus,
          statusColor: "bg-gray-100 text-gray-600 border-gray-200",
          statusIcon: <AlertCircle className="w-4 h-4 text-gray-500" />,
          amount: null,
          currency: null,
          paymentMethod: null,
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

  const getServiceStatusIcon = (status: string) => {
    switch (status) {
      case "Completado":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "En progreso":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "Cancelado":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case "Completado":
        return "bg-green-100 text-green-700 border border-green-200";
      case "En progreso":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      case "Programado":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      case "Cancelado":
        return "bg-red-100 text-red-700 border border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
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
      {/* Header */}
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

      {/* Content */}
      <div
        className={`${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        } transition-all duration-500`}
      >
        {services.length ? (
          <div className="bg-white overflow-hidden">
            {/* Header de la tabla - Solo escritorio */}
            <div className="hidden sm:block bg-gray-50 px-6 py-2 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-400 tracking-wide uppercase">
                <div className="col-span-3">Servicio</div>
                <div className="col-span-2">Fecha</div>
                <div className="col-span-2">Estado Servicio</div>
                <div className="col-span-3">Estado Pago</div>
                <div className="col-span-2 text-center">Acciones</div>
              </div>
            </div>

            {/* Cuerpo */}
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
                          <h3 className="font-medium text-vet-text truncate">
                            {service.service}
                          </h3>
                          {service.specifications && (
                            <p className="text-sm text-vet-muted mt-1 line-clamp-2">
                              {service.specifications}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center">
                          <Link
                            to={`${service._id}`}
                            className="p-1.5 rounded-md bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-600"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-600">
                          <span>{formatDate(service.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getServiceStatusIcon(service.status)}
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getServiceStatusColor(
                              service.status
                            )}`}
                          >
                            {service.status}
                          </span>
                        </div>
                      </div>

                      {/* Estado de pago - Mobile */}
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
                    <div className="hidden sm:grid grid-cols-12 gap-4">
                      {/* Servicio */}
                      <div className="col-span-3">
                        <div className="min-w-0">
                          <h3 className="font-montserrat font-medium text-[14px] text-vet-primary truncate">
                            {service.service}
                          </h3>
                          {service.specifications && (
                            <p className="text-[12px] text-vet-muted mt-1 line-clamp-1">
                              {service.specifications}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Fecha */}
                      <div className="col-span-2 flex items-center">
                        <span className="text-gray-500 text-[14px] font-medium font-montserrat">
                          {formatDate(service.date)}
                        </span>
                      </div>

                      {/* Estado del Servicio */}
                      <div className="col-span-2 flex items-center">
                        <div className="flex items-center gap-1.5">
                          {getServiceStatusIcon(service.status)}
                          <span
                            className={`px-2 py-0.5 rounded-md font-roboto text-[10px] ${getServiceStatusColor(
                              service.status
                            )}`}
                          >
                            {service.status}
                          </span>
                        </div>
                      </div>

                      {/* Estado de Pago */}
                      <div className="col-span-3 flex items-center">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            {paymentInfo.statusIcon}
                            <span className={`px-2 py-0.5 rounded-md font-roboto text-[10px] ${paymentInfo.statusColor}`}>
                              {paymentInfo.status}
                            </span>
                          </div>
                          {paymentInfo.amount && (
                            <span className="font-light text-sm text-vet-primary">
                              {paymentInfo.amount}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="col-span-2 flex items-center justify-center gap-2">
                        <Link
                          to={`${service._id}`}
                          className="p-2 rounded-md bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-600 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        
                        {/* Botón de pago si está pendiente */}
                        {!paymentInfo.isPaid && service.status === "Completado" && (
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
              <Plus className="w-6 h-6 text-vet-muted" />
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