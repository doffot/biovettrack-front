// src/views/grooming/GroomingReportView.tsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { getAllGroomingServices } from "../../api/groomingAPI";
import { getInvoices } from "../../api/invoiceAPI";
import type { Invoice } from "../../types/invoice";
import type { GroomingService } from "../../types/grooming";
import { GroomingReportSummary } from "./GroomingSummary";
import { GroomingReportMetrics } from "../../components/grooming/GroomingReportMetrics";
import { GroomingReportTable } from "../../components/grooming/GroomingReportTable";

interface PaymentInfo {
  paymentStatus: string;
  amountPaidUSD: number;
  amountPaidBs: number;
  exchangeRate: number;
  isPaid: boolean;
}

export interface EnrichedGroomingService extends GroomingService {
  paymentInfo: PaymentInfo;
  ownerName: string;
  ownerPhone: string;
  patientName: string;
}

export type GroomingDateRange = "today" | "week" | "month" | "year" | "all";

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="text-center">
        <div className="w-8 h-8 mx-auto mb-3 border-2 border-gray-200 border-t-[#0A7EA4] rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Cargando reporte...</p>
      </div>
    </div>
  );
}

// const getPeriodLabel = (dateRange: GroomingDateRange): string => {
//   const labels: Record<GroomingDateRange, string> = {
//     today: "Hoy",
//     week: "Esta semana",
//     month: "Este mes",
//     year: "Este año",
//     all: "Todo",
//   };
//   return labels[dateRange] || "";
// };

export default function GroomingReportView() {
  const {
    data: services = [],
    isLoading: isLoadingServices,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["groomingServices"],
    queryFn: getAllGroomingServices,
    retry: 2,
  });

  const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["invoices", "groomingReport"],
    queryFn: () => getInvoices({ limit: 10000 }),
  });

  const invoices = (invoicesData?.invoices || []) as Invoice[];
  const isLoading = isLoadingServices || isLoadingInvoices;

  // Encontrar factura para un servicio
  const findInvoiceForService = (serviceId: string): Invoice | undefined => {
    return invoices.find((invoice) =>
      invoice.items?.some(
        (item) => item.type === "grooming" && item.resourceId === serviceId
      )
    );
  };

  // Obtener info de pago
  const getPaymentInfo = (service: GroomingService): PaymentInfo => {
    const invoice = findInvoiceForService(service._id!);

    if (!invoice) {
      return {
        paymentStatus: "Sin facturar",
        amountPaidUSD: 0,
        amountPaidBs: 0,
        exchangeRate: 1,
        isPaid: false,
      };
    }

    return {
      paymentStatus: invoice.paymentStatus,
      amountPaidUSD: invoice.amountPaidUSD || 0,
      amountPaidBs: invoice.amountPaidBs || 0,
      exchangeRate: invoice.exchangeRate || 1,
      isPaid: invoice.paymentStatus === "Pagado",
    };
  };

  // Extraer datos del paciente y owner
  const getPatientData = (
    patientId: GroomingService["patientId"]
  ): { patientName: string; ownerName: string; ownerPhone: string } => {
    if (!patientId || typeof patientId === "string") {
      return { patientName: "—", ownerName: "—", ownerPhone: "" };
    }

    const patientName = patientId.name || "—";
    let ownerName = "—";
    let ownerPhone = "";

    if (patientId.owner) {
      if (typeof patientId.owner === "string") {
        ownerName = "Propietario";
      } else if (patientId.owner !== null) {
        ownerName = patientId.owner.name || "—";
        ownerPhone = patientId.owner.contact || "";
      }
    }

    return { patientName, ownerName, ownerPhone };
  };

  // Enriquecer servicios
  const enrichedServices: EnrichedGroomingService[] = useMemo(() => {
    return services.map((service: GroomingService) => {
      const paymentInfo = getPaymentInfo(service);
      const { patientName, ownerName, ownerPhone } = getPatientData(service.patientId);

      return {
        ...service,
        paymentInfo,
        patientName,
        ownerName,
        ownerPhone,
      };
    });
  }, [services, invoices]);

  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Error al cargar el reporte</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-[#0A7EA4] text-white rounded-md hover:bg-[#085F7A]"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="p-1.5 -ml-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-base font-semibold text-gray-900">
                  Reporte de Peluquería
                </h1>
                <p className="text-xs text-gray-500">
                  {enrichedServices.length} servicios
                </p>
              </div>
            </div>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <GroomingReportSummary services={enrichedServices} />
        <GroomingReportMetrics services={enrichedServices} />
        <GroomingReportTable services={enrichedServices} />
      </main>
    </div>
  );
}