// src/api/staffAPI.ts
import { AxiosError } from "axios";
import {
  staffSchema,
  staffListSchema,
  type Staff,
  type StaffFormData,
} from "../types/staff";
import api from "../lib/axios";

type CreateStaffResponse = {
  msg: string;
  staff: Staff;
};

type UpdateStaffResponse = {
  msg: string;
  staff: Staff;
};

type GetStaffResponse = {
  staff: Staff;
};

type GetStaffListResponse = {
  staff: Staff[];
};

export async function createStaff(formData: StaffFormData): Promise<Staff> {
  try {
    const { data } = await api.post<CreateStaffResponse>("/staff", formData);
    const parsed = staffSchema.safeParse(data.staff);
    if (!parsed.success) {
      throw new Error("Datos del staff inválidos");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al crear el miembro del staff"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

export async function getStaffList(): Promise<Staff[]> {
  try {
    const { data } = await api.get<GetStaffListResponse>("/staff");

    const staffWithId = data.staff.map((staff: any) => ({
      ...staff,
      _id: staff._id || staff.id,
    }));

    const parsed = staffListSchema.safeParse(staffWithId);
    if (!parsed.success) {
      throw new Error("Datos de la lista de staff inválidos");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al obtener la lista de staff"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

export async function getStaffById(id: Staff["_id"]): Promise<Staff> {
  try {
    const { data } = await api.get<GetStaffResponse>(`/staff/${id}`);
    const parsed = staffSchema.safeParse(data.staff);
    if (!parsed.success) {
      throw new Error("Datos del staff inválidos");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al obtener el miembro del staff"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

type UpdateStaffAPI = {
  formData: Partial<StaffFormData>;
  staffId: Staff["_id"];
};

export async function updateStaff({
  formData,
  staffId,
}: UpdateStaffAPI): Promise<Staff> {
  try {
    const { data } = await api.put<UpdateStaffResponse>(
      `/staff/${staffId}`,
      formData
    );
    const parsed = staffSchema.safeParse(data.staff);
    if (!parsed.success) {
      console.error("❌ Zod error (actualizar staff):", parsed.error.issues);
      throw new Error("Datos actualizados del staff inválidos");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al actualizar el miembro del staff"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

export async function deleteStaff(id: Staff["_id"]): Promise<{ msg: string }> {
  try {
    const { data } = await api.delete<{ msg: string }>(`/staff/${id}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al eliminar el miembro del staff"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}
