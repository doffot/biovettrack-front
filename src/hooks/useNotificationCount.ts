// src/hooks/useNotificationCount.ts
import { useMemo } from "react";
import { useDashboardData } from "./useDashboardData";

export function useNotificationCount() {
  const {
    todayAppointments,
    todayGrooming,
    pendingInvoices,
    upcomingVaccinations,
    upcomingDewormings,
    isFirstLoad,
  } = useDashboardData();

  const count = useMemo(() => {
    if (isFirstLoad) return 0;

    let total = 0;

    // Facturas pendientes (máximo 5)
    total += Math.min(pendingInvoices.length, 5);

    // Vacunas (vencidas + próximas)
    total += upcomingVaccinations.length;

    // Desparasitaciones (vencidas + próximas)
    total += upcomingDewormings.length;

    // Citas de hoy
    total += todayAppointments.length;

    // Peluquería de hoy
    total += todayGrooming.length;

    return total;
  }, [
    isFirstLoad,
    pendingInvoices.length,
    upcomingVaccinations.length,
    upcomingDewormings.length,
    todayAppointments.length,
    todayGrooming.length,
  ]);

  // Solo contar urgentes para el badge rojo
  const urgentCount = useMemo(() => {
    if (isFirstLoad) return 0;

    let total = 0;

    // Facturas pendientes
    total += Math.min(pendingInvoices.length, 5);

    // Vacunas vencidas
    total += upcomingVaccinations.filter((v) => v.daysLeft <= 0).length;

    // Desparasitaciones vencidas
    total += upcomingDewormings.filter((d) => d.daysLeft <= 0).length;

    return total;
  }, [isFirstLoad, pendingInvoices.length, upcomingVaccinations, upcomingDewormings]);

  return {
    total: count,
    urgent: urgentCount,
    isLoading: isFirstLoad,
  };
}