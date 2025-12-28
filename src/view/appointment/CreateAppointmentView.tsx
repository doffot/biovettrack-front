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
import PrepaymentModal from "../../components/appointments/PrepaymentModal";

type PendingAppointmentData = {
  formData: CreateAppointmentForm;
  dateWithTime: Date;
};

// Helper para formatear fecha local sin conversión a UTC
const formatLocalDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function CreateAppointmentView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Estado para el modal de prepago
  const [showPrepaymentModal, setShowPrepaymentModal] = useState(false);
  const [pendingAppointment, setPendingAppointment] = useState<PendingAppointmentData | null>(null);

  // Formatear fecha para query sin problemas de zona horaria
  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  const { data: vetAppointmentsOnDate = [] } = useQuery({
    queryKey: ["vetAppointments", selectedDateStr],
    queryFn: () => getAppointmentsByDateForVeterinarian(selectedDateStr),
    enabled: !!user && mounted,
  });

  const { mutate: createMutate, isPending } = useMutation({
    mutationFn: (formData: CreateAppointmentForm) => {
      if (!patientId) throw new Error("ID de paciente no encontrado");
      return createAppointment(formData, patientId);
    },
    onSuccess: (appointment) => {
      const prepaidAmount = appointment.prepaidAmount || 0;

      if (prepaidAmount > 0) {
        toast.success(`✅ Cita creada con anticipo de $${prepaidAmount.toFixed(2)}`);
      } else {
        toast.success("✅ Cita creada con éxito");
      }

      // Limpiar estados
      setSelectedTime("");
      setSelectedDate(new Date());
      setPendingAppointment(null);
      setShowPrepaymentModal(false);

      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ["activeAppointments", patientId] });
      queryClient.invalidateQueries({ queryKey: ["appointments", patientId] });
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      queryClient.invalidateQueries({ queryKey: ["vetAppointments"] });

      // Redirigir al detalle del paciente
      navigate(`/patients/${patientId}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setShowPrepaymentModal(false);
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

    // Guardar datos pendientes y mostrar modal
    setPendingAppointment({
      formData: data,
      dateWithTime,
    });
    setShowPrepaymentModal(true);
  };

  const handleConfirmWithPrepayment = (amount: number) => {
    if (!pendingAppointment) return;

    const finalFormData: CreateAppointmentForm = {
      ...pendingAppointment.formData,
      date: formatLocalDateTime(pendingAppointment.dateWithTime),
      prepaidAmount: amount,
    };

    createMutate(finalFormData);
  };

  const handleSkipPrepayment = () => {
    if (!pendingAppointment) return;

    const finalFormData: CreateAppointmentForm = {
      ...pendingAppointment.formData,
      date: formatLocalDateTime(pendingAppointment.dateWithTime),
      prepaidAmount: 0,
    };

    createMutate(finalFormData);
  };

  const handleCloseModal = () => {
    setShowPrepaymentModal(false);
    setPendingAppointment(null);
  };

  if (!patientId) {
    return (
      <div className="mt-10 lg:mt-0">
        <button
          onClick={() => navigate(-1)}
          className="text-vet-primary hover:text-vet-accent"
        >
          ← Volver
        </button>
        <p className="text-vet-danger mt-2">ID de paciente no válido</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={`
          -mx-4 lg:-mx-0 
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} 
          transition-all duration-500
        `}
      >
        <h3 className="capitalize bg-vet-primary mb-2 rounded-t-md text-center p-2 font-montserrat text-white font-semibold">
          Crear Cita
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
            />
          </div>
        </div>
      </div>

      {/* Modal de Prepago */}
      <PrepaymentModal
        isOpen={showPrepaymentModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmWithPrepayment}
        onSkip={handleSkipPrepayment}
        appointmentType={pendingAppointment?.formData.type || ""}
        isLoading={isPending}
      />
    </>
  );
}