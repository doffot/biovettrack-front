// src/views/grooming/CreateGroomingServiceView.tsx
import  { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Scissors, ArrowLeft } from "lucide-react";

// Importar el componente de formulario separado

// API

// Types
import type { GroomingServiceFormData } from "../../types";
import { createGroomingService } from "../../api/groomingAPI";
import { toast } from "../../components/Toast";
import GroomingServiceForm from "../../components/grooming/groomingForm";

export default function CreateGroomingServiceView() {
  const { patientId } = useParams<{ patientId: string }>(); 
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<GroomingServiceFormData>({
    defaultValues: {
      patientId: patientId || "",
      date: "",
      service: undefined,
      specifications: "",
      observations: "",
      cost: undefined,
      paymentType: undefined,
      exchangeRate: undefined,
    },
  });

  // Asegurar que patientId esté configurado
  useEffect(() => {
    if (patientId) {
      setValue("patientId", patientId);
    }
  }, [patientId, setValue]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: GroomingServiceFormData) => {
      if (!patientId) {
        throw new Error("ID del paciente no encontrado en la URL");
      }

      // Preparar los datos para el envío
      const serviceData: GroomingServiceFormData = {
        ...data,
        patientId,
        cost: Number(data.cost),
        exchangeRate: data.exchangeRate ? Number(data.exchangeRate) : undefined,
      };

      return await createGroomingService(serviceData, patientId);
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al registrar el servicio de estética");
    },
    onSuccess: () => {
      toast.success("Servicio de Estética registrado con éxito");
      // Invalida la caché de servicios de estética para ese paciente
      queryClient.invalidateQueries({ queryKey: ["groomingServices", { patientId }] }); 
      // Navega de vuelta a la vista del paciente
      navigate(`/patients/${patientId}`); 
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = (data: GroomingServiceFormData) => {
    // Validación adicional antes de enviar
    if (!data.date) {
      toast.error("La fecha del servicio es obligatoria");
      return;
    }
    if (!data.service) {
      toast.error("El tipo de servicio es obligatorio");
      return;
    }
    if (!data.specifications || data.specifications.trim() === "") {
      toast.error("Las especificaciones son obligatorias");
      return;
    }
    if (!data.cost || data.cost <= 0) {
      toast.error("El costo debe ser mayor a 0");
      return;
    }
    if (!data.paymentType) {
      toast.error("El tipo de pago es obligatorio");
      return;
    }

    mutate(data);
  };

  return (
    <>
      {/* Header Mejorado */}
      <div className="fixed top-15 left-0 right-0 lg:left-64 z-30 bg-white border-b border-vet-muted/20 shadow-sm">
        <div className="px-6 lg:px-8 pt-6 pb-4">
          <div className="flex items-center justify-between gap-6 mb-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* BackButton siempre visible */}
              <Link
                to={`/patients/${patientId}`}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-vet-light hover:bg-vet-primary/10 text-vet-primary transition-colors flex-shrink-0"
                title="Volver al paciente"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-vet-primary/10 rounded-lg">
                    <Scissors className="w-6 h-6 text-vet-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-vet-text">
                    Nuevo Servicio de Peluquería
                  </h1>
                </div>
                <p className="text-vet-muted text-sm">
                  Registra un nuevo servicio de estética para el paciente
                </p>
              </div>
            </div>

            {/* Botón Guardar para desktop */}
            <div className="hidden sm:block flex-shrink-0">
              <button
                type="submit"
                form="grooming-form"
                disabled={isPending}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {isPending ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {isPending ? "Guardando..." : "Guardar Servicio"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Espaciador para el header fijo */}
      <div className="h-40"></div>

      {/* Formulario */}
      <div className={`${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <form id="grooming-form" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Componente de Formulario Separado */}
              <GroomingServiceForm register={register} errors={errors} />

              {/* Botones para móvil */}
              <div className="sm:hidden flex flex-col gap-3 pt-6 mt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold transition-all duration-200 disabled:opacity-50"
                >
                  {isPending ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isPending ? "Guardando..." : "Guardar Servicio"}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate(`/patients/${patientId}`)}
                  className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>

              {/* Botón Cancelar para desktop */}
              <div className="hidden sm:flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate(`/patients/${patientId}`)}
                  className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}