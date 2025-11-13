// src/components/grooming/ServiceHistoryModal.tsx
import { useQuery } from "@tanstack/react-query";
import { X, Scissors, Calendar,  CheckCircle, Clock, XCircle, AlertTriangle, ChevronRight } from "lucide-react";
import { getGroomingServicesByPatient } from "../../api/groomingAPI";
import { Link } from "react-router-dom";
import { formatCurrency, getPaymentMethodInfo } from "../../utils/currencyUtils";

interface ServiceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  currentServiceId?: string;
}

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'Completado': return <CheckCircle className="w-3.5 h-3.5 text-green-600" />;
    case 'Cancelado': return <XCircle className="w-3.5 h-3.5 text-red-500" />;
    case 'En progreso': return <Clock className="w-3.5 h-3.5 text-yellow-600" />;
    case 'Programado': return <Clock className="w-3.5 h-3.5 text-blue-600" />;
    default: return <Clock className="w-3.5 h-3.5 text-gray-500" />;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { bg: string; text: string; border: string }> = {
    'Completado': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'Cancelado': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'En progreso': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'Programado': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
  };
  
  const config = configs[status as keyof typeof configs] || configs['Programado'];
  
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text} ${config.border} border`}>
      <StatusIcon status={status} />
      {status}
    </div>
  );
};

const PaymentBadge = ({ status, balance, currency }: { status: string; balance: number; currency: string }) => {
  if (balance === 0 && status === 'Pagado') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600">
        <CheckCircle className="w-3 h-3" />
        Pagado
      </span>
    );
  }
  
  if (balance > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-orange-600">
        <AlertTriangle className="w-3 h-3" />
        Pendiente {formatCurrency(balance, currency)}
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1 text-xs text-blue-600">
      <Clock className="w-3 h-3" />
      {status}
    </span>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

export default function ServiceHistoryModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  currentServiceId
}: ServiceHistoryModalProps) {
  
  const {  data:services = [], isLoading, isError } = useQuery({
    queryKey: ["groomingServicesByPatient", patientId],
    queryFn: () => getGroomingServicesByPatient(patientId),
    enabled: isOpen && !!patientId,
  });

  if (!isOpen) return null;

  // Filtra y ordena
  const filteredServices = services
    .filter(service => service._id !== currentServiceId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // ✅ Estadísticas por moneda
  const statsByCurrency = filteredServices.reduce((acc: Record<string, { totalGastado: number; pendientePago: number; completados: number; total: number }>, service) => {
    const paymentInfo = getPaymentMethodInfo(service.paymentMethod);
    const currency = paymentInfo.currency;
    
    if (!acc[currency]) {
      acc[currency] = { totalGastado: 0, pendientePago: 0, completados: 0, total: 0 };
    }
    
    acc[currency].total += 1;
    if (service.status === 'Completado') {
      acc[currency].completados += 1;
      acc[currency].totalGastado += service.cost;
    }
    acc[currency].pendientePago += (service.cost - service.amountPaid);
    
    return acc;
  }, {});

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-vet-light rounded-lg">
              <Scissors className="w-5 h-5 text-vet-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-vet-text">Historial de Servicios</h2>
              <p className="text-sm text-vet-muted">{patientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ✅ Estadísticas por moneda */}
        <div className="p-5 bg-vet-light/30 border-b border-gray-200">
          {Object.entries(statsByCurrency).map(([currency, stats]) => (
            <div key={currency} className="mb-4 last:mb-0">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">
                {currency === 'VES' || currency === 'bolivares' || currency === 'Bs' ? 'Bolívares (Bs)' : currency}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center">
                  <p className="text-xl font-bold text-vet-primary">{stats.total}</p>
                  <p className="text-xs text-vet-muted">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-green-600">{stats.completados}</p>
                  <p className="text-xs text-vet-muted">Completados</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-vet-primary">
                    {formatCurrency(stats.totalGastado, currency)}
                  </p>
                  <p className="text-xs text-vet-muted">Total Gastado</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-orange-600">
                    {formatCurrency(stats.pendientePago, currency)}
                  </p>
                  <p className="text-xs text-vet-muted">Pendiente</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {isLoading && (
            <div className="text-center py-12">
              <div className="w-10 h-10 mx-auto mb-3 border-3 border-vet-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-vet-muted">Cargando historial...</p>
            </div>
          )}

          {isError && (
            <div className="text-center py-12">
              <XCircle className="w-12 h-12 mx-auto text-red-500 mb-3" />
              <p className="text-sm text-vet-muted">Error al cargar el historial</p>
            </div>
          )}

          {!isLoading && !isError && filteredServices.length === 0 && (
            <div className="text-center py-12">
              <Scissors className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-vet-muted">No hay servicios anteriores</p>
            </div>
          )}

          {!isLoading && !isError && filteredServices.length > 0 && (
            <div className="space-y-3">
              {filteredServices.map((service) => {
                const balance = service.cost - service.amountPaid;
                const currency = getPaymentMethodInfo(service.paymentMethod).currency;
                
                return (
                  <Link
                    key={service._id}
                    to={`/patients/${patientId}/grooming-services/${service._id}`}
                    onClick={onClose}
                    className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-vet-primary hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 bg-vet-light rounded-lg">
                            <Scissors className="w-3.5 h-3.5 text-vet-primary" />
                          </div>
                          <h3 className="font-bold text-vet-text text-sm">
                            {service.service}
                          </h3>
                          <StatusBadge status={service.status} />
                        </div>

                        <div className="flex items-center gap-3 text-xs text-vet-muted mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(service.date)}
                          </span>
                          {/* ✅ Sin DollarSign, solo formatCurrency */}
                          <span>
                            {formatCurrency(service.cost, currency)}
                          </span>
                          <PaymentBadge 
                            status={service.paymentStatus} 
                            balance={balance} 
                            currency={currency} 
                          />
                        </div>

                        <p className="text-xs text-vet-muted line-clamp-1">
                          {service.specifications}
                        </p>
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-vet-primary transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-vet-primary text-white rounded-lg font-medium hover:bg-vet-accent transition-colors text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}