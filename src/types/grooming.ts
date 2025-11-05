// src/types/grooming.ts
import { z } from "zod";

export const ServiceTypeSchema = z.enum(["Corte", "Baño", "Corte y Baño"]);
export const PaymentTypeSchema = z.enum([
  "Efectivo",
  "Pago Movil",
  "Zelle",
  "Otro",
]);

export const groomingServiceSchema = z.object({
  _id: z.string().optional(),
  
  patientId: z.union([
    z.string().min(1, "El ID del paciente es obligatorio"),
    z.object({
      _id: z.string(),
      name: z.string().optional(),
      species: z.string().optional(),
      breed: z.string().optional(),
    }).optional()
  ]),

  service: ServiceTypeSchema,

  specifications: z
    .string()
    .min(1, "Las especificaciones son obligatorias")
    .max(300, "Máximo 300 caracteres"),

  observations: z.string().optional(),

  cost: z.number().min(0, "El costo debe ser un valor positivo"),

  paymentType: PaymentTypeSchema,

  exchangeRate: z
    .number()
    .min(0, "La tasa de cambio debe ser positiva")
    .optional(),

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
  | "patientId"
  | "service"
  | "specifications"
  | "observations"
  | "cost"
  | "paymentType"
  | "exchangeRate"
  | "date"
>;