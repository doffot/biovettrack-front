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

export const appointmentSchema = z.object({
  _id: z.string(),
  patient: z.string(),
  type: z.enum(appointmentTypes),
  date: z.string(),
  status: z.enum(appointmentStatuses),
  reason: z.string(),
  observations: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Appointment = z.infer<typeof appointmentSchema>;
export type CreateAppointmentForm = Pick<
  Appointment,
  "type" | "date" | "reason" | "observations"
>;
export type UpdateAppointmentStatusForm = Pick<Appointment, "status">;