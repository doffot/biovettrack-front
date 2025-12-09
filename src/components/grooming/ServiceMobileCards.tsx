// src/components/grooming/ServiceMobileCards.tsx
import { Calendar, Edit, Eye, CreditCard, AlertCircle } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

interface ServiceMobileCardsProps {
  filteredServices: any[];
  getPatientName: (patientId: any) => string;
  getPatientSpecies: (patientId: any) => string;
  getPatientBreed: (patientId: any) => string;
  formatDate: (dateString: string) => string;
  getServiceIcon: (serviceType: string) => string;
  getServiceStatusBadge: (status: string) => string;
  getPaymentStatusBadge: (status: string) => string;
  getPaymentStatusIcon: (status: string) => React.JSX.Element;
  formatCurrency: (amount: number, currency: string, exchangeRate?: number) => string;
}

export default function ServiceMobileCards({
  filteredServices,
  getPatientName,
  getPatientSpecies,
  getPatientBreed,
  formatDate,
  getServiceIcon,
  getServiceStatusBadge,
  getPaymentStatusBadge,
  getPaymentStatusIcon,
  formatCurrency
}: ServiceMobileCardsProps) {
  
  const getPatientId = (patientId: any): string => {
    if (!patientId) return '';
    if (typeof patientId === 'string') return patientId;
    return patientId._id || '';
  };

  return (
    <div className="lg:hidden grid gap-4">
      {filteredServices.map((service) => {
        const paymentInfo = service.paymentInfo || {};
        const serviceCost = Number(service.cost) || 0;
        const patientId = getPatientId(service.patientId);
        
        // Determinar si está pagado completamente
        const isPaid = paymentInfo.paymentStatus === 'Pagado';
        const isPartial = paymentInfo.paymentStatus === 'Parcial';
        const isPending = paymentInfo.paymentStatus === 'Pendiente';
       
        
        return (
          <div key={service._id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatDate(service.date)}</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {getPatientName(service.patientId)}
                </p>
                <p className="text-sm text-gray-500">
                  {getPatientSpecies(service.patientId)}
                  {getPatientBreed(service.patientId) && ` • ${getPatientBreed(service.patientId)}`}
                </p>
              </div>
              
              {/* Monto del servicio */}
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">
                  ${serviceCost.toFixed(2)}
                </span>
                {paymentInfo.currency && paymentInfo.currency !== 'USD' && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(serviceCost, paymentInfo.currency, paymentInfo.exchangeRate)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-gray-100">
              {/* Tipo de servicio */}
              <div className="flex items-center gap-2">
                <span className="text-lg">{getServiceIcon(service.service)}</span>
                <span className="font-medium text-gray-900">{service.service}</span>
              </div>
              
              {/* Estados */}
              <div className="grid grid-cols-2 gap-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getServiceStatusBadge(service.status)}`}>
                  {service.status}
                </span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadge(paymentInfo.paymentStatus || 'Sin facturar')}`}>
                  {getPaymentStatusIcon(paymentInfo.paymentStatus || 'Sin facturar')}
                  {paymentInfo.paymentStatus || 'Sin facturar'}
                </span>
              </div>

              {/* Información de pago */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                {isPaid ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Estado:</span>
                      <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        Pagado completo
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Monto pagado:</span>
                      <span className="text-sm text-gray-900">
                        {formatCurrency(paymentInfo.amountPaid || 0, paymentInfo.currency || 'USD')}
                      </span>
                    </div>
                    {paymentInfo.paymentReference && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Referencia:</span>
                        <span className="text-sm text-gray-900 font-mono">
                          {paymentInfo.paymentReference}
                        </span>
                      </div>
                    )}
                  </>
                ) : isPartial ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Pagado:</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {formatCurrency(paymentInfo.amountPaid || 0, paymentInfo.currency || 'USD')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Pendiente:</span>
                      <span className="text-sm font-semibold text-orange-600">
                        ${(serviceCost - (paymentInfo.amountPaid || 0)).toFixed(2)}
                      </span>
                    </div>
                    {/* Barra de progreso */}
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${((paymentInfo.amountPaid || 0) / serviceCost) * 100}%` }}
                      />
                    </div>
                  </>
                ) : isPending ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Estado:</span>
                    <span className="text-sm font-semibold text-orange-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Por cobrar: ${serviceCost.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Estado:</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Sin facturar
                    </span>
                  </div>
                )}
              </div>

              {/* Especificaciones y observaciones */}
              {(service.specifications || service.observations) && (
                <div className="space-y-1">
                  {service.specifications && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Especificaciones:</span> {service.specifications}
                    </p>
                  )}
                  {service.observations && (
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Observaciones:</span> {service.observations}
                    </p>
                  )}
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Link
                  to={`/patients/${patientId}/grooming-services/${service._id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors"
                  title="Ver detalles"
                >
                  <Eye className="w-3 h-3" />
                  Ver
                </Link>
                <Link
                  to={`/patients/${patientId}/grooming-services/${service._id}/edit`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium transition-colors"
                  title="Editar servicio"
                >
                  <Edit className="w-3 h-3" />
                  Editar
                </Link>
                
                {/* Botón de pago si está pendiente */}
                {(isPending || isPartial) && (
                  <button
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium transition-colors"
                    title="Pendiente de pago"
                  >
                    <CreditCard className="w-3 h-3" />
                    Cobrar
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}