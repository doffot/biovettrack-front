// src/types/grooming.ts
import { z } from "zod";
import type { Staff } from "./staff";

export const ServiceTypeSchema = z.enum(["Corte", "Baño", "Corte y Baño"]);
export const ServiceStatusSchema = z.enum(["Programado", "En progreso", "Completado", "Cancelado"]);

const OwnerFieldSchema = z.union([
  z.string().min(1, "El dueño es obligatorio"),
  z.object({
    _id: z.string(),
    name: z.string(),
  }),
  z.null(),
  z.undefined()
]).nullable().optional();

const GroomerFieldSchema = z.union([
  z.string().min(1, "El groomer es obligatorio"),
  z.object({
    _id: z.string(),
    name: z.string(),
    lastName: z.string(),
  }),
  z.null(),
  z.undefined()
]).nullable().optional();

const PatientFieldSchema = z.union([
  z.string().min(1, "El ID del paciente es obligatorio"),
  z.object({
    _id: z.string(),
    name: z.string().optional(),
    species: z.string().optional(),
    breed: z.string().optional(),
    weight: z.number().optional(),
    sex: z.enum(["Macho", "Hembra"]).optional(),
    owner: OwnerFieldSchema,
  }),
  z.null(),
  z.undefined()
]).nullable().optional();

export const groomingServiceSchema = z.object({
  _id: z.string().optional(),
  patientId: PatientFieldSchema,
  service: ServiceTypeSchema,
  specifications: z
    .string()
    .min(1, "Las especificaciones son obligatorias")
    .max(300, "Máximo 300 caracteres"),
  observations: z.string().optional(),
  cost: z.number().min(0, "El costo debe ser un valor positivo"),
  status: ServiceStatusSchema,
  groomer: GroomerFieldSchema,
  date: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: "La fecha del servicio debe ser válida",
  }),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const groomingServicesListSchema = z.array(groomingServiceSchema);
export const groomingServicesListResponseSchema = z.object({
  services: z.array(groomingServiceSchema),
});

export type GroomingService = z.infer<typeof groomingServiceSchema>;

export type GroomingServiceFormData = Pick<
  GroomingService,
  "service" | "specifications" | "observations" | "cost" | "status" | "date"
> & {
  groomer?: string;
};

export type ServiceType = z.infer<typeof ServiceTypeSchema>;
export type ServiceStatus = z.infer<typeof ServiceStatusSchema>;

export type GroomerOption = Pick<Staff, "_id" | "name" | "lastName" | "role">;