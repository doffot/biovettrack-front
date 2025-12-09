// src/types/deworming.ts
import { z } from "zod";

export const dewormingSchema = z.object({
  _id: z.string().optional(),
  patientId: z.string(),
  veterinarianId: z.string().optional(),
  applicationDate: z.string(),
  nextApplicationDate: z.string().optional(),
  dewormingType: z.enum(["Interna", "Externa", "Ambas"]),
  productName: z.string().min(1, "El producto es obligatorio"),
  dose: z.string().min(1, "La dosis es obligatoria"),
  cost: z.number().min(0, "El costo debe ser positivo"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const dewormingsListSchema = z.array(dewormingSchema);

export type Deworming = z.infer<typeof dewormingSchema>;

export type DewormingFormData = Pick<
  Deworming,
  | "applicationDate"
  | "nextApplicationDate"
  | "dewormingType"
  | "productName"
  | "dose"
  | "cost"
>;