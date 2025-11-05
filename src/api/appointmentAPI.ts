// src/api/appointmentAPI.ts
import { AxiosError } from "axios";
import {
  appointmentSchema,
  type Appointment,
  type CreateAppointmentForm,
  type UpdateAppointmentStatusForm,
} from "../types";
import api from "../lib/axioa";

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

type GetAppointmentsListResponse = {
  appointments: Appointment[];
};

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
    const { data } = await api.get<GetAppointmentsListResponse>("/appointments");

    console.log("📦 Lista de citas:", data);

    const response = GetAppointmentsListResponseSchema.safeParse(data);
    if (!response.success) {
      console.error("❌ Fallo Zod al obtener lista de citas:", response.error.issues);
      throw new Error("Estructura de respuesta inválida del servidor");
    }

    return response.data.appointments;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al obtener las citas"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// =====================================
// 🧪 Esquema para validar la respuesta de lista completa
// =====================================
import { z } from "zod";

const GetAppointmentsListResponseSchema = z.object({
  appointments: z.array(appointmentSchema),
});