// src/api/paymentAPI.ts
import { AxiosError } from "axios";
import { 
  PaymentMethodSchema, 
  PaymentMethodFormSchema,
  type PaymentMethod,
  type PaymentMethodFormData 
} from "../types/payment";
import api from "../lib/axioa";

// Tipos de respuesta
type PaymentMethodsResponse = {
  success: boolean;
  paymentMethods: PaymentMethod[];
};

type PaymentMethodResponse = {
  success: boolean;
  paymentMethod: PaymentMethod;
};

type CreatePaymentMethodResponse = {
  success: boolean;
  msg: string;
  paymentMethod: PaymentMethod;
};

type UpdatePaymentMethodResponse = {
  success: boolean;
  msg: string;
  paymentMethod: PaymentMethod;
};

type DeletePaymentMethodResponse = {
  success: boolean;
  msg: string;
};

// ✅ OBTENER TODOS LOS MÉTODOS DE PAGO DEL VETERINARIO
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const { data } = await api.get<PaymentMethodsResponse>("/payment-methods");

    const response = PaymentMethodSchema.array().safeParse(data.paymentMethods);
    if (!response.success) {
      throw new Error("Estructura de respuesta inválida del servidor");
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al obtener los métodos de pago"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// ✅ OBTENER MÉTODO DE PAGO POR ID
export async function getPaymentMethodById(id: string): Promise<PaymentMethod> {
  try {
    const { data } = await api.get<PaymentMethodResponse>(`/payment-methods/${id}`);

    const response = PaymentMethodSchema.safeParse(data.paymentMethod);
    if (!response.success) {
      throw new Error("Estructura de respuesta inválida del servidor");
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al obtener el método de pago"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// ✅ CREAR MÉTODO DE PAGO
export async function createPaymentMethod(
  formData: PaymentMethodFormData
): Promise<PaymentMethod> {
  try {
    // Validar datos del formulario
    const validatedData = PaymentMethodFormSchema.parse(formData);

    const { data } = await api.post<CreatePaymentMethodResponse>(
      "/payment-methods",
      validatedData
    );

    const response = PaymentMethodSchema.safeParse(data.paymentMethod);
    if (!response.success) {
      throw new Error("Estructura de respuesta inválida del servidor");
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al crear el método de pago"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// ✅ ACTUALIZAR MÉTODO DE PAGO
export async function updatePaymentMethod(
  id: string,
  formData: Partial<PaymentMethodFormData>
): Promise<PaymentMethod> {
  try {
    const { data } = await api.put<UpdatePaymentMethodResponse>(
      `/payment-methods/${id}`,
      formData
    );

    const response = PaymentMethodSchema.safeParse(data.paymentMethod);
    if (!response.success) {
      throw new Error("Estructura de respuesta inválida del servidor");
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al actualizar el método de pago"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}

// ✅ ELIMINAR MÉTODO DE PAGO
export async function deletePaymentMethod(id: string): Promise<void> {
  try {
    await api.delete<DeletePaymentMethodResponse>(`/payment-methods/${id}`);
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(
        error.response.data.msg || "Error al eliminar el método de pago"
      );
    }
    throw new Error("Error de red o desconocido");
  }
}