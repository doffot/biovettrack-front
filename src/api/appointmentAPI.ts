// src/api/appointmentAPI.ts
import { AxiosError } from "axios";
import {
  appointmentSchema,
  type Appointment,
  type AppointmentWithPatient,
  type CreateAppointmentForm,
  type UpdateAppointmentStatusForm,
} from "../types";
import api from "../lib/axioa";
import { z } from "zod";

// =====================================
// 📦 TIPOS DE RESPUESTA DEL BACKEND
// =====================================

type CreateAppointmentResponse = {
  msg: string;
  appointment: Appointment;
};

type UpdateAppointmentStatusResponse = {
  msg: string;
  appointment: Appointment;
};

type GetAppointmentResponse = {
  appointment: Appointment;
};

// 🔥 ACTUALIZADO: Backend envía { success, appointments }
type GetAppointmentsListResponse = {
  success: boolean;
  appointments: Appointment[];
};

// =====================================
// 🧪 Esquema para validar la respuesta de lista completa
// =====================================
const GetAppointmentsListResponseSchema = z.object({
  success: z.boolean().optional(), // Hacerlo opcional por retrocompatibilidad
  appointments: z.array(appointmentSchema),
});

// =====================================
// ✅ OBTENER CITAS POR PACIENTE
// =====================================
export async function getAppointmentsByPatient(
  patientId: string
): Promise<Appointment[]> {
  try {
    const { data } = await api.get<Appointment[]>(
      `/patients/${patientId}/appointments`
    );

    console.log("📦 Citas del paciente:", data);

    const response = z.array(appointmentSchema).safeParse(data);
    if (!response.success) {
      console.error("❌ Fallo Zod al obtener citas del paciente:", response.error.issues);
      throw new Error("Estructura de respuesta inválida del servidor");
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al obtener las citas del paciente"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// =====================================
// ✅ OBTENER CITAS ACTIVAS POR PACIENTE
// =====================================
export async function getActiveAppointmentsByPatient(
  patientId: string
): Promise<Appointment[]> {
  try {
    const appointments = await getAppointmentsByPatient(patientId);
    
    const activeAppointments = appointments
      .filter(apt => apt.status === 'Programada')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log("📦 Citas activas del paciente:", activeAppointments);
    
    return activeAppointments;
  } catch (error) {
    console.error("❌ Error al obtener citas activas:", error);
    throw error;
  }
}

// =====================================
// ✅ CREAR CITA
// =====================================
export async function createAppointment(
  formData: CreateAppointmentForm,
  patientId: string
): Promise<Appointment> {
  try {
    const { data } = await api.post<CreateAppointmentResponse>(
      `/patients/${patientId}/appointments`,
      formData
    );

    console.log("📦 Respuesta cruda (crear cita):", data);

    const response = appointmentSchema.safeParse(data.appointment);
    if (!response.success) {
      console.error("❌ Fallo Zod al crear cita:", response.error.issues);
      throw new Error("Datos de la cita inválidos");
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al crear la cita"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// =====================================
// ✅ ACTUALIZAR ESTADO DE CITA
// =====================================
export async function updateAppointmentStatus(
  appointmentId: string,
  formData: UpdateAppointmentStatusForm
): Promise<Appointment> {
  try {
    const { data } = await api.patch<UpdateAppointmentStatusResponse>(
      `/appointments/${appointmentId}/status`,
      formData
    );

    console.log("📦 Respuesta cruda (actualizar estado):", data);

    const response = appointmentSchema.safeParse(data.appointment);
    if (!response.success) {
      console.error("❌ Fallo Zod al actualizar estado:", response.error.issues);
      throw new Error("Datos de la cita actualizados inválidos");
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al actualizar el estado de la cita"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// =====================================
// ✅ OBTENER CITA POR ID
// =====================================
export async function getAppointmentById(
  id: Appointment["_id"]
): Promise<Appointment> {
  try {
    const { data } = await api.get<GetAppointmentResponse>(`/appointments/${id}`);

    console.log("📦 Cita individual:", data);

    const response = appointmentSchema.safeParse(data.appointment);
    if (!response.success) {
      console.error("❌ Fallo Zod al obtener cita:", response.error.issues);
      throw new Error("Datos de la cita inválidos");
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al obtener la cita"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// =====================================
// ✅ OBTENER TODAS LAS CITAS DEL VETERINARIO
// =====================================
export async function getAllAppointments(): Promise<Appointment[]> {
  try {
    const { data } = await api.get("/appointments");
    console.log("📦 Respuesta del backend:", data);
    return data.appointments || [];
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

// =====================================
// ✅ OBTENER TODAS LAS CITAS ACTIVAS (CON PACIENTE POBLADO)
// =====================================
// ✅ OBTENER TODAS LAS CITAS ACTIVAS (VERSIÓN CORREGIDA)
export async function getActiveAppointments(): Promise<AppointmentWithPatient[]> {
  try {
    const { data } = await api.get<GetAppointmentsListResponse>("/appointments");

    console.log("📦 TODAS las citas recibidas:", data);

    const response = GetAppointmentsListResponseSchema.safeParse(data);
    if (!response.success) {
      console.error("❌ Fallo Zod:", response.error.issues);
      throw new Error("Estructura de respuesta inválida del servidor");
    }

    // 🔥 QUITA LA VERIFICACIÓN DE PATIENT POBLADO - solo filtra por estado
    const activeAppointments = response.data.appointments
      .filter(apt => apt.status === 'Programada') // ✅ Solo por estado
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) as AppointmentWithPatient[];

    console.log("✅ Citas activas después de filtrar:", activeAppointments);
    
    return activeAppointments;
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}