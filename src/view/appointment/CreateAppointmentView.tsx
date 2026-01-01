// src/views/appointment/CreateAppointmentView.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, ArrowLeft, CalendarPlus } from "lucide-react";
import { toast } from "../../components/Toast";
import { useAuth } from "../../hooks/useAuth";
import type { CreateAppointmentForm, AppointmentType } from "../../types/appointment";
import {
  createAppointment,
  getAppointmentsByDateForVeterinarian,
} from "../../api/appointmentAPI";
import { getStaffList } from "../../api/staffAPI";
import {
  StaffSelector,
  CategorySelector,
  DateTimeSelector,
  AppointmentDetails,
} from "../../components/appointments/create";
import PrepaymentModal from "../../components/appointments/PrepaymentModal";

type PendingAppointmentData = {
  formData: CreateAppointmentForm;
  dateWithTime: Date;
};

type FormErrors = {
  type?: string;
  date?: string;
  time?: string;
  reason?: string;
  staff?: string;
};

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
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<AppointmentType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [reason, setReason] = useState("");
  const [observations, setObservations] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const [showPrepaymentModal, setShowPrepaymentModal] = useState(false);
  const [pendingAppointment, setPendingAppointment] = useState<PendingAppointmentData | null>(null);

  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  const { data: staffList = [], isLoading: isLoadingStaff } = useQuery({
    queryKey: ["staff"],
    queryFn: getStaffList,
    enabled: mounted,
  });

  const { data: vetAppointmentsOnDate = [] } = useQuery({
    queryKey: ["vetAppointments", selectedDateStr, selectedStaffId],
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

      resetForm();

      queryClient.invalidateQueries({ queryKey: ["activeAppointments", patientId] });
      queryClient.invalidateQueries({ queryKey: ["appointments", patientId] });
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      queryClient.invalidateQueries({ queryKey: ["vetAppointments"] });

      navigate(`/patients/${patientId}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setShowPrepaymentModal(false);
    },
  });

  useEffect(() => {
    setMounted(true);
    if (user?._id) {
      setSelectedStaffId(user._id);
    }
  }, [user]);

  const resetForm = () => {
    setSelectedTime("");
    setSelectedDate(new Date());
    setSelectedType(null);
    setReason("");
    setObservations("");
    setPendingAppointment(null);
    setShowPrepaymentModal(false);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!selectedStaffId) {
      newErrors.staff = "Selecciona quién atenderá la cita";
    }

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

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const dateWithTime = new Date(selectedDate);
    dateWithTime.setHours(hours, minutes, 0, 0);

    const formData: CreateAppointmentForm = {
      type: selectedType!,
      date: "",
      reason: reason.trim(),
      observations: observations.trim() || undefined,
      assignedTo: selectedStaffId || undefined,
    };

    setPendingAppointment({ formData, dateWithTime });
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
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-vet-muted hover:text-vet-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <p className="text-vet-danger mt-4">ID de paciente no válido</p>
      </div>
    );
  }

  return (
    <>
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
                <CalendarPlus className="w-6 h-6 text-vet-primary" />
                Nueva Cita
              </h1>
              <p className="text-sm text-vet-muted">
                Completa los datos para agendar la cita
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          {/* 1. Selector de Staff/Veterinario */}
          <StaffSelector
            staffList={staffList}
            selectedStaffId={selectedStaffId}
            onSelect={setSelectedStaffId}
            currentVetId={user?._id}
            currentVetName={user?.name}
            currentVetLastName={user?.lastName}
            isLoading={isLoadingStaff}
          />
          {errors.staff && (
            <p className="text-sm text-vet-danger font-medium -mt-2 ml-1">
              ⚠️ {errors.staff}
            </p>
          )}

          {/* 2. Selector de Categoría/Tipo */}
          <CategorySelector
            selectedType={selectedType}
            onSelect={setSelectedType}
          />
          {errors.type && (
            <p className="text-sm text-vet-danger font-medium -mt-2 ml-1">
              ⚠️ {errors.type}
            </p>
          )}

          {/* 3. Selector de Fecha y Hora */}
          <DateTimeSelector
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateChange={setSelectedDate}
            onTimeSelect={setSelectedTime}
            disabledHoursData={vetAppointmentsOnDate}
          />
          {errors.time && (
            <p className="text-sm text-vet-danger font-medium -mt-2 ml-1">
              ⚠️ {errors.time}
            </p>
          )}

          {/* 4. Motivo y Observaciones */}
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
                  Agendar Cita
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Prepago */}
      <PrepaymentModal
        isOpen={showPrepaymentModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmWithPrepayment}
        onSkip={handleSkipPrepayment}
        appointmentType={selectedType || ""}
        isLoading={isPending}
      />
    </>
  );
}