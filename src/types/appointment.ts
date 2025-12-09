// src/types/appointment.ts

import { z } from "zod";

export const appointmentTypes = [
  "Consulta",
  "Peluquería",
  "Laboratorio",
  "Vacuna",
  "Cirugía",
  "Tratamiento"
] as const;

export const appointmentStatuses = [
  "Programada",
  "Completada",
  "Cancelada",
  "No asistió"
] as const;

export type AppointmentStatus = typeof appointmentStatuses[number];

const ownerSchema = z.object({
  _id: z.string(),
  name: z.string(),
  lastName: z.string().optional(),
  contact: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
});

const vetSchema = z.object({
  _id: z.string(),
  name: z.string(),
  lastName: z.string().optional(),
  specialty: z.string().optional(),
});

const populatedPatientSchema = z.object({
  _id: z.string(),
  name: z.string(),
  photo: z.string().nullable().optional(),
  owner: z.union([z.string(), ownerSchema]),
  mainVet: z.union([z.string(), vetSchema]),
  species: z.string().optional(),
  breed: z.string().optional(),
  color: z.string().optional(),
  birthDate: z.string().optional(),
  identification: z.string().optional(),
});

export const appointmentSchema = z.object({
  _id: z.string(),
  patient: z.any(), 
  type: z.enum(appointmentTypes),
  date: z.string(),
  status: z.enum(appointmentStatuses), 
  reason: z.string(),
  observations: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Appointment = z.infer<typeof appointmentSchema>;

export type AppointmentWithPatient = Omit<Appointment, 'patient'> & {
  patient: z.infer<typeof populatedPatientSchema>;
};

export type CreateAppointmentForm = Pick<
  Appointment,
  "type" | "date" | "reason" | "observations"
>;

export type UpdateAppointmentStatusForm = Pick<Appointment, "status">;

export const appointmentTypesValues = [...appointmentTypes];