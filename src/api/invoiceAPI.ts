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
