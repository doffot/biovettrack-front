import { AxiosError } from "axios";
import { ownersListSchema, type Owner, type OwnerFormData } from "../types";
import api from "../lib/axioa";

export async function createOwner(formData: OwnerFormData) {
  try {
    const { data } = await api.post("/owners", formData);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      // 👇 Accede a error.response.data
      throw new Error(error.response.data.msg || "Error al crear el dueño");
    }
    throw new Error("Error de red o desconocido");
  }
}

export async function getOwners() {
  try {
    const { data } = await api.get("/owners");
    const response = ownersListSchema.safeParse(data);
    if (response.success) {
      return response.data;
    }
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      // 👇 Accede a error.response.data
      throw new Error(error.response.data.msg || "Error al crear el dueño");
    }
    throw new Error("Error de red o desconocido");
  }
}

export async function getOwnersById(id: Owner["_id"]) {
  try {
    const { data } = await api.get(`/owners/${id}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      // 👇 Accede a error.response.data
      throw new Error(error.response.data.msg || "Error al crear el dueño");
    }
    throw new Error("Error de red o desconocido");
  }
}


type OwnerAPIType ={
  formData: OwnerFormData;
  ownerId: Owner["_id"];

}

type UpdateOwnerResponse = {
  msg: string;
  owner: Owner;
}

export async function updateOwners({formData, ownerId}: OwnerAPIType) {
  try {
    const { data } = await api.put<UpdateOwnerResponse>(`/owners/${ownerId}`, formData);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      // 👇 Accede a error.response.data
      throw new Error(error.response.data.msg || "Error al crear el dueño");
    }
    throw new Error("Error de red o desconocido");
  }
}

export async function deleteOwners(id: Owner["_id"]) {
  try {
    const { data } = await api.delete(`/owners/${id}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al crear el dueño");
    }
    throw new Error("Error de red o desconocido");
  }
}

