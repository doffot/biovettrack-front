// src/views/appointment/EditAppointmentView.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, ArrowLeft, CalendarClock } from "lucide-react";
import { getAppointmentById, updateAppointment, getAppointmentsByDateForVeterinarian } from "../../api/appointmentAPI";
import { toast } from "../../components/Toast";
import type { CreateAppointmentForm, AppointmentType } from "../../types/appointment";
import {
  CategorySelector,
  DateTimeSelector,
  AppointmentDetails,
} from "../../components/appointments/create";

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type FormErrors = {
  type?: string;
  time?: string;
  reason?: string;
};

export default function EditAppointmentView() {
  const { appointmentId, patientId } = useParams<{ appointmentId: string; patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  
  // Estados del formulario
  const [selectedType, setSelectedType] = useState<AppointmentType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [reason, setReason] = useState("");
  const [observations, setObservations] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const { data: appointment, isLoading: loadingAppointment } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: () => getAppointmentById(appointmentId!),
    enabled: !!appointmentId,
  });

  const selectedDateStr = formatLocalDate(selectedDate);
  
  const { data: vetAppointmentsOnDate = [], isLoading: loadingVetAppointments } = useQuery({
    queryKey: ["vetAppointments", selectedDateStr],
    queryFn: () => getAppointmentsByDateForVeterinarian(selectedDateStr),
    enabled: !!appointmentId && mounted,
  });

  // Cargar datos de la cita existente
  useEffect(() => {
    if (appointment) {
      const appointmentDate = new Date(appointment.date);
      setSelectedDate(appointmentDate);
      
      const hours = String(appointmentDate.getHours()).padStart(2, '0');
      const minutes = String(appointmentDate.getMinutes()).padStart(2, '0');
      setSelectedTime(`${hours}:${minutes}`);
      
      setSelectedType(appointment.type);
      setReason(appointment.reason);
      setObservations(appointment.observations || "");
    }
  }, [appointment]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { mutate: updateMutate, isPending } = useMutation({
    mutationFn: (formData: CreateAppointmentForm) => {
      if (!appointmentId) throw new Error("ID de cita no encontrado");
      return updateAppointment(appointmentId, formData);
    },
    onSuccess: () => {
      toast.success("✅ Cita actualizada con éxito");
      queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
      queryClient.invalidateQueries({ queryKey: ["appointments", patientId] });
      queryClient.invalidateQueries({ queryKey: ["vetAppointments"] });
      navigate(`/patients/${patientId}/appointments/${appointmentId}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!selectedType) {
      newErrors.type = "Selecciona el tipo de cita";
    }

    if (!selectedTime) {
      newErrors.time = "Selecciona una hora";
    }

    if (!reason.trim()) {
      newErrors.reason = "El motivo es requerido";
    } else if (reason.length < 2) {
      newErrors.reason = "Mínimo 2 caracteres";
    } else if (reason.length > 200) {
      newErrors.reason = "Máximo 200 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }
    
    const dateStr = formatLocalDate(selectedDate);
    
    const formData: CreateAppointmentForm = {
      type: selectedType!,
      date: `${dateStr}T${selectedTime}`,
      reason: reason.trim(),
      observations: observations.trim() || undefined,
    };
    
    updateMutate(formData);
  };

  if (loadingAppointment || loadingVetAppointments) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-vet-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-vet-muted font-medium">Cargando cita...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-vet-text mb-4">Cita no encontrada</h2>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-vet-light hover:bg-vet-accent hover:text-white text-vet-text font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      </div>
    );
  }

  return (
    <div
      className={`
        max-w-4xl mx-auto px-4 py-6
        ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} 
        transition-all duration-500
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-vet-light text-vet-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-vet-text flex items-center gap-2 font-montserrat">
              <CalendarClock className="w-6 h-6 text-vet-primary" />
              Editar Cita
            </h1>
            <p className="text-sm text-vet-muted">
              Modifica los datos de la cita
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="space-y-4">
        {/* 1. Selector de Categoría/Tipo */}
        <CategorySelector
          selectedType={selectedType}
          onSelect={setSelectedType}
        />
        {errors.type && (
          <p className="text-sm text-vet-danger font-medium -mt-2 ml-1">
            ⚠️ {errors.type}
          </p>
        )}

        {/* 2. Selector de Fecha y Hora */}
        <DateTimeSelector
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onDateChange={setSelectedDate}
          onTimeSelect={setSelectedTime}
          disabledHoursData={vetAppointmentsOnDate.filter(apt => apt._id !== appointmentId)}
        />
        {errors.time && (
          <p className="text-sm text-vet-danger font-medium -mt-2 ml-1">
            ⚠️ {errors.time}
          </p>
        )}

        {/* 3. Motivo y Observaciones */}
        <AppointmentDetails
          reason={reason}
          observations={observations}
          onReasonChange={setReason}
          onObservationsChange={setObservations}
          errors={{ reason: errors.reason }}
        />

        {/* Botones de acción */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl border-2 border-vet-light text-vet-text font-semibold hover:bg-vet-light transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 px-6 py-3 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-soft hover:shadow-card"
          >
            {isPending ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Actualizar Cita
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}