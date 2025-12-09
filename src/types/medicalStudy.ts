// src/types/medicalStudy.ts
import { z } from "zod";

export const medicalStudySchema = z.object({
  _id: z.string().optional(),
  patientId: z.string().min(1, "El paciente es obligatorio"),
  veterinarianId: z.string().optional(),
  professional: z.string().min(1, "El nombre del profesional es obligatorio").max(100, "Máximo 100 caracteres"),
  studyType: z.string().min(1, "El tipo de estudio es obligatorio").max(50, "Máximo 50 caracteres"),
  pdfFile: z.string().min(1, "El archivo PDF es obligatorio"),
  presumptiveDiagnosis: z.string().optional(),
  notes: z.string().optional(),
  date: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: "La fecha es obligatoria",
  }),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const medicalStudiesListSchema = z.array(medicalStudySchema);

export type MedicalStudy = z.infer<typeof medicalStudySchema>;

export type MedicalStudyFormData = Pick<
  MedicalStudy,
  | "patientId"
  | "professional"
  | "studyType"
  | "presumptiveDiagnosis"
  | "notes"
  | "date"
>;