// src/views/appointment/EditAppointmentView.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAppointmentById, updateAppointment, getAppointmentsByDateForVeterinarian } from "../../api/appointmentAPI";
import { toast } from "../../components/Toast";
import type { CreateAppointmentForm } from "../../types/appointment";
import AppointmentTimeSelector from "../../components/appointments/AppointmentTimeSelector";
import AppointmentForm from "../../components/appointments/AppointmentForm";

export default function EditAppointmentView() {
  const { appointmentId, patientId } = useParams<{ appointmentId: string; patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");

  const {  data:appointment, isLoading: loadingAppointment } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: () => getAppointmentById(appointmentId!),
    enabled: !!appointmentId,
  });

  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const {  data:vetAppointmentsOnDate = [], isLoading: loadingVetAppointments } = useQuery({
    queryKey: ["vetAppointments", selectedDateStr],
    queryFn: () => getAppointmentsByDateForVeterinarian(selectedDateStr),
    enabled: !!appointmentId && mounted,
  });

  useEffect(() => {
    if (appointment) {
      const appointmentDate = new Date(appointment.date);
      setSelectedDate(appointmentDate);
      setSelectedTime(appointmentDate.toTimeString().slice(0, 5));
    }
  }, [appointment]);

  const { mutate: updateMutate, isPending } = useMutation({
    mutationFn: (formData: CreateAppointmentForm) => {
      if (!appointmentId) throw new Error("ID de cita no encontrado");
      return updateAppointment(appointmentId, formData);
    },
    onSuccess: () => {
      toast.success("✅ Cita actualizada con éxito");
      queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
      queryClient.invalidateQueries({ queryKey: ["appointments", patientId] });
      navigate(`/patients/${patientId}/appointments/${appointmentId}`);
    },
    onError: (error: Error) => {
      toast.error(` ${error.message}`);
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleSubmitForm = (data: CreateAppointmentForm) => {
    if (!selectedTime) {
      toast.error("Selecciona una fecha y hora válida");
      return;
    }
    
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const dateWithTime = new Date(selectedDate);
    dateWithTime.setHours(hours, minutes, 0, 0);
    
    const formDataWithDate = {
      ...data,
      date: dateWithTime.toISOString().slice(0, 16),
    };
    
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
        <h3 className=" capitalize bg-vet-primary mb-2 rounded-t-md text-center p-2 font-montserrat text-white font-semibold">actualizar cita</h3>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 lg:px-0">
        {/* Columna Izquierda: Selector de fecha y hora */}
        <div className="space-y-6">
          <AppointmentTimeSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onTimeSelect={handleTimeSelect}
            disabledHoursData={vetAppointmentsOnDate}
            initialTime={selectedTime}
          />
        </div>

        {/* Columna Derecha: Formulario */}
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