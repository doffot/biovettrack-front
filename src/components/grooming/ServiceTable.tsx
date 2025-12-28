// src/components/grooming/ServiceTable.tsx
import { Calendar, User, CheckCircle, Edit, Eye, AlertCircle } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

type PatientIdType = string | { 
  _id: string; 
  name?: string; 
  species?: string; 
  breed?: string; 
};

interface ServiceTableProps {
  filteredServices: any[]; 
  getPatientName: (patientId: PatientIdType) => string;
  getPatientSpecies: (patientId: PatientIdType) => string;
  getPatientBreed: (patientId: PatientIdType) => string;
  formatDate: (dateString: string) => string;
  getServiceIcon: (serviceType: string) => string;
  getPaymentStatusBadge: (status: string) => string;
  getPaymentStatusIcon: (status: string) => React.JSX.Element;
  formatCurrency: (amount: number, currency: string, exchangeRate?: number) => string;
}

export default function ServiceTable({ 
  filteredServices, 
  getPatientName, 
  getPatientSpecies, 
  getPatientBreed, 
  formatDate, 
  getServiceIcon, 
  getPaymentStatusBadge, 
  getPaymentStatusIcon,
  formatCurrency
}: ServiceTableProps) {
  
  const getPatientId = (patientId: PatientIdType): string => {
    if (typeof patientId === 'string') {
      return patientId;
    } else {
      return patientId._id;
    }
  };

  return (
    <div className="hidden lg:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-vet-primary/5 to-vet-secondary/5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-900">Servicios</h3>
            <span className="px-2 py-1 bg-vet-primary/10 text-vet-primary text-xs font-medium rounded-md">
              {filteredServices.length}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Pagado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Parcial</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Pendiente</span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead className="bg-gray-50/60 text-xs">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Fecha
                </div>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">
                Paciente
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">
                Servicio
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">
                Pago
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 uppercase tracking-wider">
                Montos
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredServices.map((service, index) => {
              const patientId = service.patientId as PatientIdType;
              const paymentInfo = service.paymentInfo || {};
              const serviceCost = Number(service.cost) || 0;
              
              return (
                <tr 
                  key={service._id} 
                  className={`hover:bg-vet-primary/2 transition-colors duration-150 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'
                  }`}
                >
                  {/* Fecha */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-900">
                        {formatDate(service.date)}
                      </span>
                    </div>
                  </td>
                  
                  {/* Paciente */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-lg flex items-center justify-center border border-vet-primary/20 shadow-xs">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate max-w-[100px]">
                          {getPatientName(patientId)}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <span className="truncate max-w-[80px]">{getPatientSpecies(patientId)}</span>
                          {getPatientBreed(patientId) && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[80px]">{getPatientBreed(patientId)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Servicio */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-vet-primary/10 rounded-md flex items-center justify-center border border-vet-primary/15">
                        <span className="text-sm">{getServiceIcon(service.service)}</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                          {service.service}
                        </span>
                        {service.specifications && (
                          <p className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[140px]">
                            {service.specifications}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  {/* Estado del Pago */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-1.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${getPaymentStatusBadge(paymentInfo.paymentStatus || 'Sin facturar')}`}>
                        {getPaymentStatusIcon(paymentInfo.paymentStatus || 'Sin facturar')}
                        {paymentInfo.paymentStatus || 'Sin facturar'}
                      </span>
                      {paymentInfo.amountPaid > 0 && (
                        <div className="flex items-center gap-1 text-[10px]">
                          <CheckCircle className="w-2.5 h-2.5 text-green-500" />
                          <span className="text-gray-600">
                            {formatCurrency(paymentInfo.amountPaid, paymentInfo.currency || 'USD')}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Montos */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-bold text-gray-900">
                        ${serviceCost.toFixed(2)}
                      </span>
                      
                      {paymentInfo.paymentStatus === 'Pendiente' ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[10px] font-medium text-orange-600">
                            Por cobrar
                          </span>
                        </div>
                      ) : paymentInfo.paymentStatus === 'Parcial' ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[10px] font-medium text-blue-600">
                            Pendiente: ${(serviceCost - paymentInfo.amountPaid).toFixed(2)}
                          </span>
                          <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${(paymentInfo.amountPaid / serviceCost) * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : paymentInfo.paymentStatus === 'Pagado' ? (
                        <div className="flex items-center gap-1 text-[10px] text-green-600">
                          <CheckCircle className="w-2.5 h-2.5" />
                          <span>Completado</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <AlertCircle className="w-2.5 h-2.5" />
                          <span>Sin facturar</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Columna: Acciones */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/patients/${getPatientId(patientId)}/grooming-services/${service._id}`}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors duration-150"
                        title="Ver detalles"
                      >
                        <Eye className="w-3 h-3" />
                      </Link>
                      
                      <Link
                        to={`/patients/${getPatientId(patientId)}/grooming-services/${service._id}/edit`}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium transition-colors duration-150"
                        title="Editar servicio"
                      >
                        <Edit className="w-3 h-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {/* Estado vacío */}
        {filteredServices.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">No se encontraron servicios</h4>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              No hay servicios que coincidan con los criterios actuales.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}