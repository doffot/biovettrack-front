import { isAxiosError } from "axios";
import {
  userSchema,
  type confirmToken,
  type ForgotPasswordForm,
  type NewPasswordForm,
  type RequestConfirmationCodeForm,
  type UserLoginForm,
  type UserRegistrationForm,
} from "../types";
import api from "../lib/axios";

export async function createAccount(formData: UserRegistrationForm) {
  try {
    const url = "/auth/create-account";
    const { data } = await api.post<string>(url, formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "Error al crear la cuenta");
    }
  }
}
export async function confirmAccount(formData: confirmToken) {
  try {
    const url = "/auth/confirm-account";
    const { data } = await api.post<string>(url, formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "Error al crear la cuenta");
    }
  }
}

export async function requestConfirmationCode(
  formData: RequestConfirmationCodeForm
) {
  try {
    const url = "/auth/request-new-token";
    const { data } = await api.post<string>(url, formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "Error al crear la cuenta");
    }
  }
}

export async function login(formData: UserLoginForm) {
  try {
    const url = "/auth/login";
    const { data } = await api.post<string>(url, formData);
    localStorage.setItem("AUTH_TOKEN_LABVET", data);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "Error al crear la cuenta");
    }
  }
}

export async function forgotPassword(formData: ForgotPasswordForm) {
  try {
    const url = "/auth/forgot-password";
    const { data } = await api.post<string>(url, formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "Error al crear la cuenta");
    }
  }
}

export async function validateToken(formData: confirmToken) {
  try {
    const url = "/auth/validate-token";
    const { data } = await api.post<string>(url, formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "Error al crear la cuenta");
    }
  }
}

export async function updatePasswordWithToken({
  formData,
  token,
}: {
  formData: NewPasswordForm;
  token: confirmToken["token"];
}) {
  try {
    const url = `/auth/update-password/${token}`;
    const { data } = await api.post<string>(url, formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "Error al crear la cuenta");
    }
  }
}

export async function getUser() {
  try {
    const { data } = await api.get("/auth/user");
    const response = userSchema.safeParse(data);
    if (response.success) {
      return response.data;
    }
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "Error al crear la cuenta");
    }
  }
}
