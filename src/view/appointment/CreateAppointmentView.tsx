// src/views/appointment/CreateAppointmentView.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../components/Toast";
import { useAuth } from "../../hooks/useAuth";
import type { CreateAppointmentForm } from "../../types/appointment";
import {
  createAppointment,
  getAppointmentsByDateForVeterinarian,
} from "../../api/appointmentAPI";
import AppointmentTimeSelector from "../../components/appointments/AppointmentTimeSelector";
import AppointmentForm from "../../components/appointments/AppointmentForm";

export default function CreateAppointmentView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {  data:user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");

  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const {  data:vetAppointmentsOnDate = []} = useQuery({
    queryKey: ["vetAppointments", selectedDateStr],
    queryFn: () => getAppointmentsByDateForVeterinarian(selectedDateStr),
    enabled: !!user && mounted,
  });

  const { mutate: createMutate, isPending } = useMutation({
    mutationFn: (formData: CreateAppointmentForm) => {
      if (!patientId) throw new Error("ID de paciente no encontrado");
      return createAppointment(formData, patientId);
    },
    onSuccess: () => {
      toast.success("✅ Cita creada con éxito");
      setSelectedTime("");
      setSelectedDate(new Date());
      queryClient.invalidateQueries({ queryKey: ["activeAppointments", patientId] });
      navigate(`/patients/${patientId}`);
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
    createMutate(formDataWithDate);
  };

  if (!patientId) {
    return (
      <div className="mt-10 lg:mt-0">
        <button onClick={() => navigate(-1)} className="text-vet-primary hover:text-vet-accent">
          ← Volver
        </button>
        <p className="text-vet-danger mt-2">ID de paciente no válido</p>
      </div>
    );
  }

  return (
    <div className={`-mx-4 lg:-mx-0 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500`}>
      <h3 className=" capitalize bg-vet-primary mb-2 rounded-t-md text-center p-2 font-montserrat text-white font-semibold">crear cita</h3>
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
          />
        </div>
      </div>
    </div>
  );
}