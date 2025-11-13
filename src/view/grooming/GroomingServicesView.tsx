import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Scissors, AlertCircle, Plus, Search, ArrowLeft } from 'lucide-react';
import { getAllGroomingServices } from '../../api/groomingAPI';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import ServiceStatsCards from '../../components/grooming/ServiceStatsCards';
import ServiceMobileCards from '../../components/grooming/ServiceMobileCards';
import ServiceTable from '../../components/grooming/ServiceTable';

export default function GroomingServicesView() {
  const [searchTerm, setSearchTerm] = useState('');
 

  // ✅ Helpers seguros: manejan string y objeto
  const getPatientName = (patientId: any) => {
    if (!patientId) return '—';
    if (typeof patientId === 'string') return 'Mascota';
    return patientId.name || 'Mascota';
  };

  const getPatientSpecies = (patientId: any) => {
    if (!patientId || typeof patientId === 'string') return '';
    return patientId.species || '';
  };

  const getPatientBreed = (patientId: any) => {
    if (!patientId || typeof patientId === 'string') return '';
    return patientId.breed || '';
  };

  const getServiceIcon = (serviceType: string) => {
    const icons: Record<string, string> = {
      'Corte': '✂️',
      'Baño': '🛁',
      'Corte y Baño': '✨'
    };
    return icons[serviceType] || '🐾';
  };

  const getServiceStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'Programado': 'bg-blue-100 text-blue-700 border border-blue-200',
      'En progreso': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      'Completado': 'bg-green-100 text-green-700 border border-green-200',
      'Cancelado': 'bg-red-100 text-red-700 border border-red-200'
    };
    return styles[status] || 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'Pendiente': 'bg-orange-100 text-orange-700 border border-orange-200',
      'Pagado': 'bg-green-100 text-green-700 border border-green-200',
      'Parcial': 'bg-blue-100 text-blue-700 border border-blue-200',
      'Cancelado': 'bg-red-100 text-red-700 border border-red-200'
    };
    return styles[status] || 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'Pagado': return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'Pendiente': return <Clock className="w-3 h-3 text-orange-600" />;
      case 'Parcial': return <AlertTriangle className="w-3 h-3 text-blue-600" />;
      case 'Cancelado': return <XCircle className="w-3 h-3 text-red-600" />;
      default: return <Clock className="w-3 h-3 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).format(date);
  };

  // ✅ Query: usa tu API existente
  const {  data:services = [], isLoading, isError, error } = useQuery({
    queryKey: ['groomingServices'],
    queryFn: getAllGroomingServices,
    retry: 2,
  });

  // ✅ Filtro seguro: hoy + búsqueda
  const filteredServices = useMemo(() => {
    if (!Array.isArray(services)) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysServices = services.filter(service => {
      if (!service.date) return false;
      const serviceDate = new Date(service.date);
      serviceDate.setHours(0, 0, 0, 0);
      return serviceDate.getTime() === today.getTime();
    });

    if (!searchTerm) return todaysServices;

    return todaysServices.filter(service => {
      const searchLower = searchTerm.toLowerCase();
      const patientName = getPatientName(service.patientId).toLowerCase();
      const serviceName = (service.service || '').toLowerCase();
      const specs = (service.specifications || '').toLowerCase();
      return patientName.includes(searchLower) || serviceName.includes(searchLower) || specs.includes(searchLower);
    });
  }, [services, searchTerm]);

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState error={error} />;

  return (
    <>
      <Header 
        totalsCount={filteredServices.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      <div className="h-32 lg:h-28"></div>

      <Link to="/patients" className="sm:hidden fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-vet-primary hover:bg-vet-secondary text-white shadow-lg hover:shadow-xl active:scale-95 transition-all">
        <Plus className="w-5 h-5" />
      </Link>

      <div className="px-4 mt-10 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
        <ServiceStatsCards filteredServices={filteredServices} />

        {filteredServices.length === 0 ? (
          <EmptyState searchTerm={searchTerm} />
        ) : (
          <>
            <ServiceMobileCards
              filteredServices={filteredServices}
              getPatientName={getPatientName}
              getPatientSpecies={getPatientSpecies}
              getPatientBreed={getPatientBreed}
              formatDate={formatDate}
              getServiceIcon={getServiceIcon}
              getServiceStatusBadge={getServiceStatusBadge}
              getPaymentStatusBadge={getPaymentStatusBadge}
              getPaymentStatusIcon={getPaymentStatusIcon}
            />
            
            <ServiceTable
              filteredServices={filteredServices}
              getPatientName={getPatientName}
              getPatientSpecies={getPatientSpecies}
              getPatientBreed={getPatientBreed}
              formatDate={formatDate}
              getServiceIcon={getServiceIcon}
              getServiceStatusBadge={getServiceStatusBadge}
              getPaymentStatusBadge={getPaymentStatusBadge}
              getPaymentStatusIcon={getPaymentStatusIcon}
            />
          </>
        )}
      </div>
    </>
  );
}

// Componentes auxiliares (sin cambios)
function LoadingState() {
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

function ErrorState({ error }: { error: any }) {
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

function EmptyState({ searchTerm }: { searchTerm: string }) {
  return (
    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
      <Scissors className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        {searchTerm ? "No hay resultados" : "No hay servicios hoy"}
      </h3>
      <p className="text-gray-600 mb-6">
        {searchTerm ? "Intenta con otros términos de búsqueda" : "No se encontraron servicios programados para hoy"}
      </p>
      {!searchTerm && (
        <Link to="/patients" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold transition-all">
          <Plus className="w-5 h-5" />
          Crear Primer Servicio
        </Link>
      )}
    </div>
  );
}

function Header({ totalsCount, searchTerm, setSearchTerm }: any) {
  return (
    <div className="fixed top-15 left-0 right-0 lg:left-64 z-30 bg-white border-b border-gray-100 shadow-sm">
      <div className="px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-6 mb-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Link to="/" className="flex items-center justify-center w-9 h-9 rounded-lg bg-vet-light hover:bg-vet-primary/10 text-vet-primary transition-colors flex-shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-vet-primary/10 rounded-lg">
                  <Scissors className="w-5 h-5 text-vet-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Servicios de Peluquería</h1>
                  <p className="text-sm text-gray-500">
                    {totalsCount} servicios hoy
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden sm:block flex-shrink-0">
            <Link to="/patients" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-vet-primary hover:bg-vet-secondary text-white font-medium text-sm transition-all shadow-sm hover:shadow-md">
              <Plus className="w-4 h-4" />
              <span>Nuevo Servicio</span>
            </Link>
          </div>
        </div>

        <div className="max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vet-primary/50 focus:border-vet-primary transition-colors text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}