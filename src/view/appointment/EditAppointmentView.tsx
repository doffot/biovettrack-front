// src/views/appointment/EditAppointmentView.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAppointmentById, updateAppointment, getAppointmentsByDateForVeterinarian } from "../../api/appointmentAPI";
import { toast } from "../../components/Toast";
import type { CreateAppointmentForm } from "../../types/appointment";
import AppointmentTimeSelector from "../../components/appointments/AppointmentTimeSelector";
import AppointmentForm from "../../components/appointments/AppointmentForm";

// ✅ Función helper para formatear fecha local
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function EditAppointmentView() {
  const { appointmentId, patientId } = useParams<{ appointmentId: string; patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");

  const { data: appointment, isLoading: loadingAppointment } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: () => getAppointmentById(appointmentId!),
    enabled: !!appointmentId,
  });

  //  Usar formato local para la fecha
  const selectedDateStr = formatLocalDate(selectedDate);
  
  const { data: vetAppointmentsOnDate = [], isLoading: loadingVetAppointments } = useQuery({
    queryKey: ["vetAppointments", selectedDateStr],
    queryFn: () => getAppointmentsByDateForVeterinarian(selectedDateStr),
    enabled: !!appointmentId && mounted,
  });

  useEffect(() => {
    if (appointment) {
      const appointmentDate = new Date(appointment.date);
      setSelectedDate(appointmentDate);
      
      //  Extraer hora de forma local
      const hours = String(appointmentDate.getHours()).padStart(2, '0');
      const minutes = String(appointmentDate.getMinutes()).padStart(2, '0');
      setSelectedTime(`${hours}:${minutes}`);
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
      toast.success(" Cita actualizada con éxito");
      queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
      queryClient.invalidateQueries({ queryKey: ["appointments", patientId] });
      navigate(`/patients/${patientId}/appointments/${appointmentId}`);
    },
    onError: (error: Error) => {
      toast.error(` ${error.message}`);
    },
  });

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleSubmitForm = (data: CreateAppointmentForm) => {
    if (!selectedTime) {
      toast.error("Selecciona una fecha y hora válida");
      return;
    }
    
    // ✅ SOLUCIÓN: Construir el string de fecha manualmente (sin toISOString)
    const dateStr = formatLocalDate(selectedDate);
    
    const formDataWithDate = {
      ...data,
      date: `${dateStr}T${selectedTime}`, // Formato: "2024-01-15T10:00"
    };
    
    console.log("📅 Fecha enviada:", formDataWithDate.date); // Debug
    
    updateMutate(formDataWithDate);
  };

  if (loadingAppointment || loadingVetAppointments) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-vet-primary border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Cargando cita...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-2">Cita no encontrada</h2>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-colors"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className={`-mx-4 lg:-mx-0 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500`}>
      <h3 className="capitalize bg-vet-primary mb-2 rounded-t-md text-center p-2 font-montserrat text-white font-semibold">
        actualizar cita
      </h3>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 lg:px-0">
        <div className="space-y-6">
          <AppointmentTimeSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onTimeSelect={handleTimeSelect}
            disabledHoursData={vetAppointmentsOnDate}
            initialTime={selectedTime}
          />
        </div>

        <div>
          <AppointmentForm
            onSubmit={handleSubmitForm}
            isSubmitting={isPending}
            initialType={appointment.type}
            initialReason={appointment.reason}
            initialObservations={appointment.observations || ""}
            initialDate={appointment.date.slice(0, 16)}
          />
        </div>
      </div>
    </div>
  );
}