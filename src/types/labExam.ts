// src/types/labExam.ts
import { z } from "zod";

export const differentialCountSchema = z.object({
  segmentedNeutrophils: z.number().min(0).max(100).optional(),
  bandNeutrophils: z.number().min(0).max(100).optional(),
  lymphocytes: z.number().min(0).max(100).optional(),
  monocytes: z.number().min(0).max(100).optional(),
  basophils: z.number().min(0).max(100).optional(),
  reticulocytes: z.number().min(0).max(100).optional(),
  eosinophils: z.number().min(0).max(100).optional(),
  nrbc: z.number().min(0).max(100).optional(),
});

export const labExamSchema = z.object({
  _id: z.string().optional(),
  patientId: z.string().min(1, "El ID del paciente es obligatorio"),
  date: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: "La fecha del examen debe ser válida",
  }),
  hematocrit: z.number().min(0, "El hematocrito debe ser un valor positivo"),
  whiteBloodCells: z
    .number()
    .min(0, "Los glóbulos blancos deben ser un valor positivo"),
  totalProtein: z
    .number()
    .min(0, "La proteína total debe ser un valor positivo"),
  platelets: z.number().min(0, "Las plaquetas deben ser un valor positivo"),
  differentialCount: differentialCountSchema,
  totalCells: z
    .number()
    .min(0)
    .max(100, "El total de células debe ser un porcentaje válido"),
  hemotropico: z.string().optional(),
  observacion: z.string().optional(),
});

export const labExamsListSchema = z.array(labExamSchema);

export type LabExam = z.infer<typeof labExamSchema>;
export type LabExamFormData = Pick<
  LabExam,
  | "patientId"
  | "date"
  | "hematocrit"
  | "whiteBloodCells"
  | "totalProtein"
  | "platelets"
  | "differentialCount"
  | "totalCells"
  | "hemotropico"
  | "observacion"
>;