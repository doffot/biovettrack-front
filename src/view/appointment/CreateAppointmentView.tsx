// src/views/appointment/CreateAppointmentView.tsx
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import BackButton from "../../components/BackButton";
import type { CreateAppointmentForm } from "../../types/appointment";
import { createAppointment } from "../../api/appointmentAPI";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "../../components/Toast";
import { useMutation } from "@tanstack/react-query";
import { Save, Calendar, ClipboardList, MessageCircle } from "lucide-react";

export default function CreateAppointmentView() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [mounted, setMounted] = useState(false);

  const initialValues: CreateAppointmentForm = {
    type: "Consulta",
    date: new Date().toISOString().slice(0, 16), // "YYYY-MM-DDTHH:mm"
    reason: "",
    observations: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (formData: CreateAppointmentForm) => {
      if (!patientId) throw new Error("ID de paciente no encontrado");
      return createAppointment(formData, patientId);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Cita creada con éxito');
      navigate(`/patients/${patientId}`);
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleForm = (formData: CreateAppointmentForm) => mutate(formData);

  if (!patientId) {
    return (
      <div className="mt-10 lg:mt-0">
        <BackButton />
        <p className="text-red-400">ID de paciente no válido</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mt-10 lg:mt-0 mb-6 -mx-4 lg:-mx-0 pt-4 lg:pt-0">
        <div className="flex items-center gap-4 px-4 lg:px-0">
          <BackButton />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Nueva Cita</h1>
            <p className="text-gray-400 text-xs sm:text-sm">
              Programa una cita para este paciente
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className={`-mx-4 lg:-mx-0 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500`}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 mx-4 lg:mx-0">
            <form onSubmit={handleSubmit(handleForm)} noValidate>
              <div className="grid grid-cols-1 gap-5">
                {/* Tipo de cita */}
                <div>
                  <label className="block text-white font-medium mb-2 text-sm">
                    Tipo de cita <span className="text-red-400">*</span>
                  </label>
                  <div className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg border
                    ${errors.type 
                      ? 'bg-red-500/10 border-red-500/50' 
                      : 'bg-gray-700/50 border-gray-700 hover:border-primary/50 focus-within:border-primary'
                    } transition-colors
                  `}>
                    <div className={`p-1 rounded bg-gray-900 ${errors.type ? 'text-red-500' : 'text-primary'}`}>
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <select
                      {...register("type", {
                        required: "El tipo de cita es requerido",
                      })}
                      className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm appearance-none custom-select"
                    >
                      <option value="">Selecciona un tipo</option>
                      <option value="Consulta">Consulta</option>
                      <option value="Peluquería">Peluquería</option>
                      <option value="Laboratorio">Laboratorio</option>
                      <option value="Vacuna">Vacuna</option>
                      <option value="Cirugía">Cirugía</option>
                      <option value="Tratamiento">Tratamiento</option>
                    </select>
                  </div>
                  {errors.type && (
                    <p className="mt-2 text-red-400 text-xs flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full" />
                      {errors.type.message}
                    </p>
                  )}
                </div>

                {/* Fecha y hora */}
                <div>
                  <label className="block text-white font-medium mb-2 text-sm">
                    Fecha y hora <span className="text-red-400">*</span>
                  </label>
                  <div className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg border
                    ${errors.date 
                      ? 'bg-red-500/10 border-red-500/50' 
                      : 'bg-gray-700/50 border-gray-700 hover:border-primary/50 focus-within:border-primary'
                    } transition-colors
                  `}>
                    <div className={`p-1 rounded bg-gray-900 ${errors.date ? 'text-red-500' : 'text-primary'}`}>
                      <Calendar className="w-5 h-5" />
                    </div>
                    <input
                      type="datetime-local"
                      {...register("date", {
                        required: "La fecha es requerida",
                      })}
                      className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm"
                    />
                  </div>
                  {errors.date && (
                    <p className="mt-2 text-red-400 text-xs flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full" />
                      {errors.date.message}
                    </p>
                  )}
                </div>

                {/* Motivo */}
                <div>
                  <label className="block text-white font-medium mb-2 text-sm">
                    Motivo / Detalle <span className="text-red-400">*</span>
                  </label>
                  <div className={`
                    flex items-start gap-3 px-4 py-3 rounded-lg border
                    ${errors.reason 
                      ? 'bg-red-500/10 border-red-500/50' 
                      : 'bg-gray-700/50 border-gray-700 hover:border-primary/50 focus-within:border-primary'
                    } transition-colors
                  `}>
                    <div className={`p-1 mt-1 rounded bg-gray-900 ${errors.reason ? 'text-red-500' : 'text-primary'}`}>
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <textarea
                      {...register("reason", {
                        required: "El motivo es requerido",
                        minLength: { value: 2, message: "Mínimo 2 caracteres" },
                        maxLength: { value: 200, message: "Máximo 200 caracteres" },
                      })}
                      placeholder="Ej: Control postoperatorio, Vacuna antirrábica..."
                      rows={3}
                      className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm resize-none"
                    />
                  </div>
                  {errors.reason && (
                    <p className="mt-2 text-red-400 text-xs flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full" />
                      {errors.reason.message}
                    </p>
                  )}
                </div>

                {/* Observaciones */}
                <div>
                  <label className="block text-white font-medium mb-2 text-sm">
                    Observaciones adicionales
                  </label>
                  <div className="flex items-start gap-3 px-4 py-3 rounded-lg border bg-gray-700/50 border-gray-700 hover:border-primary/50 focus-within:border-primary transition-colors">
                    <div className="p-1 mt-1 rounded bg-gray-900 text-primary">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <textarea
                      {...register("observations", {
                        maxLength: { value: 500, message: "Máximo 500 caracteres" },
                      })}
                      placeholder="Ej: El paciente debe venir en ayunas de 8 horas."
                      rows={3}
                      className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm resize-none"
                    />
                  </div>
                  {errors.observations && (
                    <p className="mt-2 text-red-400 text-xs flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full" />
                      {errors.observations.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-6 mt-6">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 sm:px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 sm:px-6 py-3 rounded-lg bg-primary hover:bg-green-400 text-space-navy font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {isPending ? (
                    <span className="w-5 h-5 border-2 border-space-navy border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 text-space-navy" />
                  )}
                  {isPending ? "Creando..." : "Crear Cita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}