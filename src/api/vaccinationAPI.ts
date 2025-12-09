// src/api/vaccinationAPI.ts
import { AxiosError } from "axios";
import api from "../lib/axios";
import {
  vaccinationSchema,
  vaccinationsListSchema,
  type Vaccination,
  type VaccinationFormData,
} from "../types/vaccination";

type CreateVaccinationResponse = {
  msg: string;
  vaccination: Vaccination;
};

type GetVaccinationsResponse = {
  vaccinations: Vaccination[];
};

type GetVaccinationResponse = {
  vaccination: Vaccination;
};

// Crear vacuna
export async function createVaccination(
  patientId: string,
  data: VaccinationFormData
): Promise<Vaccination> {
  try {
    const { data: response } = await api.post<CreateVaccinationResponse>(
      `/vaccinations/${patientId}`,
      data
    );
    const parsed = vaccinationSchema.safeParse(response.vaccination);
    if (!parsed.success) {
      console.error("❌ Zod error:", parsed.error.issues);
      throw new Error("Datos de vacuna inválidos");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al crear vacuna");
    }
    throw new Error("Error de red");
  }
}

// Obtener todas las vacunas del veterinario
export async function getAllVaccinations(): Promise<Vaccination[]> {
  try {
    const { data } = await api.get<GetVaccinationsResponse>("/vaccinations");
    const parsed = vaccinationsListSchema.safeParse(data.vaccinations);
    if (!parsed.success) {
      throw new Error("Datos de vacunas inválidos");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener vacunas");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error de red o desconocido");
  }
}


// Obtener vacunas por paciente
export async function getVaccinationsByPatient(
  patientId: string
): Promise<Vaccination[]> {
  try {
    const { data } = await api.get<GetVaccinationsResponse>(
      `/vaccinations/patient/${patientId}`
    );
    const parsed = vaccinationsListSchema.safeParse(data.vaccinations);
    if (!parsed.success) {
      throw new Error("Datos inválidos");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener vacunas");
    }
    throw new Error("Error de red");
  }
}

// Obtener vacuna por ID
export async function getVaccinationById(id: string): Promise<Vaccination> {
  try {
    const { data } = await api.get<GetVaccinationResponse>(
      `/vaccinations/${id}`
    );
    const parsed = vaccinationSchema.safeParse(data.vaccination);
    if (!parsed.success) {
      throw new Error("Datos inválidos");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener vacuna");
    }
    throw new Error("Error de red");
  }
}

// Actualizar vacuna
export async function updateVaccination(
  id: string,
  data: Partial<VaccinationFormData>
): Promise<Vaccination> {
  try {
    const { data: response } = await api.put<{
      msg: string;
      vaccination: Vaccination;
    }>(`/vaccinations/${id}`, data);
    return response.vaccination;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al actualizar");
    }
    throw new Error("Error de red");
  }
}

// Eliminar vacuna
export async function deleteVaccination(id: string): Promise<void> {
  try {
    await api.delete(`/vaccinations/${id}`);
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al eliminar");
    }
    throw new Error("Error de red");
  }
}
