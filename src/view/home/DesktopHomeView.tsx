// src/views/DesktopHomeView.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPatients } from '../../api/patientAPI';
import { getAllGroomingServices } from '../../api/groomingAPI';
import {
  PawPrint,
  Calendar,
  CalendarDays,
  CalendarCheck,
  Plus,
  Scissors,
  BarChart3
} from 'lucide-react';
import { 
  startOfWeek, 
  endOfDay, 
  isWithinInterval, 
  isSameDay, 
  isSameMonth 
} from 'date-fns';
import type { GroomingService } from '../../types';
import { useAuth } from '../../hooks/useAuth';
// import { Link } from 'react-router-dom';

// Componente de Card de Estadística Mejorado
const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}> = ({ title, value, icon, description, trend }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl bg-green-50 text-green-600`}>
        {icon}
      </div>
      {trend && (
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          trend.isPositive 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
        </div>
      )}
    </div>
    
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-900 font-semibold text-sm mb-2">{title}</p>
      <p className="text-gray-500 text-xs">{description}</p>
    </div>
  </div>
);

// Card de Acción Rápida
const QuickActionCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  variant?: 'primary' | 'secondary';
}> = ({ title, description, icon, action, variant = 'secondary' }) => (
  <button
    onClick={action}
    className={`w-full text-left rounded-2xl p-6 border transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] ${
      variant === 'primary'
        ? 'bg-green-600 border-green-600 text-white hover:bg-green-700'
        : 'bg-white border-gray-200 text-gray-900 hover:border-green-300'
    }`}
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${
        variant === 'primary' 
          ? 'bg-white/20 text-white' 
          : 'bg-green-50 text-green-600'
      }`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className={`font-semibold mb-1 ${
          variant === 'primary' ? 'text-white' : 'text-gray-900'
        }`}>
          {title}
        </h3>
        <p className={`text-sm ${
          variant === 'primary' ? 'text-green-100' : 'text-gray-500'
        }`}>
          {description}
        </p>
      </div>
    </div>
  </button>
);

const DesktopHomeView: React.FC = () => {
  const now = new Date();
  const { data: authData } = useAuth();

  const startOfWeekDate = startOfWeek(now, { weekStartsOn: 1 });
  const endOfToday = endOfDay(now);

  const { data: patients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ['patients'],
    queryFn: getPatients,
  });

  const { data: groomingServices = [], isLoading: loadingGrooming } = useQuery({
    queryKey: ['groomingServices'],
    queryFn: getAllGroomingServices,
  });

  const isLoading = loadingPatients || loadingGrooming;

  const countByPeriod = (period: 'day' | 'week' | 'month'): number => {
    return groomingServices.filter((service: GroomingService) => {
      const serviceDate = new Date(service.date);
      switch (period) {
        case 'day':
          return isSameDay(serviceDate, now);
        case 'week':
          return isWithinInterval(serviceDate, {
            start: startOfWeekDate,
            end: endOfToday
          });
        case 'month':
          return isSameMonth(serviceDate, now);
        default:
          return false;
      }
    }).length;
  };

  const totalPets = patients.length;
  const today = countByPeriod('day');
  const thisWeek = countByPeriod('week');
  const thisMonth = countByPeriod('month');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  const displayName = authData?.name && authData?.lastName
    ? `Dr. ${authData.name} ${authData.lastName}`
    : authData?.name ? `Dr. ${authData.name}` : 'Usuario';

  return (
    <div className="pt-8 pb-12 max-w-7xl mx-auto">
      {/* Header de Bienvenida */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              ¡Bienvenido, <span className="text-green-600">{displayName.split(' ')[1]}</span>!
            </h1>
            <p className="text-gray-600 text-lg">
              Panel de control de tu clínica veterinaria
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <QuickActionCard
            title="Nueva Cita"
            description="Agendar nueva consulta médica"
            icon={<Plus className="w-5 h-5" />}
            action={() => window.location.href = '/patients'}
            variant="primary"
          />
          <QuickActionCard
            title="Registrar Paciente"
            description="Agregar nueva mascota al sistema"
            icon={<PawPrint className="w-5 h-5" />}
            action={() => window.location.href = '/patients/new'}
            variant="secondary"
          />
          <QuickActionCard
            title="Ver Reportes"
            description="Estadísticas y reportes mensuales"
            icon={<BarChart3 className="w-5 h-5" />}
            action={() => window.location.href = '/reports'}
            variant="secondary"
          />
        </div>
      </div>

      {/* Panel de Resumen */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              📊 Panel de Resumen
            </h2>
            <p className="text-gray-600">Estadísticas actualizadas en tiempo real</p>
          </div>
          <div className="text-sm text-gray-500">
            Actualizado hace 5 min
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Mascotas"
            value={totalPets}
            icon={<PawPrint className="w-6 h-6" />}
            description="Pacientes registrados en el sistema"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Peluquería Hoy"
            value={today}
            icon={<Scissors className="w-6 h-6" />}
            description="Servicios de estética para hoy"
            trend={{ value: 5, isPositive: false }}
          />
          <StatCard
            title="Esta Semana"
            value={thisWeek}
            icon={<CalendarDays className="w-6 h-6" />}
            description="Citas programadas esta semana"
          />
          <StatCard
            title="Este Mes"
            value={thisMonth}
            icon={<CalendarCheck className="w-6 h-6" />}
            description="Total de servicios del mes"
            trend={{ value: 8, isPositive: true }}
          />
        </div>
      </section>

      {/* Sección de Actividad Reciente */}
      <section className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Actividad Reciente</h3>
          <button className="text-green-600 hover:text-green-700 font-medium text-sm">
            Ver todo →
          </button>
        </div>
        
        <div className="space-y-4">
          {groomingServices.slice(0, 3).map((service: GroomingService) => (
            <div key={service._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Scissors className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  {/* <p className="font-medium text-gray-900">{service.}</p> */}
                  <p className="text-sm text-gray-500">{service.service}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {new Date(service.date).toLocaleDateString('es-ES')}
                </p>
                {/* <p className="text-sm text-gray-500">{service.time}</p> */}
              </div>
            </div>
          ))}
        </div>

        {groomingServices.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay actividades recientes</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default DesktopHomeView;