// src/types/vaccination.ts
import { z } from "zod";

export const vaccinationSchema = z.object({
  _id: z.string().optional(),
  patientId: z.string(),
  veterinarianId: z.string().optional(),
  vaccinationDate: z.string(),
  vaccineType: z.string().min(1, "El tipo de vacuna es obligatorio"),
  cost: z.number().min(0, "El costo debe ser positivo"),
  laboratory: z.string().optional(),
  batchNumber: z.string().optional(),
  expirationDate: z.string().optional(),
  nextVaccinationDate: z.string().optional(),
  observations: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const vaccinationsListSchema = z.array(vaccinationSchema);

export type Vaccination = z.infer<typeof vaccinationSchema>;

export type VaccinationFormData = Pick<
  Vaccination,
  | "vaccinationDate"
  | "vaccineType"
  | "cost"
  | "laboratory"
  | "batchNumber"
  | "expirationDate"
  | "nextVaccinationDate"
  | "observations"
>;