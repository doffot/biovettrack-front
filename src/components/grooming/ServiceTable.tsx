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
    <div className="hidden lg:block bg-sky-soft rounded-xl border border-slate-700/50 shadow-lg shadow-black/10 overflow-hidden">
      {/* Header de la tabla */}
      <div className="px-4 py-3 bg-gradient-to-r from-vet-primary/10 to-vet-secondary/10 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-vet-text">Servicios</h3>
            <span className="px-2 py-1 bg-vet-primary/20 border border-vet-primary/30 text-vet-accent text-xs font-medium rounded-md">
              {filteredServices.length}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-vet-muted">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Pagado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Parcial</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
              <span>Pendiente</span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead className="bg-vet-light text-xs">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-vet-muted uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Fecha
                </div>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-vet-muted uppercase tracking-wider">
                Paciente
              </th>
              <th className="px-4 py-3 text-left font-semibold text-vet-muted uppercase tracking-wider">
                Servicio
              </th>
              <th className="px-4 py-3 text-left font-semibold text-vet-muted uppercase tracking-wider">
                Pago
              </th>
              <th className="px-4 py-3 text-right font-semibold text-vet-muted uppercase tracking-wider">
                Montos
              </th>
              <th className="px-4 py-3 text-center font-semibold text-vet-muted uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {filteredServices.map((service, index) => {
              const patientId = service.patientId as PatientIdType;
              const paymentInfo = service.paymentInfo || {};
              const serviceCost = Number(service.cost) || 0;
              
              return (
                <tr 
                  key={service._id} 
                  className={`hover:bg-slate-700/30 transition-colors duration-150 ${
                    index % 2 === 0 ? 'bg-transparent' : 'bg-slate-800/20'
                  }`}
                >
                  {/* Fecha */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-vet-text">
                        {formatDate(service.date)}
                      </span>
                    </div>
                  </td>
                  
                  {/* Paciente */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-lg flex items-center justify-center border border-vet-primary/30 shadow-lg shadow-vet-primary/20">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-xs font-medium text-vet-text truncate max-w-[100px]">
                          {getPatientName(patientId)}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-vet-muted">
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
                      <div className="w-7 h-7 bg-vet-primary/20 border border-vet-primary/30 rounded-md flex items-center justify-center">
                        <span className="text-sm">{getServiceIcon(service.service)}</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-medium text-vet-text truncate max-w-[120px]">
                          {service.service}
                        </span>
                        {service.specifications && (
                          <p className="text-[10px] text-vet-muted mt-0.5 truncate max-w-[140px]">
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
                          <CheckCircle className="w-2.5 h-2.5 text-green-400" />
                          <span className="text-vet-muted">
                            {formatCurrency(paymentInfo.amountPaid, paymentInfo.currency || 'USD')}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Montos */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-bold text-vet-accent">
                        ${serviceCost.toFixed(2)}
                      </span>
                      
                      {paymentInfo.paymentStatus === 'Pendiente' ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[10px] font-medium text-orange-400">
                            Por cobrar
                          </span>
                        </div>
                      ) : paymentInfo.paymentStatus === 'Parcial' ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[10px] font-medium text-blue-400">
                            Pendiente: ${(serviceCost - paymentInfo.amountPaid).toFixed(2)}
                          </span>
                          <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full transition-all duration-300"
                              style={{ width: `${(paymentInfo.amountPaid / serviceCost) * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : paymentInfo.paymentStatus === 'Pagado' ? (
                        <div className="flex items-center gap-1 text-[10px] text-green-400">
                          <CheckCircle className="w-2.5 h-2.5" />
                          <span>Completado</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <AlertCircle className="w-2.5 h-2.5" />
                          <span>Sin facturar</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/patients/${getPatientId(patientId)}/grooming-services/${service._id}`}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-700 border border-slate-600 hover:bg-slate-600 text-vet-muted hover:text-vet-text text-xs font-medium transition-colors duration-150"
                        title="Ver detalles"
                      >
                        <Eye className="w-3 h-3" />
                      </Link>
                      
                      <Link
                        to={`/patients/${getPatientId(patientId)}/grooming-services/${service._id}/edit`}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors duration-150"
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
            <div className="w-16 h-16 bg-vet-light border border-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-vet-muted" />
            </div>
            <h4 className="text-sm font-medium text-vet-text mb-1">No se encontraron servicios</h4>
            <p className="text-xs text-vet-muted max-w-xs mx-auto">
              No hay servicios que coincidan con los criterios actuales.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}