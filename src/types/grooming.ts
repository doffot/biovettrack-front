// src/types/grooming.ts
import { z } from "zod";
import type { Staff } from "./staff";

// ✅ Schemas base
export const ServiceTypeSchema = z.enum(["Corte", "Baño", "Corte y Baño"]);
export const ServiceStatusSchema = z.enum(["Programado", "En progreso", "Completado", "Cancelado"]);
export const PaymentStatusSchema = z.enum(["Pendiente", "Parcial", "Pagado"]);

// ✅ Schemas para campos relacionados (pueden ser string ID u objeto poblado)
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

const PaymentMethodFieldSchema = z.union([
  z.string(),
  z.object({
    _id: z.string(),
    name: z.string(),
    requiresReference: z.boolean().optional(),
  }),
  z.null(),
  z.undefined()
]).nullable().optional();

// ✅ Schema principal del servicio de grooming
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
  // ✅ Campos de pago
  paymentMethod: PaymentMethodFieldSchema,
  paymentStatus: PaymentStatusSchema.optional(),
  amountPaid: z.number().min(0, "El monto pagado debe ser positivo").optional(),
  paymentReference: z.string().optional(),
  // ✅ Timestamps
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// ✅ Schemas para listas y respuestas
export const groomingServicesListSchema = z.array(groomingServiceSchema);
export const groomingServicesListResponseSchema = z.object({
  services: z.array(groomingServiceSchema),
});

// ✅ Tipo principal inferido del schema
export type GroomingService = z.infer<typeof groomingServiceSchema>;

// ✅ Tipo para el formulario (campos editables)
export type GroomingServiceFormData = {
  // Campos del servicio
  date: string;
  service: "Corte" | "Baño" | "Corte y Baño";
  cost: number;
  groomer?: string;
  status: "Programado" | "En progreso" | "Completado" | "Cancelado";
  specifications: string;
  observations?: string;
  // Campos de pago
  paymentMethod?: string;
  paymentStatus?: "Pendiente" | "Parcial" | "Pagado";
  amountPaid?: number;
  paymentReference?: string;
};

// ✅ Tipos inferidos de los schemas enum
export type ServiceType = z.infer<typeof ServiceTypeSchema>;
export type ServiceStatus = z.infer<typeof ServiceStatusSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

// ✅ Tipo para opciones de peluquero (dropdown)
export type GroomerOption = Pick<Staff, "_id" | "name" | "lastName" | "role">;

// ✅ Tipo para método de pago
export type PaymentMethodOption = {
  _id: string;
  name: string;
  requiresReference?: boolean;
  isActive?: boolean;
};

// ✅ Tipo para crear un nuevo servicio (sin _id)
export type CreateGroomingServiceData = Omit<GroomingServiceFormData, "status"> & {
  patientId: string;
  status?: ServiceStatus;
};

// ✅ Tipo para actualizar un servicio
export type UpdateGroomingServiceData = {
  formData: GroomingServiceFormData;
  groomingId: string;
};

// ✅ Tipo para el servicio poblado (con objetos en lugar de IDs)
export type GroomingServicePopulated = Omit<GroomingService, "groomer" | "patientId" | "paymentMethod"> & {
  groomer?: {
    _id: string;
    name: string;
    lastName: string;
  };
  patientId?: {
    _id: string;
    name: string;
    species?: string;
    breed?: string;
    owner?: {
      _id: string;
      name: string;
    };
  };
  paymentMethod?: {
    _id: string;
    name: string;
    requiresReference?: boolean;
  };
};