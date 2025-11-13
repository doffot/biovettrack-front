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

// Schema para paciente populado (datos mínimos que vienen del backend)
const populatedPatientSchema = z.object({
  _id: z.string(),
  name: z.string(),
  photo: z.string().nullable().optional(),
  owner: z.string(), // ID del owner
  mainVet: z.string(),
});

// Schema para cita con patient como string O como objeto poblado
export const appointmentSchema = z.object({
  _id: z.string(),
  patient: z.union([
    z.string(), // Cuando no está poblado (solo ID)
    populatedPatientSchema // Cuando está poblado
  ]),
  type: z.enum(appointmentTypes),
  date: z.string(),
  status: z.enum(appointmentStatuses),
  reason: z.string(),
  observations: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Appointment = z.infer<typeof appointmentSchema>;

// Tipo auxiliar para cuando sabemos que patient está poblado
export type AppointmentWithPatient = Omit<Appointment, 'patient'> & {
  patient: {
    _id: string;
    name: string;
    photo?: string | null;
    owner: string;
    mainVet: string;
  };
};

export type CreateAppointmentForm = Pick<
  Appointment,
  "type" | "date" | "reason" | "observations"
>;

export type UpdateAppointmentStatusForm = Pick<Appointment, "status">;

export interface PopulatedAppointment {
  _id: string;
  patient: {
    _id: string;
    name: string;
    photo?: string | null;
    owner: {
      _id: string;
      name: string;
      lastName?: string;
      contact?: string;
      email?: string;
      address?: string;
    };
    mainVet: {
      _id: string;
      name: string;
      lastName?: string;
    };
  };
  type: string;
  date: string;
  status: string;
  reason: string;
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
}

