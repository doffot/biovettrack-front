import { z } from "zod";

const estadosVenezuela = [
  "Amazonas",
  "Anzoátegui",
  "Apure",
  "Aragua",
  "Barinas",
  "Bolívar",
  "Carabobo",
  "Cojedes",
  "Delta Amacuro",
  "Distrito Capital",
  "Falcón",
  "Guárico",
  "Lara",
  "Mérida",
  "Miranda",
  "Monagas",
  "Nueva Esparta",
  "Portuguesa",
  "Sucre",
  "Táchira",
  "Trujillo",
  "Vargas",
  "Yaracuy",
  "Zulia"
] as const;

/** auth $ veterinary */
const authSchema = z.object({
  name: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string(),
  confirmPassword: z.string(),
  whatsapp: z.string(),
  ci: z.string(),
  cmv: z.string(),
  estado: z.enum(estadosVenezuela).optional,
  runsai: z.string().optional(),
  msds: z.string().optional(),
  somevepa: z.string().optional(),
  confirmed: z.boolean(),
  createdAt: z.date().optional(), // usualmente lo pone Mongoose
  updatedAt: z.date().optional(), // usualmente lo pone Mongoose
  token: z.string()
});

type Auth = z.infer<typeof authSchema>
export type UserLoginForm = Pick<Auth, "email" | "password">;
export type UserRegistrationForm = Pick<Auth,"name" | "lastName" | "email" | "password" | "confirmPassword" | "whatsapp" | "ci" | "cmv" | "estado" | "runsai" | "msds" | "somevepa">;
export type RequestConfirmationCodeForm = Pick<Auth, "email">;
export type ForgotPasswordForm= Pick<Auth, "email">;
export type NewPasswordForm= Pick<Auth, "password" | "confirmPassword">;

export type confirmToken = Pick<Auth, "token">;

// Users

export const userSchema = authSchema.pick({
  name: true,
  lastName: true,
  email: true,
}).extend({
  _id: z.string(),
})
export type User = z.infer<typeof userSchema>;








// ---
// ## Tipos de Utilidad (Grooming)
// ---

// Tipos base según el modelo de Mongoose
export const ServiceTypeSchema = z.enum(["Corte", "Baño", "Corte y Baño"]);
export const PaymentTypeSchema = z.enum([
  "Efectivo",
  "Pago Movil",
  "Zelle",
  "Otro",
]);

// ---
// ## Pacientes
// ---
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

// ---
// ## Dueños
// ---
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

// ---
// ## Exámenes de Laboratorio
// ---
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

// ## Servicios de Peluquería (Grooming) 
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

  // 👇 AÑADE ESTOS CAMPOS (opcionales, porque pueden no venir al crear)
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const groomingServicesListSchema = z.array(groomingServiceSchema);


export const groomingServicesListResponseSchema = z.object({
  services: z.array(groomingServiceSchema),
});

// ---
// ## Tipos Inferidos
// ---
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

export type Owner = z.infer<typeof ownerSchema>;
export type OwnerFormData = Pick<
  Owner,
  "name" | "contact" | "email" | "address"
>;

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