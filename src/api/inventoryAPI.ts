// src/api/inventoryAPI.ts
import { AxiosError } from "axios";
import api from "../lib/axios";
import { inventorySchema, type ConsumeStockData, type ConsumeStockResponse, type InitializeInventoryData, type InitializeInventoryResponse, type Inventory } from "../types/inventory";


// ==================== CONSUMIR STOCK ====================
export async function consumeStock(
  productId: string,
  data: ConsumeStockData
): Promise<ConsumeStockResponse> {
  try {
    const { data: response } = await api.post<ConsumeStockResponse>(
      `/inventory/${productId}/consume`,
      data
    );
    return response;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al consumir stock");
    }
    throw new Error("Error de red");
  }
}

// ==================== INICIALIZAR INVENTARIO ====================
export async function initializeInventory(
  data: InitializeInventoryData
): Promise<InitializeInventoryResponse> {
  try {
    const { data: response } = await api.post<InitializeInventoryResponse>(
      "/inventory/initialize",
      data
    );
    return response;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al inicializar inventario");
    }
    throw new Error("Error de red");
  }
}

// ==================== OBTENER INVENTARIO ====================
export async function getInventory(productId: string) {
  try {
    const { data } = await api.get<{ inventory: Inventory }>(
      `/inventory/${productId}`
    );
    const parsed = inventorySchema.safeParse(data.inventory);
    if (!parsed.success) throw new Error("Datos de inventario inválidos");
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener inventario");
    }
    throw new Error("Error de red");
  }
}