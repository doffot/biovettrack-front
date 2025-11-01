// src/views/home/DesktopHomeView.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPatients } from '../../api/patientAPI';
import { getAllGroomingServices } from '../../api/groomingAPI';
import FloatingParticles from '../../components/FloatingParticles';
import {
  PawPrint,
  Calendar,
  CalendarDays,
  CalendarCheck,
} from 'lucide-react';
import type { GroomingService } from '../../types';

// Card reutilizable con tus estilos
const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  bgColor: string;
}> = ({ title, value, icon, bgColor }) => (
  <div className="relative overflow-hidden rounded-2xl border-2 bg-gradient-radial-center backdrop-blur-sm border-muted/20 p-5 group hover:scale-[1.02] transition-all duration-300">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 group-hover:opacity-100" />
    <div className="relative z-10 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${bgColor}`}>{icon}</div>
      <div>
        <p className="text-muted text-sm font-medium">{title}</p>
        <p className="text-text text-2xl font-bold mt-1">{value}</p>
      </div>
    </div>
    <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full animate-neon-pulse opacity-60" />
  </div>
);

const DesktopHomeView: React.FC = () => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Domingo como inicio

  // Consultas
  const { data: patients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ['patients'],
    queryFn: getPatients,
  });

  const { data: groomingServices = [], isLoading: loadingGrooming } = useQuery({
    queryKey: ['groomingServices'],
    queryFn: getAllGroomingServices,
  });

  const isLoading = loadingPatients || loadingGrooming;

  // Helper: comparar solo día/mes/año
  const isSameDay = (d1: Date, d2: Date): boolean => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Contar servicios de grooming por período
  const countByPeriod = (period: 'day' | 'week' | 'month'): number => {
    return groomingServices.filter((service: GroomingService) => {
      // Usamos `service.date` (obligatorio) como fecha del servicio
      const serviceDate = new Date(service.date);

      if (period === 'day') {
        return isSameDay(serviceDate, now);
      }
      if (period === 'week') {
        return serviceDate >= startOfWeek && serviceDate <= now;
      }
      if (period === 'month') {
        return (
          serviceDate.getFullYear() === now.getFullYear() &&
          serviceDate.getMonth() === now.getMonth()
        );
      }
      return false;
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
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex top-20 relative min-h-screen pb-10">
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
      <FloatingParticles />

      <div className="relative z-10 pt-6 px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-text mb-2 title-shine">Panel de Resumen</h1>
        <p className="text-muted mb-8">Estadísticas de tu clínica veterinaria</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Mascotas"
            value={totalPets}
            icon={<PawPrint className="w-6 h-6 text-primary" />}
            bgColor="bg-primary/20"
          />
          <StatCard
            title="Peluquería Hoy"
            value={today}
            icon={<Calendar className="w-6 h-6 text-green-400" />}
            bgColor="bg-green-500/20"
          />
          <StatCard
            title="Esta Semana"
            value={thisWeek}
            icon={<CalendarDays className="w-6 h-6 text-blue-400" />}
            bgColor="bg-blue-500/20"
          />
          <StatCard
            title="Este Mes"
            value={thisMonth}
            icon={<CalendarCheck className="w-6 h-6 text-purple-400" />}
            bgColor="bg-purple-500/20"
          />
        </div>
      </div>
    </div>
  );
};

export default DesktopHomeView;