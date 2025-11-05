// src/views/GroomingServicesView.tsx
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, DollarSign, Scissors, AlertCircle, Plus, User, Search, ArrowLeft } from 'lucide-react';
import { getAllGroomingServices } from '../../api/groomingAPI';
import { Link } from 'react-router-dom';

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
      'Efectivo': 'bg-green-100 text-green-700 border border-green-200',
      'Pago Movil': 'bg-blue-100 text-blue-700 border border-blue-200',
      'Zelle': 'bg-purple-100 text-purple-700 border border-purple-200',
      'Transferencia': 'bg-orange-100 text-orange-700 border border-orange-200',
      'Otro': 'bg-gray-100 text-gray-700 border border-gray-200'
    };
    return colors[paymentType] || 'bg-gray-100 text-gray-700 border border-gray-200';
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
      <div className="w-full">
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-vet-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-vet-text font-medium">Cargando servicios...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-[70vh]">
          <div className="bg-white p-8 rounded-2xl border border-red-200 text-center max-w-md mx-auto shadow-sm">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Error al cargar servicios</h2>
            <p className="text-gray-600 mb-6">{error?.message || 'Error desconocido'}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold transition-all"
            >
              Reintentar
            </button>
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
      {/* Header Fijo Mejorado */}
      <div className="fixed top-15 left-0 right-0 lg:left-64 z-30 bg-white border-b border-vet-muted/20 shadow-sm">
        <div className="px-6 lg:px-8 pt-6 pb-4">
          <div className="flex items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* BackButton siempre visible */}
              <Link
                to="/"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-vet-light hover:bg-vet-primary/10 text-vet-primary transition-colors flex-shrink-0"
                title="Volver al dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-vet-primary/10 rounded-lg">
                    <Scissors className="w-6 h-6 text-vet-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-vet-text">
                    Servicios de Peluquería
                  </h1>
                </div>
                <p className="text-vet-muted text-sm">
                  Gestión de servicios de peluquería
                </p>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-vet-text">{totals.count}</p>
                <p className="text-vet-muted text-sm">Total servicios</p>
              </div>
            </div>

            {/* Botón "Nuevo Servicio" */}
            <div className="hidden sm:block flex-shrink-0">
              <Link
                to="/patients"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Nuevo Servicio</span>
              </Link>
            </div>
          </div>

          {/* Search Bar y Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-vet-muted" />
              </div>
              <input
                type="text"
                placeholder="Buscar por paciente, servicio o especificaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-vet-light border border-vet-muted/30 rounded-xl text-vet-text placeholder-vet-muted focus:outline-none focus:ring-2 focus:ring-vet-primary/50 focus:border-vet-primary transition-colors"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setFilterPeriod('today')}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  filterPeriod === 'today'
                    ? 'bg-vet-primary text-white shadow-sm'
                    : 'bg-vet-light text-vet-text hover:bg-vet-primary/10 border border-vet-muted/20'
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => setFilterPeriod('week')}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  filterPeriod === 'week'
                    ? 'bg-vet-primary text-white shadow-sm'
                    : 'bg-vet-light text-vet-text hover:bg-vet-primary/10 border border-vet-muted/20'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setFilterPeriod('month')}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  filterPeriod === 'month'
                    ? 'bg-vet-primary text-white shadow-sm'
                    : 'bg-vet-light text-vet-text hover:bg-vet-primary/10 border border-vet-muted/20'
                }`}
              >
                Mes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Espacio para el header fijo */}
      <div className="h-55 md:h-45 lg:h-38"></div>

      {/* Botón flotante móvil */}
      <Link
        to="/patients"
        className="sm:hidden fixed bottom-6 right-6 z-40 flex items-center justify-center w-16 h-16 rounded-full bg-vet-primary hover:bg-vet-secondary text-white shadow-lg hover:shadow-xl active:scale-95 transition-all"
      >
        <Plus className="w-6 h-6" />
      </Link>

      {/* Contenido Principal */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
        {/* Estadísticas - Mejorado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Servicios</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totals.count}</p>
              </div>
              <div className="w-12 h-12 bg-vet-primary/10 rounded-xl flex items-center justify-center border border-vet-primary/20">
                <Scissors className="w-6 h-6 text-vet-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Ingresos Totales</p>
                <p className="text-2xl font-bold text-green-600 mt-1">${totals.total.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center border border-green-200">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Promedio por Servicio</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">${totals.average.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Servicios - Versión Responsive */}
        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
            <Scissors className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm ? "No hay resultados" : "No hay servicios en este período"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? "Intenta con otros términos de búsqueda" 
                : "Intenta cambiar el filtro para ver más resultados"
              }
            </p>
            {!searchTerm && (
              <Link
                to="/patients"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold transition-all"
              >
                <Plus className="w-5 h-5" />
                Crear Primer Servicio
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* 👇 Versión para Móvil (pantallas pequeñas) 👇 */}
            <div className="lg:hidden grid gap-4">
              {filteredServices.map((service) => (
                <div key={service._id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
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
                        {getPatientSpecies(service.patientId)} • {getPatientBreed(service.patientId)}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-200">
                      ${service.cost.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getServiceIcon(service.service)}</span>
                      <span className="font-medium text-gray-900">{service.service}</span>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-700">
                        {service.specifications || 'Sin especificaciones'}
                      </p>
                      {service.observations && (
                        <p className="text-sm text-gray-500 mt-1">
                          {service.observations}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentBadgeColor(service.paymentType)}`}>
                        {service.paymentType}
                      </span>
                      {service.exchangeRate && (
                        <span className="text-sm text-gray-500">
                          Tasa: {service.exchangeRate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 👇 Versión para Desktop (pantallas grandes) 👇 */}
            <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Servicio
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Especificaciones
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Pago
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Costo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredServices.map((service) => (
                      <tr key={service._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatDate(service.date)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-vet-primary/10 rounded-lg flex items-center justify-center border border-vet-primary/20">
                              <User className="w-5 h-5 text-vet-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {getPatientName(service.patientId)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {getPatientSpecies(service.patientId)} • {getPatientBreed(service.patientId)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200">
                            <span className="text-base">{getServiceIcon(service.service)}</span>
                            {service.service}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-900">
                              {service.specifications || 'Sin especificaciones'}
                            </p>
                            {service.observations && (
                              <p className="text-sm text-gray-500 mt-1">
                                {service.observations}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentBadgeColor(service.paymentType)}`}>
                              {service.paymentType}
                            </span>
                            {service.exchangeRate && (
                              <p className="text-xs text-gray-500">
                                Tasa: {service.exchangeRate}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-lg font-bold text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
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