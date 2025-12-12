// src/views/dashboard/hooks/useDashboardData.ts
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";


import {
  QUERY_CONFIG,
  QUERY_CONFIG_EXTENDED,
  EMPTY_CURRENCY,
  type CurrencyAmounts,
} from "../constants/dashboardConstants";
import {
  getTodayDateString,
  getDatePart,
  getDaysAgoString,
  getDaysFromNowString,
  getDaysLeft,
  formatShortDay,
} from "../utils/dashboardUtils";
import type { Vaccination } from "../types/vaccination";
import type { Deworming } from "../types/deworming";
import type { Invoice } from "../types/invoice";
import type { Appointment } from "../types/appointment";
import { getAllAppointments } from "../api/appointmentAPI";
import type { GroomingService, Owner, Patient } from "../types";
import { getAllGroomingServices } from "../api/groomingAPI";
import type { Consultation } from "../types/consultation";
import { getAllConsultations } from "../api/consultationAPI";
import { getAllVaccinations } from "../api/vaccinationAPI";
import { getAllDewormings } from "../api/dewormingAPI";
import { getInvoices } from "../api/invoiceAPI";
import { getPatients } from "../api/patientAPI";
import { getOwners } from "../api/OwnerAPI";


export interface VaccinationWithDaysLeft extends Vaccination {
  daysLeft: number;
}

export interface DewormingWithDaysLeft extends Deworming {
  daysLeft: number;
}

export interface ChartDataItem {
  name: string;
  value: number;
}

export interface RevenueChartItem {
  day: string;
  USD: number;
  Bs: number;
}

// Re-exportar para uso en componentes
export type { CurrencyAmounts };

/**
 * Calcula ingresos por moneda de un array de facturas
 */
function calculateRevenue(invoices: Invoice[]): CurrencyAmounts {
  return invoices.reduce(
    (acc, inv) => ({
      USD: acc.USD + (inv.amountPaidUSD || 0),
      Bs: acc.Bs + (inv.amountPaidBs || 0),
    }),
    { ...EMPTY_CURRENCY }
  );
}

/**
 * Calcula deuda pendiente por moneda
 */
function calculatePendingDebt(invoices: Invoice[]): CurrencyAmounts {
  return invoices
    .filter((inv) => inv.paymentStatus === "Pendiente" || inv.paymentStatus === "Parcial")
    .reduce(
      (acc, inv) => {
        const remainingTotal = inv.total - (inv.amountPaid || 0);

        if (inv.currency === "USD") {
          return {
            USD: acc.USD + remainingTotal,
            Bs: acc.Bs,
          };
        } else {
          return {
            USD: acc.USD,
            Bs: acc.Bs + remainingTotal,
          };
        }
      },
      { ...EMPTY_CURRENCY }
    );
}

export function useDashboardData() {
  // ========== QUERIES ==========
  const appointmentsQuery = useQuery<Appointment[]>({
    queryKey: ["dashboard", "appointments"],
    queryFn: getAllAppointments,
    ...QUERY_CONFIG,
  });

  const groomingQuery = useQuery<GroomingService[]>({
    queryKey: ["dashboard", "grooming"],
    queryFn: getAllGroomingServices,
    ...QUERY_CONFIG,
  });

  const consultationsQuery = useQuery<Consultation[]>({
    queryKey: ["dashboard", "consultations"],
    queryFn: getAllConsultations,
    ...QUERY_CONFIG,
  });

  const vaccinationsQuery = useQuery<Vaccination[]>({
    queryKey: ["dashboard", "vaccinations"],
    queryFn: getAllVaccinations,
    ...QUERY_CONFIG,
  });

  const dewormingsQuery = useQuery<Deworming[]>({
    queryKey: ["dashboard", "dewormings"],
    queryFn: getAllDewormings,
    ...QUERY_CONFIG,
  });

  const invoicesQuery = useQuery({
    queryKey: ["dashboard", "invoices"],
    queryFn: () => getInvoices({}),
    ...QUERY_CONFIG,
  });

  const patientsQuery = useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: getPatients,
    ...QUERY_CONFIG_EXTENDED,
  });

  const ownersQuery = useQuery<Owner[]>({
    queryKey: ["owners"],
    queryFn: getOwners,
    ...QUERY_CONFIG_EXTENDED,
  });

  // Extraer datos
  const appointments = appointmentsQuery.data ?? [];
  const groomingServices = groomingQuery.data ?? [];
  const consultations = consultationsQuery.data ?? [];
  const vaccinations = vaccinationsQuery.data ?? [];
  const dewormings = dewormingsQuery.data ?? [];
  const invoices = (invoicesQuery.data?.invoices ?? []) as Invoice[];
  const patients = patientsQuery.data ?? [];
  const owners = ownersQuery.data ?? [];

  // Loading states
  const isFirstLoad =
    appointmentsQuery.isLoading &&
    groomingQuery.isLoading &&
    consultationsQuery.isLoading &&
    vaccinationsQuery.isLoading &&
    dewormingsQuery.isLoading &&
    invoicesQuery.isLoading &&
    patientsQuery.isLoading &&
    ownersQuery.isLoading;

  // Fecha de hoy en formato YYYY-MM-DD
  const todayStr = useMemo(() => getTodayDateString(), []);

  // ========== MÉTRICAS DE HOY ==========
  const todayAppointments = useMemo(
    () =>
      appointments.filter(
        (apt) => getDatePart(apt.date) === todayStr && apt.status === "Programada"
      ),
    [appointments, todayStr]
  );

  const todayGrooming = useMemo(
    () =>
      groomingServices.filter(
        (svc) =>
          getDatePart(svc.date) === todayStr &&
          (svc.status === "Programado" || svc.status === "En progreso")
      ),
    [groomingServices, todayStr]
  );

  const todayConsultations = useMemo(
    () => consultations.filter((c) => getDatePart(c.consultationDate) === todayStr),
    [consultations, todayStr]
  );

  // ========== INGRESOS (Multi-moneda) ==========
  const todayInvoices = useMemo(
    () => invoices.filter((inv) => getDatePart(inv.date) === todayStr),
    [invoices, todayStr]
  );

  const todayRevenue = useMemo(() => calculateRevenue(todayInvoices), [todayInvoices]);

  const weekInvoices = useMemo(() => {
    const weekAgo = getDaysAgoString(7);
    return invoices.filter((inv) => getDatePart(inv.date) >= weekAgo);
  }, [invoices]);

  const weekRevenue = useMemo(() => calculateRevenue(weekInvoices), [weekInvoices]);

  const monthInvoices = useMemo(() => {
    const monthAgo = getDaysAgoString(30);
    return invoices.filter((inv) => getDatePart(inv.date) >= monthAgo);
  }, [invoices]);

  const monthRevenue = useMemo(() => calculateRevenue(monthInvoices), [monthInvoices]);

  // ========== DEUDAS (Multi-moneda) ==========
  const pendingDebt = useMemo(() => calculatePendingDebt(invoices), [invoices]);

  const pendingInvoicesCount = useMemo(
    () =>
      invoices.filter(
        (inv) => inv.paymentStatus === "Pendiente" || inv.paymentStatus === "Parcial"
      ).length,
    [invoices]
  );

  // ========== ALERTAS (próximos 7 días) ==========
  const upcomingVaccinations = useMemo((): VaccinationWithDaysLeft[] => {
    const nextWeek = getDaysFromNowString(7);

    return vaccinations
      .filter((v) => {
        if (!v.nextVaccinationDate) return false;
        const nextDate = getDatePart(v.nextVaccinationDate);
        return nextDate >= todayStr && nextDate <= nextWeek;
      })
      .map((v) => ({
        ...v,
        daysLeft: getDaysLeft(v.nextVaccinationDate!),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [vaccinations, todayStr]);

  const upcomingDewormings = useMemo((): DewormingWithDaysLeft[] => {
    const nextWeek = getDaysFromNowString(7);

    return dewormings
      .filter((d) => {
        if (!d.nextApplicationDate) return false;
        const nextDate = getDatePart(d.nextApplicationDate);
        return nextDate >= todayStr && nextDate <= nextWeek;
      })
      .map((d) => ({
        ...d,
        daysLeft: getDaysLeft(d.nextApplicationDate!),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [dewormings, todayStr]);

  // ========== DATOS PARA GRÁFICOS ==========
  const revenueChartData = useMemo((): RevenueChartItem[] => {
    const data: RevenueChartItem[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      const dayInvoices = invoices.filter((inv) => getDatePart(inv.date) === dateStr);
      const dayRevenue = calculateRevenue(dayInvoices);

      data.push({
        day: formatShortDay(date),
        USD: dayRevenue.USD,
        Bs: dayRevenue.Bs,
      });
    }
    return data;
  }, [invoices]);

  const servicesChartData = useMemo(() => {
    return [
      { name: "Consultas", value: consultations.length },
      { name: "Peluquería", value: groomingServices.length },
      { name: "Vacunas", value: vaccinations.length },
      { name: "Desparasitación", value: dewormings.length },
      { name: "Citas", value: appointments.length },
    ]
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [consultations, groomingServices, vaccinations, dewormings, appointments]);

  const speciesChartData = useMemo(() => {
    const speciesCount: Record<string, number> = {};
    patients.forEach((p) => {
      const species = p.species || "Otro";
      speciesCount[species] = (speciesCount[species] || 0) + 1;
    });

    return Object.entries(speciesCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [patients]);

  return {
    // Loading
    isFirstLoad,

    // Datos crudos
    patients,
    owners,

    // Métricas de hoy
    todayAppointments,
    todayGrooming,
    todayConsultations,
    todayRevenue,

    // Ingresos
    weekRevenue,
    monthRevenue,

    // Deudas
    pendingDebt,
    pendingInvoicesCount,

    // Alertas
    upcomingVaccinations,
    upcomingDewormings,

    // Datos de gráficos
    revenueChartData,
    servicesChartData,
    speciesChartData,
  };
}