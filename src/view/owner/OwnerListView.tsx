// src/views/GroomingServicesView.tsx
import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Filter, DollarSign, Scissors, AlertCircle, Plus, Search } from 'lucide-react';
import { getAllGroomingServices } from '../../api/groomingAPI';
import { Link } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import FloatingParticles from '../../components/FloatingParticles';

type FilterPeriod = 'today' | 'week' | 'month';

export default function GroomingServicesView() {
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

    let filtered = services.filter(service => {
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

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(service => {
        const patientName = getPatientName(service.patientId).toLowerCase();
        const serviceType = service.service.toLowerCase();
        const search = searchTerm.toLowerCase();
        return patientName.includes(search) || serviceType.includes(search);
      });
    }

    return filtered;
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
      'Efectivo': 'bg-primary/20 text-primary',
      'Pago Movil': 'bg-muted/20 text-muted',
      'Zelle': 'bg-text/20 text-text',
      'Otro': 'bg-muted/10 text-muted'
    };
    return colors[paymentType] || 'bg-muted/10 text-muted';
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
      <div className="relative min-h-screen bg-gradient-dark overflow-hidden flex flex-col">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(57, 255, 20, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(57, 255, 20, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />

        <FloatingParticles />

        <div className="relative z-10 flex items-center justify-center flex-1 pt-16">
          <div className="text-center animate-pulse-soft">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-primary text-lg">Cargando servicios...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="relative min-h-screen bg-gradient-dark overflow-hidden flex items-center justify-center p-4">
        <FloatingParticles />
        
        <div className="relative z-10 max-w-md">
          <div className="relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-background/40 border-danger/30 p-6">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            
            <div className="relative z-10 flex items-center gap-3 text-danger">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Error al cargar servicios</h3>
                <p className="text-sm mt-1">{error?.message || 'Error desconocido'}</p>
              </div>
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
    <div className="relative min-h-screen bg-gradient-dark overflow-hidden pb-20">
      {/* Fondo decorativo */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(57, 255, 20, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(57, 255, 20, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />

      <FloatingParticles />

      {/* Botón fijo de regreso */}
      <div className="fixed top-22 left-7 z-150">
        <BackButton />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="tile-entrance">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text title-shine mb-2 flex items-center gap-2">
                <Scissors className="w-8 h-8 text-primary" />
                Servicios de Grooming
              </h1>
              <p className="text-muted text-sm sm:text-base">
                Gestión de servicios de peluquería
              </p>
            </div>

            <div className="tile-entrance" style={{ animationDelay: "0.2s" }}>
              <Link
                to="/patients"
                className="group relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm hover:shadow-premium-hover hover:scale-105 transition-all duration-300 cursor-pointer bg-primary/20 border-primary/30 p-3 sm:p-4 inline-flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

                <div className="relative z-10 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-black/20 text-primary">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
                  </div>
                  <div className="text-left">
                    <div className="text-text font-bold text-sm sm:text-base">
                      Nuevo Servicio
                    </div>
                    <div className="text-muted text-xs sm:text-sm">
                      Agregar servicio
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Filtros */}
          <div
            className={`relative mb-6 transform transition-all duration-1000 delay-100 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-background/40 border-muted/20 p-4">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-text">Filtrar por período</h2>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilterPeriod('today')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filterPeriod === 'today'
                        ? 'bg-primary text-background shadow-[0_0_20px_rgba(57,255,20,0.3)]'
                        : 'bg-muted/20 text-text hover:bg-muted/30'
                    }`}
                  >
                    Hoy
                  </button>
                  <button
                    onClick={() => setFilterPeriod('week')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filterPeriod === 'week'
                        ? 'bg-primary text-background shadow-[0_0_20px_rgba(57,255,20,0.3)]'
                        : 'bg-muted/20 text-text hover:bg-muted/30'
                    }`}
                  >
                    Esta Semana
                  </button>
                  <button
                    onClick={() => setFilterPeriod('month')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filterPeriod === 'month'
                        ? 'bg-primary text-background shadow-[0_0_20px_rgba(57,255,20,0.3)]'
                        : 'bg-muted/20 text-text hover:bg-muted/30'
                    }`}
                  >
                    Este Mes
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div
            className={`relative max-w-md mx-auto lg:mx-0 mb-6 transform transition-all duration-1000 delay-200 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-background/40 border-muted/20 hover:border-primary/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

              <div className="relative z-10 flex items-center p-3 sm:p-4">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar por paciente o servicio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent text-text placeholder-muted focus:outline-none text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 transform transition-all duration-1000 delay-300 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-background/40 border-muted/20 p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
              
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Total Servicios</p>
                  <p className="text-2xl font-bold text-text">{totals.count}</p>
                </div>
                <div className="bg-primary/20 p-3 rounded-full">
                  <Scissors className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-background/40 border-muted/20 p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
              
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-primary">${totals.total.toFixed(2)}</p>
                </div>
                <div className="bg-primary/20 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-background/40 border-muted/20 p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
              
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Promedio por Servicio</p>
                  <p className="text-2xl font-bold text-text">${totals.average.toFixed(2)}</p>
                </div>
                <div className="bg-muted/20 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {filteredServices.length === 0 ? (
            <div
              className={`transform transition-all duration-1000 delay-400 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              <div className="text-center py-12">
                <div className="relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-background/40 border-muted/20 p-6 sm:p-8 max-w-md mx-auto shadow-premium">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

                  <div className="relative z-10">
                    <div className="p-4 sm:p-6 rounded-xl bg-black/20 text-muted mx-auto mb-6 w-fit">
                      <Scissors className="w-10 h-10 sm:w-12 sm:h-12 animate-float" />
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-text mb-3 title-shine">
                      {searchTerm ? "Sin resultados" : "No hay servicios en este período"}
                    </h3>

                    <p className="text-muted text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
                      {searchTerm
                        ? `No encontramos coincidencias para "${searchTerm}"`
                        : "Intenta cambiar el filtro para ver más resultados"}
                    </p>
                  </div>

                  <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full animate-neon-pulse opacity-60" />
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60" />
                  <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`transform transition-all duration-1000 delay-400 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              <div className="grid gap-3 sm:gap-4">
                {filteredServices.map((service, index) => (
                  <div
                    key={service._id}
                    className="tile-entrance relative overflow-hidden rounded-xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-background/40 border-muted/20 hover:shadow-premium-hover hover:scale-102 transition-all duration-300 group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative z-10 p-4 sm:p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                        {/* Fecha */}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm text-text">{formatDate(service.date)}</span>
                        </div>

                        {/* Paciente */}
                        <div>
                          <p className="text-sm font-medium text-text">{getPatientName(service.patientId)}</p>
                          <p className="text-xs text-muted">{getPatientSpecies(service.patientId)}</p>
                        </div>

                        {/* Servicio */}
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getServiceIcon(service.service)}</span>
                          <span className="text-sm font-medium text-text">{service.service}</span>
                        </div>

                        {/* Especificaciones */}
                        <div className="lg:col-span-2">
                          <p className="text-sm text-text truncate">{service.specifications}</p>
                          {service.observations && (
                            <p className="text-xs text-muted truncate">{service.observations}</p>
                          )}
                        </div>

                        {/* Pago y Costo */}
                        <div className="flex items-center justify-between lg:justify-end gap-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentBadgeColor(service.paymentType)}`}>
                            {service.paymentType}
                          </span>
                          <span className="text-sm font-semibold text-primary">
                            ${service.cost.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full animate-neon-pulse opacity-60" />
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60" />
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}