// src/api/medicalStudyAPI.ts
import { AxiosError } from "axios";
import {
  medicalStudySchema,
  medicalStudiesListSchema,
  type MedicalStudy,
} from "../types/medicalStudy";
import api from "../lib/axios";

// Tipos de respuesta
type CreateMedicalStudyResponse = {
  msg: string;
  study: MedicalStudy;
};

type GetMedicalStudiesResponse = {
  studies: MedicalStudy[];
};

type GetMedicalStudyResponse = {
  study: MedicalStudy;
};

// Crear estudio médico con PDF
export async function createMedicalStudy(
  patientId: string,
  formData: FormData
): Promise<MedicalStudy> {
  try {
    const { data } = await api.post<CreateMedicalStudyResponse>(
      `/medical-studies/${patientId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    const parsed = medicalStudySchema.safeParse(data.study);
    if (!parsed.success) {
      throw new Error("Datos del estudio inválidos");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al crear el estudio");
    }
    throw new Error("Error de red o desconocido");
  }
}

// Obtener estudios por paciente
export async function getMedicalStudiesByPatient(
  patientId: MedicalStudy["patientId"]
): Promise<MedicalStudy[]> {
  try {
    const { data } = await api.get<GetMedicalStudiesResponse>(
      `/medical-studies/patient/${patientId}`
    );
    const parsed = medicalStudiesListSchema.safeParse(data.studies);
    if (!parsed.success) {
      throw new Error("Datos de los estudios inválidos");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener estudios");
    }
    throw new Error("Error de red o desconocido");
  }
}

// Obtener estudio por ID
export async function getMedicalStudyById(
  id: MedicalStudy["_id"]
): Promise<MedicalStudy> {
  try {
    const { data } = await api.get<GetMedicalStudyResponse>(
      `/medical-studies/${id}`
    );
    const parsed = medicalStudySchema.safeParse(data.study);
    if (!parsed.success) {
      throw new Error("Datos del estudio inválidos");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener el estudio");
    }
    throw new Error("Error de red o desconocido");
  }
}

// Eliminar estudio
export async function deleteMedicalStudy(
  id: MedicalStudy["_id"]
): Promise<void> {
  try {
    await api.delete(`/medical-studies/${id}`);
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al eliminar el estudio"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}
