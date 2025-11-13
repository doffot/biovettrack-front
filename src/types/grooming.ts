// src/types/grooming.ts
import { z } from "zod";

export const ServiceTypeSchema = z.enum(["Corte", "Baño", "Corte y Baño"]);
export const ServiceStatusSchema = z.enum(["Programado", "En progreso", "Completado", "Cancelado"]);
export const PaymentStatusSchema = z.enum(["Pendiente", "Pagado", "Parcial", "Cancelado"]);

// 👇 Esquema flexible para owner: string, objeto, null o undefined
const OwnerFieldSchema = z.union([
  z.string().min(1, "El dueño es obligatorio"),
  z.object({
    _id: z.string(),
    name: z.string(),
  }),
  z.null(),
  z.undefined()
]).nullable().optional();

// 👇 Esquema flexible para paymentMethod
const PaymentMethodFieldSchema = z.union([
  z.string().min(1, "El método de pago es obligatorio"),
  z.object({
    _id: z.string(),
    name: z.string(),
    currency: z.string(),
    paymentMode: z.string(),
  }),
  z.null(),
  z.undefined()
]).nullable().optional();

// 👇 Esquema flexible para groomer
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

// 👇 Esquema flexible para patientId
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

// ✅ Esquema principal: 100% compatible con tu backend
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
  paymentMethod: PaymentMethodFieldSchema,
  paymentReference: z.string().optional(),
  status: ServiceStatusSchema,
  groomer: GroomerFieldSchema,
  paymentStatus: PaymentStatusSchema,
  amountPaid: z.number().min(0).default(0),
  date: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: "La fecha del servicio debe ser válida",
  }),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// ✅ Esquemas para listas y respuestas
export const groomingServicesListSchema = z.array(groomingServiceSchema);

export const groomingServicesListResponseSchema = z.object({
  services: z.array(groomingServiceSchema),
});

// ✅ Tipos derivados
export type GroomingService = z.infer<typeof groomingServiceSchema>;

export type GroomingServiceFormData = Pick<
  GroomingService,
  | "patientId"
  | "service"
  | "specifications"
  | "observations"
  | "cost"
  | "paymentMethod"
  | "paymentReference"
  | "status"
  | "paymentStatus"
  | "amountPaid"
  | "date"
>;

// ✅ Tipos auxiliares reutilizables
export type ServiceType = z.infer<typeof ServiceTypeSchema>;
export type ServiceStatus = z.infer<typeof ServiceStatusSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;