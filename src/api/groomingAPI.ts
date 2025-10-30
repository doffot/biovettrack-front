// src/api/groomingAPI.ts
import { AxiosError } from "axios";
import {
  groomingServiceSchema,
  groomingServicesListResponseSchema,
  groomingServicesListSchema,
  type GroomingService,
  type GroomingServiceFormData,
} from "../types";
import api from "../lib/axioa";

// =====================================
// 📦 TIPOS DE RESPUESTA DEL BACKEND
// =====================================

type CreateGroomingResponse = {
  msg: string;
  service: GroomingService; // ✅ CAMBIO: Era 'groomingService'
};

type UpdateGroomingResponse = {
  msg: string;
  service: GroomingService; // ✅ CAMBIO: Era 'groomingService'
};

type GetGroomingResponse = {
  service: GroomingService; // ✅ CAMBIO: Era 'groomingService'
};

type GetGroomingListResponse = {
  services: GroomingService[];
};

// =====================================
// ✅ CREAR SERVICIO DE GROOMING
// =====================================
export async function createGroomingService(
  formData: GroomingServiceFormData,
  patientId: string
): Promise<GroomingService> {
  try {
    const { data } = await api.post<CreateGroomingResponse>(
      `/patients/${patientId}/grooming`,
      formData
    );

    console.log("📦 Respuesta cruda (crear grooming):", data);

    const response = groomingServiceSchema.safeParse(data.service); // ✅ CAMBIO
    if (!response.success) {
      console.error("❌ Fallo Zod al crear servicio:", response.error.issues);
      throw new Error("Datos del servicio inválidos");
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al crear el servicio de grooming"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// =====================================
// ✅ OBTENER SERVICIOS POR PACIENTE
// =====================================
export async function getGroomingServicesByPatient(
  patientId: string
): Promise<GroomingService[]> {
  try {
    const { data } = await api.get<GetGroomingListResponse>(
      `/patients/${patientId}/grooming`
    );

    console.log("📦 Servicios del paciente:", data);

    const response = groomingServicesListSchema.safeParse(data.services);
    if (!response.success) {
      console.error(
        "❌ Fallo Zod al obtener servicios:",
        response.error.issues
      );
      throw new Error("Datos de servicios inválidos");
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al obtener servicios de grooming"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// =====================================
// ✅ OBTENER SERVICIO POR ID
// =====================================
export async function getGroomingServiceById(
  id: GroomingService["_id"]
): Promise<GroomingService> {
  try {
    const { data } = await api.get<GetGroomingResponse>(`/grooming/${id}`);

    console.log("📦 Servicio individual:", data);

    const response = groomingServiceSchema.safeParse(
      data.service || data // ✅ CAMBIO: Intentar data.service primero
    );
    if (!response.success) {
      console.error("❌ Fallo Zod al obtener servicio:", response.error.issues);
      throw new Error("Datos del servicio inválidos");
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al obtener el servicio"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// =====================================
// ✅ OBTENER TODOS LOS SERVICIOS
// =====================================
// =====================================
// ✅ OBTENER TODOS LOS SERVICIOS
// =====================================
// =====================================
// ✅ OBTENER TODOS LOS SERVICIOS
// =====================================
export async function getAllGroomingServices(): Promise<GroomingService[]> {
  try {
    const { data } = await api.get("/grooming"); // No necesitas tipar aquí si usas Zod

    

    // ✅ Validar la ESTRUCTURA COMPLETA de la respuesta
    const parsedResponse = groomingServicesListResponseSchema.safeParse(data);
    if (!parsedResponse.success) {
      console.error(
        "❌ Fallo Zod al parsear la respuesta completa:",
        parsedResponse.error.issues
      );
      throw new Error("Estructura de respuesta inválida del servidor");
    }

    return parsedResponse.data.services;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al obtener todos los servicios de grooming"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// =====================================
// ✅ ACTUALIZAR SERVICIO DE GROOMING
// =====================================
type UpdateGroomingAPI = {
  formData: Partial<GroomingServiceFormData>;
  groomingId: GroomingService["_id"];
};

export async function updateGroomingService({
  formData,
  groomingId,
}: UpdateGroomingAPI): Promise<GroomingService> {
  try {
    const { data } = await api.put<UpdateGroomingResponse>(
      `/grooming/${groomingId}`,
      formData
    );

    console.log("📦 Servicio actualizado:", data);

    const response = groomingServiceSchema.safeParse(data.service); // ✅ CAMBIO
    if (!response.success) {
      console.error(
        "❌ Fallo Zod al actualizar servicio:",
        response.error.issues
      );
      throw new Error("Datos del servicio actualizados inválidos");
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al actualizar servicio de grooming"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// =====================================
// ✅ ELIMINAR SERVICIO DE GROOMING
// =====================================
export async function deleteGroomingService(
  id: GroomingService["_id"]
): Promise<{ msg: string }> {
  try {
    const { data } = await api.delete(`/grooming/${id}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al eliminar servicio de grooming"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}