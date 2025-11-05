// src/types/auth.ts
import { z } from "zod";

const estadosVenezuela = [
  "Amazonas",
  "Anzoátegui",
  "Apure",
  "Aragua",
  "Barinas",
  "Bolívar",
  "Carabobo",
  "Cojedes",
  "Delta Amacuro",
  "Distrito Capital",
  "Falcón",
  "Guárico",
  "Lara",
  "Mérida",
  "Miranda",
  "Monagas",
  "Nueva Esparta",
  "Portuguesa",
  "Sucre",
  "Táchira",
  "Trujillo",
  "Vargas",
  "Yaracuy",
  "Zulia"
] as const;

/** auth $ veterinary */
const authSchema = z.object({
  name: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string(),
  confirmPassword: z.string(),
  whatsapp: z.string(),
  ci: z.string(),
  cmv: z.string(),
  estado: z.enum(estadosVenezuela).optional(),
  runsai: z.string().optional(),
  msds: z.string().optional(),
  somevepa: z.string().optional(),
  confirmed: z.boolean(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  token: z.string()
});

type Auth = z.infer<typeof authSchema>;
export type UserLoginForm = Pick<Auth, "email" | "password">;
export type UserRegistrationForm = Pick<Auth, "name" | "lastName" | "email" | "password" | "confirmPassword" | "whatsapp" | "ci" | "cmv" | "estado" | "runsai" | "msds" | "somevepa">;
export type RequestConfirmationCodeForm = Pick<Auth, "email">;
export type ForgotPasswordForm = Pick<Auth, "email">;
export type NewPasswordForm = Pick<Auth, "password" | "confirmPassword">;
export type confirmToken = Pick<Auth, "token">;

// Users
export const userSchema = authSchema.pick({
  name: true,
  lastName: true,
  email: true,
}).extend({
  _id: z.string(),
});
export type User = z.infer<typeof userSchema>;