// src/views/grooming/GroomingReportView.tsx
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Scissors, DollarSign, CheckCircle, TrendingUp, ArrowLeft } from 'lucide-react';
import { getAllGroomingServices } from '../../api/groomingAPI';
import { extractId } from '../../utils/extractId';

// Tarjeta de métrica reutilizable
const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = "text-vet-primary", 
  bgColor = "bg-vet-light/30" 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: React.ElementType; 
  color?: string; 
  bgColor?: string; 
}) => (
  <div className={`${bgColor} rounded-xl p-4 border border-gray-200`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-vet-muted uppercase tracking-wide">{title}</p>
        <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
        {subtitle && <p className="text-xs text-vet-muted mt-1">{subtitle}</p>}
      </div>
      <div className={`p-2 ${color.replace('text-', 'bg-')} bg-opacity-10 rounded-lg`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit'
  });
};

export default function GroomingReportView() {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['groomingServices'],
    queryFn: getAllGroomingServices,
  });

  // Obtener fechas para filtros
  const getFilterDates = () => {
    const now = new Date();
    let startDate: Date, endDate: Date;

    if (dateRange === 'today') {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
    } else if (dateRange === 'week') {
      // Lunes de esta semana
      const day = now.getDay() || 7;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - day + 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (dateRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Personalizado
      startDate = customFrom ? new Date(customFrom) : new Date(now);
      endDate = customTo ? new Date(customTo) : new Date(now);
      if (customFrom) startDate.setHours(0, 0, 0, 0);
      if (customTo) endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  };

  const filteredServices = useMemo(() => {
    if (!services || services.length === 0) return [];

    const { startDate, endDate } = getFilterDates();

    return services.filter(service => {
      const serviceDate = new Date(service.date);
      return serviceDate >= startDate && serviceDate <= endDate;
    });
  }, [services, dateRange, customFrom, customTo]);

  // Estadísticas reales (sin paymentMethod ni amountPaid)
  const stats = useMemo(() => {
    const totalServices = filteredServices.length;

    // Servicio más frecuente
    const serviceCount: Record<string, number> = {};
    filteredServices.forEach(s => {
      serviceCount[s.service] = (serviceCount[s.service] || 0) + 1;
    });
    const mostFrequentService = Object.entries(serviceCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    return { totalServices, mostFrequentService };
  }, [filteredServices]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vet-gradient px-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-vet-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-vet-text font-medium">Cargando reporte de peluquería...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vet-gradient px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-lg hover:bg-vet-light text-vet-primary transition-colors"
            title="Volver a servicios"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-vet-text">Reporte de Peluquería</h1>
            <p className="text-vet-muted text-sm">Estadísticas y servicios filtrados por período</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-vet-text mb-1">Período</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vet-primary focus:border-vet-primary"
            >
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-vet-text mb-1">Desde</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-vet-text mb-1">Hasta</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <MetricCard 
          title="Total Servicios" 
          value={stats.totalServices} 
          icon={Scissors} 
          color="text-vet-primary" 
        />
        <MetricCard 
          title="Servicio Más Frecuente" 
          value={stats.mostFrequentService} 
          icon={TrendingUp} 
          color="text-purple-600" 
          bgColor="bg-purple-50" 
        />
        <MetricCard 
          title="Ingresos Totales" 
          value={filteredServices.reduce((sum, s) => sum + s.cost, 0).toFixed(2)} 
          icon={DollarSign} 
          color="text-orange-600" 
          bgColor="bg-orange-50" 
        />
        <MetricCard 
          title="Promedio por Servicio" 
          value={stats.totalServices > 0 ? (filteredServices.reduce((sum, s) => sum + s.cost, 0) / stats.totalServices).toFixed(2) : "0.00"} 
          icon={CheckCircle} 
          color="text-green-600" 
          bgColor="bg-green-50" 
        />
      </div>

      {/* Lista de Servicios */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-vet-text">
            Servicios ({filteredServices.length})
          </h2>
        </div>

        {filteredServices.length === 0 ? (
          <p className="text-vet-muted text-center py-8">No se encontraron servicios en este período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-vet-text">Mascota</th>
                  <th className="text-left p-3 text-sm font-semibold text-vet-text">Servicio</th>
                  <th className="text-left p-3 text-sm font-semibold text-vet-text">Fecha</th>
                  <th className="text-right p-3 text-sm font-semibold text-vet-text">Costo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredServices.map((service) => {
                  const patientName = typeof service.patientId === 'string'
                    ? "Mascota"
                    : service.patientId?.name || "Mascota";
                  const patientId = extractId(service.patientId);

                  return (
                    <tr key={service._id} className="hover:bg-vet-light/20">
                      <td className="p-3">
                        <Link 
                          to={`/patients/${patientId}/grooming-services/${service._id}`}
                          className="font-medium text-vet-primary hover:underline"
                        >
                          {patientName}
                        </Link>
                      </td>
                      <td className="p-3 text-sm">{service.service}</td>
                      <td className="p-3 text-sm">
                        {formatDate(service.date)} • {formatTime(service.date)}
                      </td>
                      <td className="p-3 text-right font-medium">
                        ${service.cost.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}