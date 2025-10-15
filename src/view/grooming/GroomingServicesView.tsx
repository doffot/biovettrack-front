// src/views/GroomingServicesView.tsx
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Filter, DollarSign, Scissors, AlertCircle, Plus } from 'lucide-react';
import { getAllGroomingServices } from '../../api/groomingAPI';

type FilterPeriod = 'today' | 'week' | 'month';

export default function GroomingServicesView() {
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('today');

  // Helper para obtener nombre del paciente
  const getPatientName = (patientId: any) => {
    return typeof patientId === 'string' ? 'N/A' : patientId?.name || 'N/A';
  };

  const getPatientSpecies = (patientId: any) => {
    return typeof patientId === 'string' ? '' : patientId?.species || '';
  };

  // =====================================
  // 📡 QUERY PARA OBTENER SERVICIOS
  // =====================================
  const { data: services = [], isLoading, isError, error } = useQuery({
    queryKey: ['groomingServices'],
    queryFn: getAllGroomingServices,
    retry: 2,
  });

  // =====================================
  // 🔍 FILTRAR SERVICIOS POR PERÍODO
  // =====================================
  const filteredServices = useMemo(() => {
    if (!services.length) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return services.filter(service => {
      if (!service.date) return false; // Asegurar que hay fecha

      const serviceDate = new Date(service.date);
      serviceDate.setHours(0, 0, 0, 0);

      switch (filterPeriod) {
        case 'today':
          return serviceDate.getTime() === today.getTime();

        case 'week': {
          const dayOfWeek = today.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - dayOfWeek); // Domingo de esta semana
          startOfWeek.setHours(0, 0, 0, 0);

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado de esta semana
          endOfWeek.setHours(23, 59, 59, 999);

          return serviceDate >= startOfWeek && serviceDate <= endOfWeek;
        }

        case 'month':
          return (
            serviceDate.getMonth() === today.getMonth() &&
            serviceDate.getFullYear() === today.getFullYear()
          );

        default:
          return true;
      }
    });
  }, [services, filterPeriod]);

  // =====================================
  // 💰 CALCULAR TOTALES
  // =====================================
  const totals = useMemo(() => {
    const total = filteredServices.reduce((sum, service) => sum + service.cost, 0);
    const count = filteredServices.length;
    const average = count > 0 ? total / count : 0;

    return { total, count, average };
  }, [filteredServices]);

  // =====================================
  // 🎨 FUNCIONES AUXILIARES
  // =====================================
  const getServiceIcon = (serviceType: string) => {
    const icons: Record<string, string> = {
      'Corte': '✂️',
      'Baño': '🛁',
      'Corte y Baño': '✨'
    };
    return icons[serviceType] || '🐾';
  };

  const getPaymentBadgeColor = (paymentType: string) => {
    const colors: Record<string, string> = {
      'Efectivo': 'bg-[#39ff14] bg-opacity-20 text-[#39ff14]',
      'Pago Movil': 'bg-[#8a7f9e] bg-opacity-20 text-[#8a7f9e]',
      'Zelle': 'bg-[#e7e5f2] bg-opacity-20 text-[#e7e5f2]',
      'Otro': 'bg-[#8a7f9e] bg-opacity-10 text-[#8a7f9e]'
    };
    return colors[paymentType] || 'bg-[#8a7f9e] bg-opacity-10 text-[#8a7f9e]';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // =====================================
  // 🎯 ESTADOS DE CARGA Y ERROR
  // =====================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b132b]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39ff14] mx-auto"></div>
          <p className="mt-4 text-[#e7e5f2]">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b132b] p-4">
        <div className="bg-[#ff5e5b] bg-opacity-10 border border-[#ff5e5b] rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 text-[#ff5e5b]">
            <AlertCircle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Error al cargar servicios</h3>
              <p className="text-sm mt-1">{error?.message || 'Error desconocido'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =====================================
  // 📄 RENDERIZADO PRINCIPAL
  // =====================================
  return (
    <div className="min-h-screen bg-[#0b132b] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#e7e5f2] flex items-center gap-2">
              <Scissors className="w-8 h-8 text-[#39ff14]" />
              Servicios de Grooming
            </h1>
            <p className="text-[#8a7f9e] mt-1">Gestión de servicios de peluquería</p>
          </div>
          <a 
            href="/patients"
            className="flex items-center gap-2 px-4 py-2 bg-[#39ff14] text-[#0b132b] rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Nuevo Servicio
          </a>
        </div>

        {/* Filtros */}
        <div className="bg-[#172554] bg-opacity-50 rounded-lg shadow-lg p-4 mb-6 border border-[#8a7f9e] border-opacity-20">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-[#8a7f9e]" />
            <h2 className="font-semibold text-[#e7e5f2]">Filtrar por período</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterPeriod('today')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterPeriod === 'today'
                  ? 'bg-[#39ff14] text-[#0b132b] shadow-[0_0_20px_rgba(57,255,20,0.3)]'
                  : 'bg-[#8a7f9e] bg-opacity-20 text-[#e7e5f2] hover:bg-opacity-30'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setFilterPeriod('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterPeriod === 'week'
                  ? 'bg-[#39ff14] text-[#0b132b] shadow-[0_0_20px_rgba(57,255,20,0.3)]'
                  : 'bg-[#8a7f9e] bg-opacity-20 text-[#e7e5f2] hover:bg-opacity-30'
              }`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setFilterPeriod('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterPeriod === 'month'
                  ? 'bg-[#39ff14] text-[#0b132b] shadow-[0_0_20px_rgba(57,255,20,0.3)]'
                  : 'bg-[#8a7f9e] bg-opacity-20 text-[#e7e5f2] hover:bg-opacity-30'
              }`}
            >
              Este Mes
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#172554] bg-opacity-50 rounded-lg shadow-lg p-6 border border-[#8a7f9e] border-opacity-20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8a7f9e]">Total Servicios</p>
                <p className="text-2xl font-bold text-[#e7e5f2]">{totals.count}</p>
              </div>
              <div className="bg-[#39ff14] bg-opacity-20 p-3 rounded-full">
                <Scissors className="w-6 h-6 text-[#39ff14]" />
              </div>
            </div>
          </div>

          <div className="bg-[#172554] bg-opacity-50 rounded-lg shadow-lg p-6 border border-[#8a7f9e] border-opacity-20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8a7f9e]">Ingresos Totales</p>
                <p className="text-2xl font-bold text-[#39ff14]">${totals.total.toFixed(2)}</p>
              </div>
              <div className="bg-[#39ff14] bg-opacity-20 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-[#39ff14]" />
              </div>
            </div>
          </div>

          <div className="bg-[#172554] bg-opacity-50 rounded-lg shadow-lg p-6 border border-[#8a7f9e] border-opacity-20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8a7f9e]">Promedio por Servicio</p>
                <p className="text-2xl font-bold text-[#e7e5f2]">${totals.average.toFixed(2)}</p>
              </div>
              <div className="bg-[#8a7f9e] bg-opacity-20 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-[#8a7f9e]" />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Servicios */}
        {filteredServices.length === 0 ? (
          <div className="bg-[#172554] bg-opacity-50 rounded-lg shadow-lg p-12 text-center border border-[#8a7f9e] border-opacity-20">
            <Scissors className="w-16 h-16 text-[#8a7f9e] opacity-50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#e7e5f2] mb-2">
              No hay servicios en este período
            </h3>
            <p className="text-[#8a7f9e]">
              Intenta cambiar el filtro para ver más resultados
            </p>
          </div>
        ) : (
          <div className="bg-[#172554] bg-opacity-50 rounded-lg shadow-lg overflow-hidden border border-[#8a7f9e] border-opacity-20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0b132b] bg-opacity-50 border-b border-[#8a7f9e] border-opacity-20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#8a7f9e] uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#8a7f9e] uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#8a7f9e] uppercase tracking-wider">
                      Servicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#8a7f9e] uppercase tracking-wider">
                      Especificaciones
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#8a7f9e] uppercase tracking-wider">
                      Pago
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[#8a7f9e] uppercase tracking-wider">
                      Costo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8a7f9e] divide-opacity-20">
                  {filteredServices.map((service) => (
                    <tr key={service._id} className="hover:bg-[#8a7f9e] hover:bg-opacity-10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-[#e7e5f2]">
                          <Calendar className="w-4 h-4 text-[#8a7f9e]" />
                          {formatDate(service.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-[#e7e5f2]">
                            {getPatientName(service.patientId)}
                          </p>
                          <p className="text-xs text-[#8a7f9e]">
                            {getPatientSpecies(service.patientId)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-[#e7e5f2]">
                          <span>{getServiceIcon(service.service)}</span>
                          {service.service}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#e7e5f2] max-w-xs truncate">
                          {service.specifications}
                        </p>
                        {service.observations && (
                          <p className="text-xs text-[#8a7f9e] mt-1 max-w-xs truncate">
                            {service.observations}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentBadgeColor(service.paymentType)}`}>
                          {service.paymentType}
                        </span>
                        {service.exchangeRate && (
                          <p className="text-xs text-[#8a7f9e] mt-1">
                            Tasa: {service.exchangeRate}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-semibold text-[#39ff14]">
                          ${service.cost.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}