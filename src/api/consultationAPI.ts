// src/api/consultationAPI.ts
import { AxiosError } from "axios";
import api from "../lib/axios";
import {
  consultationSchema,
  consultationsListSchema,
  type Consultation,
  type ConsultationFormData,
} from "../types/consultation";

// Crear consulta
export async function createConsultation(
  patientId: string,
  formData: ConsultationFormData
): Promise<Consultation> {
  try {
    const { data } = await api.post(`/consultations/${patientId}`, formData);

    const response = consultationSchema.safeParse(data.consultation);
    if (response.success) {
      return response.data;
    }

    console.error("❌ Error validación Zod:", response.error);
    throw new Error("Datos de consulta inválidos");
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al crear la consulta");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error de red o desconocido");
  }
}

export async function getAllConsultations(): Promise<Consultation[]> {
  try {
    const { data } = await api.get("/consultations");

    // Normalizar: extraer IDs si vienen como objetos poblados
    const normalizedConsultations = data.consultations.map((c: any) => ({
      ...c,
      patientId:
        typeof c.patientId === "object" ? c.patientId._id : c.patientId,
      veterinarianId:
        typeof c.veterinarianId === "object"
          ? c.veterinarianId._id
          : c.veterinarianId,
    }));

    const parsed = consultationsListSchema.safeParse(normalizedConsultations);

    if (!parsed.success) {
      throw new Error("Datos de consultas inválidos");
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener consultas");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error de red o desconocido");
  }
}
// Obtener consultas por paciente
export async function getConsultationsByPatient(
  patientId: string
): Promise<Consultation[]> {
  try {
    const { data } = await api.get(`/consultations/patient/${patientId}`);

    const response = consultationsListSchema.safeParse(data.consultations);
    if (response.success) {
      return response.data;
    }

    console.error("❌ Error validación Zod:", response.error);
    throw new Error("Datos de consultas inválidos");
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener consultas");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error de red o desconocido");
  }
}

// Obtener consulta por ID
export async function getConsultationById(id: string): Promise<Consultation> {
  try {
    const { data } = await api.get(`/consultations/${id}`);

    const response = consultationSchema.safeParse(data.consultation);
    if (response.success) {
      return response.data;
    }

    throw new Error("Datos de consulta inválidos");
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener consulta");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error de red o desconocido");
  }
}

// Actualizar consulta
export async function updateConsultation(
  id: string,
  formData: Partial<ConsultationFormData>
): Promise<Consultation> {
  try {
    const { data } = await api.put(`/consultations/${id}`, formData);

    const response = consultationSchema.safeParse(data.consultation);
    if (response.success) {
      return response.data;
    }

    console.error("❌ Error validación Zod:", response.error);
    throw new Error("Datos de consulta inválidos");
  } catch (error) {
    console.error("❌ Error completo:", error);

    if (error instanceof AxiosError && error.response) {
      console.error("❌ Error servidor:", error.response.data);
      throw new Error(
        error.response.data.msg || "Error al actualizar consulta"
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error de red o desconocido");
  }
}

// Eliminar consulta
export async function deleteConsultation(id: string): Promise<void> {
  try {
    await api.delete(`/consultations/${id}`);
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al eliminar consulta");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error de red o desconocido");
  }
}
