import { z } from "zod";


// Patients
export const patientSchema = z.object({
  _id: z.string(),
  name: z.string().min(1, "El nombre es obligatorio"),
  birthDate: z.string().refine((date) => {
    const d = new Date(date);
    return !isNaN(d.getTime());
  }, {
    message: "La fecha de nacimiento debe ser válida (formato YYYY-MM-DD)",
  }),
  species: z.string().min(1, "La especie es obligatoria"),
  breed: z.string().optional(),
  sex: z.enum(["Macho", "Hembra"]),
  weight: z.number().optional(),
  owner: z.string().min(1, "El dueño es obligatorio"),
  photo: z.string().optional(),

  // ✅ NUEVOS CAMPOS
  mainVet: z.string().min(1, "El nombre del veterinario principal es obligatorio"),
  referringVet: z.string().optional(),
});

// Lista de pacientes
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

// Tipos inferidos
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

// Owners
export const ownerSchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  contact: z.string().min(1),
  email: z.string().min(1),
  address: z.string(),
});

export const ownersListSchema = z.array(
  ownerSchema.pick({
    _id: true,
    name: true,
    contact: true,
    email: true,
    address: true,
  })
);

export type Owner = z.infer<typeof ownerSchema>;
export type OwnerFormData = Pick<
  Owner,
  "name" | "contact" | "email" | "address"
>;