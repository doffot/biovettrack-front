// src/views/dashboard/utils/dashboardUtils.ts

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD (local)
 */
export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Extrae la parte de fecha (YYYY-MM-DD) de una fecha
 */
export const getDatePart = (date: Date | string): string => {
  if (typeof date === "string") {
    // Si ya es string ISO, extraer directamente
    if (date.includes("T")) {
      return date.split("T")[0];
    }
    return date;
  }
  // Si es Date, convertir a ISO y extraer
  return date.toISOString().split("T")[0];
};

/**
 * Compara si dos fechas son el mismo día (ignorando timezone)
 */
export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  return getDatePart(date1) === getDatePart(date2);
};

/**
 * Verifica si una fecha es hoy
 */
export const isToday = (date: Date | string): boolean => {
  return getDatePart(date) === getTodayDateString();
};

/**
 * Obtiene una fecha N días atrás en formato YYYY-MM-DD
 */
export const getDaysAgoString = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Obtiene una fecha N días en el futuro en formato YYYY-MM-DD
 */
export const getDaysFromNowString = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Calcula días restantes desde hoy hasta una fecha
 */
export const getDaysLeft = (targetDate: Date | string): number => {
  const today = getTodayDateString();
  const target = getDatePart(targetDate);
  
  const todayDate = new Date(today + "T00:00:00");
  const targetDateObj = new Date(target + "T00:00:00");
  
  return Math.ceil((targetDateObj.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Formatea hora de una fecha
 */
export const formatTime = (date: Date | string): string => {
  return new Date(date).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Formatea fecha larga
 */
export const formatLongDate = (date: Date): string => {
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Formatea día corto
 */
export const formatShortDay = (date: Date): string => {
  return date.toLocaleDateString("es-ES", { weekday: "short" });
};

/**
 * Formatea moneda
 */
export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};