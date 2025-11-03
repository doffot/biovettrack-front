// src/views/GroomingServicesView.tsx
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, DollarSign, Scissors, AlertCircle, Plus, User, Search } from 'lucide-react';
import { getAllGroomingServices } from '../../api/groomingAPI';
import BackButton from '../../components/BackButton';

type FilterPeriod = 'today' | 'week' | 'month';

export default function GroomingServicesView() {
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('today');
  const [searchTerm, setSearchTerm] = useState('');

  // Helper para obtener nombre del paciente CORREGIDO
  const getPatientName = (patientId: any) => {
    if (!patientId) return 'Paciente no encontrado';
    if (typeof patientId === 'string') return 'Cargando...';
    return patientId?.name || 'Paciente no encontrado';
  };

  const getPatientSpecies = (patientId: any) => {
    if (!patientId || typeof patientId === 'string') return '';
    return patientId?.species || '';
  };

  const getPatientBreed = (patientId: any) => {
    if (!patientId || typeof patientId === 'string') return '';
    return patientId?.breed || '';
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
  // 🔍 FILTRAR SERVICIOS POR PERÍODO Y BÚSQUEDA
  // =====================================
  const filteredServices = useMemo(() => {
    if (!services.length) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredByPeriod = services.filter(service => {
      if (!service.date) return false;

      const serviceDate = new Date(service.date);
      serviceDate.setHours(0, 0, 0, 0);

      switch (filterPeriod) {
        case 'today':
          return serviceDate.getTime() === today.getTime();

        case 'week': {
          const dayOfWeek = today.getDay();
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - dayOfWeek);
          startOfWeek.setHours(0, 0, 0, 0);

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
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

    // Aplicar búsqueda
    if (!searchTerm) return filteredByPeriod;

    return filteredByPeriod.filter(service => {
      const patientName = getPatientName(service.patientId).toLowerCase();
      const serviceType = service.service?.toLowerCase() || '';
      const specifications = service.specifications?.toLowerCase() || '';
      
      return patientName.includes(searchTerm.toLowerCase()) ||
             serviceType.includes(searchTerm.toLowerCase()) ||
             specifications.includes(searchTerm.toLowerCase());
    });
  }, [services, filterPeriod, searchTerm]);

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
      'Efectivo': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      'Pago Movil': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      'Zelle': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      'Transferencia': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
      'Otro': 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    };
    return colors[paymentType] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 font-medium">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md backdrop-blur-sm">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Error al cargar servicios</h3>
              <p className="text-sm mt-1 text-gray-300">{error?.message || 'Error desconocido'}</p>
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
    <>
      {/* Header Fijo */}
      <div className="fixed mt-10 lg:mt-0 top-16 left-0 right-0 lg:top-0 lg:left-64 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <BackButton />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Servicios de Grooming</h1>
                <p className="text-gray-400 text-sm">Gestión de servicios de peluquería</p>
              </div>
            </div>

            {/* Botón "Nuevo Servicio" */}
            <div className="hidden sm:block flex-shrink-0">
              <a 
                href="/patients"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500 font-medium text-sm transition-colors whitespace-nowrap border border-emerald-500/30"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Servicio</span>
              </a>
            </div>
          </div>

          {/* Search Bar y Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-2xl w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por paciente, servicio o especificaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setFilterPeriod('today')}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  filterPeriod === 'today'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => setFilterPeriod('week')}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  filterPeriod === 'week'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setFilterPeriod('month')}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  filterPeriod === 'month'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                Mes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Espacio para el header fijo - Ajustado para tablets */}
      <div className="h-48 sm:h-44 lg:h-40"></div>

      {/* Botón flotante móvil */}
      <a 
        href="/patients"
        className="sm:hidden fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg active:scale-95 transition-all"
      >
        <Plus className="w-6 h-6" />
      </a>

      {/* Contenido Principal */}
      <div className="px-4 mt-15 md:mt-8 lg:mt-0 sm:px-6 md:px-8 max-w-7xl mx-auto pb-12">
        {/* Estadísticas - Mejorado para tablets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-sm text-gray-400 font-medium">Total Servicios</p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">{totals.count}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                <Scissors className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium">Ingresos Totales</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">${totals.total.toFixed(2)}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-700/50 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium">Promedio por Servicio</p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">${totals.average.toFixed(2)}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Servicios - Versión Responsive */}
        {filteredServices.length === 0 ? (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 sm:p-12 text-center border border-gray-700/50">
            <Scissors className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {searchTerm ? "No hay resultados" : "No hay servicios en este período"}
            </h3>
            <p className="text-gray-400 text-sm sm:text-base">
              {searchTerm 
                ? "Intenta con otros términos de búsqueda" 
                : "Intenta cambiar el filtro para ver más resultados"
              }
            </p>
          </div>
        ) : (
          <>
            {/* 👇 Versión para Móvil (pantallas pequeñas) 👇 */}
            <div className="lg:hidden space-y-4">
              {filteredServices.map((service) => (
                <div key={service._id} className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-white mb-2">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>{formatDate(service.date)}</span>
                      </div>
                      <p className="text-sm font-medium text-white">
                        {getPatientName(service.patientId)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {getPatientSpecies(service.patientId)} • {getPatientBreed(service.patientId)}
                      </p>
                    </div>
                    <span className="inline-flex text-sm font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                      ${service.cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/30">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{getServiceIcon(service.service)}</span>
                      <span className="text-sm font-medium text-white">{service.service}</span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {service.specifications || 'Sin especificaciones'}
                    </p>
                    {service.observations && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                        {service.observations}
                      </p>
                    )}
                  </div>
                  <div className="mt-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentBadgeColor(service.paymentType)}`}>
                      {service.paymentType}
                    </span>
                    {service.exchangeRate && (
                      <p className="text-xs text-gray-400 mt-1">
                        Tasa: {service.exchangeRate}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 👇 Versión para Tablet/Desktop (pantallas medianas y grandes) 👇 */}
            <div className="hidden lg:block bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50 border-b border-gray-700/50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Servicio
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Especificaciones
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Pago
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Costo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {filteredServices.map((service) => (
                      <tr key={service._id} className="hover:bg-gray-700/20 transition-colors group">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-white">
                            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-xs sm:text-sm">{formatDate(service.date)}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30 flex-shrink-0">
                              <User className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {getPatientName(service.patientId)}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {getPatientSpecies(service.patientId)} • {getPatientBreed(service.patientId)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-white bg-gray-700/50 px-2 sm:px-3 py-1.5 rounded-lg border border-gray-600/50">
                            <span className="text-sm">{getServiceIcon(service.service)}</span>
                            <span className="truncate max-w-20 sm:max-w-none">{service.service}</span>
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="max-w-[150px] sm:max-w-xs">
                            <p className="text-xs sm:text-sm text-white line-clamp-2">
                              {service.specifications || 'Sin especificaciones'}
                            </p>
                            {service.observations && (
                              <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                                {service.observations}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentBadgeColor(service.paymentType)}`}>
                              {service.paymentType}
                            </span>
                            {service.exchangeRate && (
                              <p className="text-xs text-gray-400">
                                Tasa: {service.exchangeRate}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                          <span className="inline-flex text-xs sm:text-sm font-semibold text-emerald-400 bg-emerald-500/10 px-2 sm:px-3 py-1.5 rounded-lg border border-emerald-500/20">
                            ${service.cost.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}