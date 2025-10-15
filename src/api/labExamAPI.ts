// src/api/labExamAPI.ts
import { AxiosError } from "axios";
import {
  labExamSchema,
  labExamsListSchema,
  type LabExam,
  type LabExamFormData,
} from "../types";
import api from "../lib/axioa";

/**
 * Helper para manejar errores de Axios de forma consistente.
 * Lanza un error con un mensaje del backend si está disponible,
 * o un mensaje genérico si es un error de red.
 */
const handleErrors = (error: unknown) => {
  if (error instanceof AxiosError && error.response) {
    throw new Error(error.response.data.msg || "Ocurrió un error inesperado.");
  }
  throw new Error("Error de red o desconocido.");
};

// ---
// ✅ Crear un nuevo examen de laboratorio para un paciente
export async function createLabExam(
  formData: LabExamFormData,
  patientId: string
): Promise<LabExam> {
  try {
    const { data } = await api.post(
      `/patients/${patientId}/lab-exams`,
      formData
    );

    const result = labExamSchema.safeParse(data.labExam);
    if (!result.success) {
      console.error(
        "❌ Error de validación Zod al crear examen:",
        result.error
      );
      throw new Error("Datos del examen inválidos recibidos del servidor.");
    }
    return result.data;
  } catch (error) {
    handleErrors(error);
    return Promise.reject(error);
  }
}

// ---
// ✅ Obtener todos los exámenes de laboratorio de un paciente
export async function getLabExamsByPatient(
  patientId: string
): Promise<LabExam[]> {
  try {
    const { data } = await api.get(`/patients/${patientId}/lab-exams`);

    const result = labExamsListSchema.safeParse(data.exams);
    if (!result.success) {
      console.error(
        "❌ Error de validación Zod al obtener la lista de exámenes:",
        result.error
      );
      throw new Error(
        "Datos de la lista de exámenes inválidos recibidos del servidor."
      );
    }
    return result.data;
  } catch (error) {
    handleErrors(error);
    return Promise.reject(error);
  }
}

// ---
export async function getLabExamById(
  patientId: string,
  id: string
): Promise<LabExam> {
  try {
    const { data } = await api.get(`/patients/${patientId}/lab-exams/${id}`);
    console.log({ data });

    const result = labExamSchema.safeParse(data.labExam || data);
    console.log(result);

    if (!result.success) {
      console.error("❌ Error de validación Zod:", result.error);
      throw new Error("Datos del examen inválidos.");
    }
    return result.data;
  } catch (error) {
    handleErrors(error);
    return Promise.reject(error);
  }
}

// ---
// ✅ Actualizar un examen de laboratorio
export async function updateLabExam(
  id: string,
  formData: Partial<LabExamFormData>
): Promise<LabExam> {
  try {
    const { data } = await api.put(`/lab-exams/${id}`, formData);

    const result = labExamSchema.safeParse(data.labExam);
    if (!result.success) {
      console.error(
        "❌ Error de validación Zod al actualizar examen:",
        result.error
      );
      throw new Error("Datos del examen inválidos recibidos del servidor.");
    }
    return result.data;
  } catch (error) {
    handleErrors(error);
    return Promise.reject(error);
  }
}

// ---
// ✅ Eliminar un examen de laboratorio
export async function deleteLabExam(id: string): Promise<void> {
  try {
    const { data } = await api.delete(`/lab-exams/${id}`);
    return data;
  } catch (error) {
    handleErrors(error);
    return Promise.reject(error);
  }
}
