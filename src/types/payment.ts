// src/types/payment.ts
import { z } from "zod";

export const PaymentMethodSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  currency: z.string(),
  paymentMode: z.string(),
  requiresReference: z.boolean().default(false),
  isActive: z.boolean().default(true),
  veterinarian: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const PaymentMethodFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  currency: z.string().min(1, "La moneda es obligatoria"),
  paymentMode: z.string().min(1, "El modo de pago es obligatorio"),
  requiresReference: z.boolean().default(false),
});

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type PaymentMethodFormData = z.infer<typeof PaymentMethodFormSchema>;