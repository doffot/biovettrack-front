// src/components/grooming/ServiceMobileCards.tsx
import { Calendar,  Edit, Eye } from 'lucide-react';
import React from 'react';
import { formatCurrency, getPaymentMethodInfo } from '../../utils/currencyUtils';
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
  getPaymentStatusIcon
}: ServiceMobileCardsProps) {
  return (
    <div className="lg:hidden grid gap-4">
      {filteredServices.map((service) => {
        const paymentMethodInfo = getPaymentMethodInfo(service.paymentMethod);
        
        return (
          <div key={service._id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatDate(service.date)}</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{getPatientName(service.patientId)}</p>
                <p className="text-sm text-gray-500">
                  {getPatientSpecies(service.patientId)} • {getPatientBreed(service.patientId)}
                </p>
              </div>
              <span className="text-lg font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-200">
                {formatCurrency(service.cost, paymentMethodInfo.currency)}
              </span>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getServiceIcon(service.service)}</span>
                <span className="font-medium text-gray-900">{service.service}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getServiceStatusBadge(service.status)}`}>
                  {service.status}
                </span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusBadge(service.paymentStatus)}`}>
                  {getPaymentStatusIcon(service.paymentStatus)}
                  {service.paymentStatus}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Método:</span>
                  <span className="text-sm text-gray-900">
                    {paymentMethodInfo.name} ({paymentMethodInfo.currency})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Pagado:</span>
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrency(service.amountPaid, paymentMethodInfo.currency)}
                  </span>
                </div>
                {service.paymentReference && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Referencia:</span>
                    <span className="text-sm text-gray-900 font-mono">{service.paymentReference}</span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-700">{service.specifications || 'Sin especificaciones'}</p>
                {service.observations && (
                  <p className="text-sm text-gray-500 mt-1">{service.observations}</p>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Link
                  to={`/patients/${service.patientId}/grooming-services/${service._id}`}
                  className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors"
                  title="Ver detalles"
                >
                  <Eye className="w-3 h-3" />
                </Link>
                <Link
                  to={`/patients/${service.patientId}/grooming-services/${service._id}/edit`}
                  className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium transition-colors"
                  title="Editar servicio"
                >
                  <Edit className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}