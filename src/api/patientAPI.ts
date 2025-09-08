// api/patientAPI.ts
import { AxiosError } from "axios";
import { patientSchema, patientsListSchema, type Patient } from "../types";
import api from "../lib/axioa"; // Asegúrate de que sea "axios"

// ✅ Crear paciente
type CreateResponse = {
  msg: string;
  patient: Patient;
};
// ✅ Crear paciente
export async function createPatient(
  formData: FormData,
  ownerId: string
): Promise<Patient> {
  try {
    // La URL es más clara: estamos creando un paciente DENTRO de un dueño
    const { data } = await api.post<CreateResponse>(
      `/owners/${ownerId}/patients`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    console.log("📦 Respuesta cruda:", data);

    // Validamos que el objeto 'patient' de la respuesta cumpla con el esquema
    const response = patientSchema.safeParse(data.patient);
    if (!response.success) {
      console.error("❌ Fallo Zod:", response.error.issues);
      throw new Error("Datos de paciente inválidos");
    }

    // Retornamos solo los datos del paciente validados
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al crear el paciente");
    }
    throw new Error("Error de red o desconocido");
  }
}
// src/api/patientAPI.ts

// Tipo de la respuesta real del backend
// type CreateResponse = {
//   msg: string;
//   patient: Patient;
// };

// export async function createPatient(formData: FormData): Promise<Patient> {
//   const ownerId = formData.get("owner") as string;

//   try {
//     const { data } = await api.post<CreateResponse>(
//       `/patients/${ownerId}/patients`,
//       formData,
//       { headers: { "Content-Type": "multipart/form-data" } }
//     );

//     console.log("📦 Respuesta cruda:", data);

//     const response = patientSchema.safeParse(data.patient);
//     if (!response.success) {
//       console.error("❌ Fallo Zod:", response.error.issues);
//       throw new Error("Datos de paciente inválidos");
//     }

//     return response.data;
//   } catch (error) {
//     if (error instanceof AxiosError && error.response) {
//       throw new Error(error.response.data.msg || "Error al crear el paciente");
//     }
//     throw new Error("Error de red o desconocido");
//   }
// }

// export async function createPatient(formData: PatientFormData) {
//   try {
//     const { data } = await api.post<Patient>("/patients", formData);
//     const response = patientSchema.safeParse(data);
//     if (response.success) {
//       return response.data;
//     } else {
//       throw new Error("Datos de paciente inválidos");
//     }
//   } catch (error) {
//     if (error instanceof AxiosError && error.response) {
//       throw new Error(error.response.data.msg || "Error al crear el paciente");
//     }
//     throw new Error("Error de red o desconocido");
//   }
// }

// ✅ Obtener todas las mascotas
export async function getPatients() {
  try {
    const { data } = await api.get("/patients");
    console.log(data);
    const response = patientsListSchema.safeParse(data);
    console.log(response);

    if (response.success) {
      console.log("data que envia", response.data);
      return response.data;
    }
    throw new Error("Datos de pacientes inválidos");
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener pacientes");
    }
    throw new Error("Error de red o desconocido");
  }
}

// ✅ Obtener paciente por ID
export async function getPatientById(id: Patient["_id"]) {
  try {
    const { data } = await api.get<Patient>(`/patients/${id}`);
    console.log(data);
    const response = patientSchema.safeParse(data);
    if (response.success) {
      return response.data;
    } else {
      throw new Error("Datos de paciente inválidos");
    }
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener paciente");
    }
    throw new Error("Error de red o desconocido");
  }
}



// export async function updatePatient({
//   formData,
//   patientId,
// }: PatientAPIType): Promise<Patient> {
//   try {
    
//     const { data } = await api.put<UpdatePatientResponse>( // ✅ CAMBIO: Usar POST
//       `/patients/${patientId}`,
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data" 
//         },
//       }
//     ); // Aquí validas y retornas solo el objeto del paciente

//     const patientData = patientSchema.safeParse(data.patient);
//     if (!patientData.success) {
//       throw new Error("Datos del paciente recibidos inválidos");
//     }

//     return patientData.data; // Devuelve solo el objeto Patient
//   } catch (error) {
//     if (error instanceof AxiosError && error.response) {
//       throw new Error(
//         error.response.data.msg || "Error al actualizar paciente"
//       );
//     }
//     throw new Error("Error de red o desconocido");
//   }
// }

// Tipos
type UpdatePatientAPI = {
  formData: FormData;
  patientId: string;
};

export async function updatePatient({ formData, patientId }: UpdatePatientAPI): Promise<Patient> {
  try {
    const { data } = await api.put(`/patients/${patientId}`, formData, {
      headers: {
        // ⚠️ No pongas 'Content-Type' manualmente
        // axios lo hace automáticamente cuando es FormData
      },
    });

    return data.patient; // Asume que el backend devuelve { msg, patient }
  } catch (error: any) {
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as { response?: { data: { msg?: string } } };
      throw new Error(axiosError.response?.data?.msg || 'Error al actualizar paciente');
    }
    throw new Error('Error de red o desconocido');
  }
}

// ✅ Actualizar paciente
// export async function updatePatient({ formData, patientId }: PatientAPIType) {
//   try {
//     const { data } = await api.put<UpdatePatientResponse>(`/patients/${patientId}`, formData);
//     return data;
//   } catch (error) {
//     if (error instanceof AxiosError && error.response) {
//       throw new Error(error.response.data.msg || "Error al actualizar paciente");
//     }
//     throw new Error("Error de red o desconocido");
//   }
// }

// ✅ Eliminar paciente
export async function deletePatient(id: Patient["_id"]) {
  try {
    const { data } = await api.delete(`/patients/${id}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al eliminar paciente");
    }
    throw new Error("Error de red o desconocido");
  }
}

// patient byh owner

export async function getPatientsByOwner(ownerId: string): Promise<Patient[]> {
  try {
    const { data } = await api.get(`/patients/owner/${ownerId}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al cargar mascotas");
    }
    throw new Error("Error de red");
  }
}
