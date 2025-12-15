// src/api/invoiceAPI.ts
import { AxiosError } from "axios";
import {
  invoiceSchema,
  invoicesListSchema,
  type Invoice,
  type InvoiceFormData,
} from "../types/invoice";
import api from "../lib/axios";

// Tipos de respuesta
type CreateInvoiceResponse = {
  msg: string;
  invoice: Invoice;
};

type GetInvoiceResponse = {
  invoice: Invoice;
};

type GetInvoicesResponse = {
  invoices: Invoice[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

// Crear factura
export async function createInvoice(
  formData: InvoiceFormData
): Promise<Invoice> {
  try {
    const { data } = await api.post<CreateInvoiceResponse>(
      "/invoices",
      formData
    );
    const parsed = invoiceSchema.safeParse(data.invoice);
    if (!parsed.success) {
      throw new Error("Datos de la factura inválidos");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al crear la factura");
    }
    throw new Error("Error de red o desconocido");
  }
}

// Obtener lista de facturas
export async function getInvoices(params?: {
  status?: string;
  ownerId?: string;
  ownerName?: string;
  patientId?: string;
  page?: number;
  limit?: number;
}): Promise<GetInvoicesResponse> {
  try {
    const { data } = await api.get<GetInvoicesResponse>("/invoices", {
      params,
    });

     console.log("=== DEBUG INVOICES ===");
    console.log("Raw data from API:", data);
    console.log("Invoices count:", data.invoices?.length);

    const parsed = invoicesListSchema.safeParse(data.invoices);
    if (!parsed.success) {
      throw new Error("Datos de las facturas inválidos");
    }
    return {
      ...data,
      invoices: parsed.data,
    };
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener facturas");
    }
    throw new Error("Error de red o desconocido");
  }
}

// Obtener factura por ID
export async function getInvoiceById(id: Invoice["_id"]): Promise<Invoice> {
  try {
    const { data } = await api.get<GetInvoiceResponse>(`/invoices/${id}`);
    const parsed = invoiceSchema.safeParse(data.invoice);
    if (!parsed.success) {
      throw new Error("Datos de la factura inválidos");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.msg || "Error al obtener la factura");
    }
    throw new Error("Error de red o desconocido");
  }
}

export async function getInvoiceByResourceId(
  resourceId: string,
  type: "grooming" | "labExam" | "consulta" | "vacuna" | "producto" = "grooming"
): Promise<Invoice | null> {
  try {
    console.log('entro a getinvoiceby id');
     console.log("API: getInvoiceByResourceId", { resourceId, type });
    const { data } = await api.get<GetInvoiceResponse>(
      `/invoices/resource/${resourceId}`,
      { params: { type } }
    );
    const parsed = invoiceSchema.safeParse(data.invoice);
    if (!parsed.success) {
      console.error("Error parsing invoice:", parsed.error);
      return null;
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return null; 
    }
    console.error("Error buscando factura por resourceId:", error);
    return null;
  }
}

export async function updateInvoiceItem(
  invoiceId: string,
  resourceId: string,
  updates: {
    cost?: number;
    description?: string;
    quantity?: number;
  }
): Promise<Invoice> {
  try {
    const { data } = await api.put<CreateInvoiceResponse>(
      `/invoices/${invoiceId}/item/${resourceId}`,
      updates
    );
    return data.invoice;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data?.msg || "Error al actualizar el item de la factura"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// Actualizar factura (pagos)
export async function updateInvoice(
  id: Invoice["_id"],
  formData: Partial<InvoiceFormData> & {
    paymentMethod?: string;
    paymentReference?: string;
    paymentStatus?: string;
    exchangeRate?: number;
    amountPaidUSD?: number;
    amountPaidBs?: number;
  }
): Promise<Invoice> {
  try {
    const cleanData = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value !== undefined)
    );

    const { data } = await api.put<CreateInvoiceResponse>(
      `/invoices/${id}`,
      cleanData
    );

    return data.invoice;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data?.msg || "Error al actualizar la factura"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// Eliminar factura
export async function deleteInvoice(id: Invoice["_id"]): Promise<{ msg: string }> {
  try {
    const { data } = await api.delete<{ msg: string }>(`/invoices/${id}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data?.msg || "Error al eliminar la factura"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// src/api/invoiceAPI.ts - AGREGAR esta función

// Obtener facturas pendientes por paciente
export async function getPendingInvoicesByPatient(
  patientId: string
): Promise<Invoice[]> {
  try {
    const { invoices } = await getInvoices({
      patientId,
      status: "Pendiente",
    });
    
    // También incluir facturas parciales
    const { invoices: partialInvoices } = await getInvoices({
      patientId,
      status: "Parcial",
    });
    
    return [...invoices, ...partialInvoices];
  } catch (error) {
    console.error("Error obteniendo facturas pendientes:", error);
    return [];
  }
}

// Obtener resumen de deuda por paciente
export async function getPatientDebtSummary(patientId: string): Promise<{
  totalDebt: number;
  invoicesCount: number;
  invoices: Invoice[];
}> {
  try {
    const invoices = await getPendingInvoicesByPatient(patientId);
    
    const totalDebt = invoices.reduce((sum, inv) => {
      const remaining = inv.total - (inv.amountPaid || 0);
      return sum + remaining;
    }, 0);
    
    return {
      totalDebt,
      invoicesCount: invoices.length,
      invoices,
    };
  } catch (error) {
    console.error("Error obteniendo resumen de deuda:", error);
    return { totalDebt: 0, invoicesCount: 0, invoices: [] };
  }
}