// src/types/patient.ts
import { z } from "zod";

export const patientSchema = z.object({
  _id: z.string(),
  name: z.string().min(1, "El nombre es obligatorio"),
  birthDate: z.string().refine(
    (date) => {
      const d = new Date(date);
      return !isNaN(d.getTime());
    },
    {
      message: "La fecha de nacimiento debe ser válida (formato YYYY-MM-DD)",
    }
  ),
  species: z.string().min(1, "La especie es obligatoria"),
  breed: z.string().optional(),
  sex: z.enum(["Macho", "Hembra"]),
  weight: z.number().optional(),
  owner: z.string().min(1, "El dueño es obligatorio"),
  photo: z.string().optional(),
  mainVet: z
    .string()
    .min(1, "El nombre del veterinario principal es obligatorio"),
  referringVet: z.string().optional(),
});

export const patientsListSchema = z.array(
  patientSchema.pick({
    _id: true,
    name: true,
    birthDate: true,
    species: true,
    breed: true,
    sex: true,
    weight: true,
    owner: true,
    photo: true,
    mainVet: true,
    referringVet: true,
  })
);

export type Patient = z.infer<typeof patientSchema>;
export type PatientFormData = Pick<
  Patient,
  | "name"
  | "birthDate"
  | "species"
  | "breed"
  | "sex"
  | "weight"
  | "owner"
  | "photo"
  | "mainVet"
  | "referringVet"
>;