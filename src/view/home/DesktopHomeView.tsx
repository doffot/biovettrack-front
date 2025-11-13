// src/views/DesktopHomeView.tsx
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { getAllAppointments } from '../../api/appointmentAPI';
import { getAllGroomingServices } from '../../api/groomingAPI';
import { formatCurrency, getPaymentMethodInfo } from '../../utils/currencyUtils';
import { Calendar, CheckCircle, Scissors } from 'lucide-react';

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

const DesktopHomeView: React.FC = () => {
  const { data: authData } = useAuth();

  // 📅 Citas médicas
  const {  data:allAppointments = [], isLoading: loadingAppointments } = useQuery({
    queryKey: ['allAppointments'],
    queryFn: getAllAppointments,
  });

  // ✂️ Servicios de peluquería
  const {  data:groomingServices = [], isLoading: loadingGrooming } = useQuery({
    queryKey: ['groomingServices'],
    queryFn: getAllGroomingServices,
  });

  const isLoading = loadingAppointments || loadingGrooming;

  // ========= FILTROS =========
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Citas de hoy
  const todayAppointments = useMemo(() => 
    allAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate.getTime() === today.getTime() && apt.status === 'Programada';
    }), [allAppointments]
  );

  // Servicios de peluquería de hoy
  const todayGrooming = useMemo(() => 
    groomingServices.filter(service => {
      const serviceDate = new Date(service.date);
      serviceDate.setHours(0, 0, 0, 0);
      return serviceDate.getTime() === today.getTime() && service.status !== 'Cancelado';
    }), [groomingServices]
  );

  // ========= ESTADÍSTICAS REALES =========
  // Citas
  const totalAppointments = allAppointments.length;
  const completedAppointments = allAppointments.filter(a => a.status === 'Completada').length;
  const appointmentCompletionRate = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0;

  // Peluquería
  const totalGrooming = groomingServices.length;
  const completedGrooming = groomingServices.filter(s => s.status === 'Completado').length;
  const groomingCompletionRate = totalGrooming > 0 ? Math.round((completedGrooming / totalGrooming) * 100) : 0;

  // Ingresos (últimos 30 días)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentAppointments = allAppointments.filter(a => new Date(a.date) >= thirtyDaysAgo);
  const recentGrooming = groomingServices.filter(s => new Date(s.date) >= thirtyDaysAgo);

  // Agrupar ingresos por moneda
  const revenueByCurrency: Record<string, number> = {};
  [...recentAppointments, ...recentGrooming].forEach(item => {
    const currency = getPaymentMethodInfo((item as any).paymentMethod)?.currency || 'USD';
    const cost = (item as any).cost || 0;
    revenueByCurrency[currency] = (revenueByCurrency[currency] || 0) + cost;
  });

  const displayName = authData?.name && authData?.lastName
    ? `Dr. ${authData.name} ${authData.lastName}`
    : authData?.name ? `Dr. ${authData.name}` : 'Usuario';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vet-gradient">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-vet-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-vet-text font-medium">Cargando panel de control...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-vet-text">
              ¡Bienvenido, <span className="text-vet-primary">{displayName.split(' ')[1] || displayName}</span>!
            </h1>
            <p className="text-vet-muted mt-1">Panel de control de tu clínica veterinaria</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
            <span className="text-sm text-vet-muted">
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <MetricCard 
          title="Citas Hoy" 
          value={todayAppointments.length} 
          icon={Calendar} 
          color="text-blue-600" 
          bgColor="bg-blue-50" 
        />
        <MetricCard 
          title="Peluquería Hoy" 
          value={todayGrooming.length} 
          icon={Scissors} 
          color="text-green-600" 
          bgColor="bg-green-50" 
        />
        <MetricCard 
          title="Citas Completadas" 
          value={`${appointmentCompletionRate}%`} 
          subtitle={`${completedAppointments} de ${totalAppointments}`}
          icon={CheckCircle} 
          color="text-green-600" 
          bgColor="bg-green-50" 
        />
        <MetricCard 
          title="Servicios Completados" 
          value={`${groomingCompletionRate}%`} 
          subtitle={`${completedGrooming} de ${totalGrooming}`}
          icon={Scissors} 
          color="text-purple-600" 
          bgColor="bg-purple-50" 
        />
      </div>

      {/* Ingresos por moneda */}
      {Object.keys(revenueByCurrency).length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-vet-text mb-4">Ingresos (Últimos 30 días)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(revenueByCurrency).map(([currency, total]) => (
              <div key={currency} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-vet-muted mb-1">
                  {currency === 'VES' || currency === 'Bs' ? 'Bolívares' : currency}
                </p>
                <p className="text-2xl font-bold text-vet-primary">
                  {formatCurrency(total, currency)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Citas y Peluquería de Hoy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Citas Médicas */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-vet-text">Citas Médicas de Hoy</h2>
            <span className="text-sm text-vet-muted">{todayAppointments.length} citas</span>
          </div>
          {todayAppointments.length === 0 ? (
            <p className="text-vet-muted text-sm">No hay citas programadas para hoy.</p>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map(apt => {
                const patientName = typeof apt.patient === 'string' 
                  ? "Mascota" 
                  : apt.patient?.name || "Mascota";
                return (
                  <div key={apt._id} className="flex items-center justify-between p-3 bg-vet-light/20 rounded-lg">
                    <div>
                      <p className="font-medium text-vet-text text-sm">{patientName}</p>
                      <p className="text-xs text-vet-muted">{apt.reason || "Sin motivo"}</p>
                    </div>
                    <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {new Date(apt.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Servicios de Peluquería */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-vet-text">Peluquería de Hoy</h2>
            <span className="text-sm text-vet-muted">{todayGrooming.length} servicios</span>
          </div>
          {todayGrooming.length === 0 ? (
            <p className="text-vet-muted text-sm">No hay servicios de peluquería programados para hoy.</p>
          ) : (
            <div className="space-y-3">
              {todayGrooming.map(service => {
                const patientName = typeof service.patientId === 'string'
                  ? "Mascota"
                  : service.patientId?.name || "Mascota";
                const paymentInfo = getPaymentMethodInfo(service.paymentMethod);
                return (
                  <div key={service._id} className="flex items-center justify-between p-3 bg-vet-light/20 rounded-lg">
                    <div>
                      <p className="font-medium text-vet-text text-sm">{patientName} - {service.service}</p>
                      <p className="text-xs text-vet-muted">{service.specifications}</p>
                    </div>
                    <span className="text-xs font-medium text-vet-text">
                      {formatCurrency(service.cost, paymentInfo.currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesktopHomeView;