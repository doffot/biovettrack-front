// src/views/grooming/CreateGroomingServiceView.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Save, Scissors, ArrowLeft, PawPrint } from "lucide-react";

// API
import { createGroomingService } from "../../api/groomingAPI";
import { getPatientById } from "../../api/patientAPI";

// Types
import type { GroomingServiceFormData } from "../../types";
import { toast } from "../../components/Toast";
import GroomingServiceForm from "../../components/grooming/groomingForm";
import { getPaymentMethods } from "../../api/paymentAPI";

export default function CreateGroomingServiceView() {
  const { patientId } = useParams<{ patientId: string }>(); 
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  // Obtener información del paciente
  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  // Obtener métodos de pago del veterinario
  const { data: paymentMethods = []} = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: getPaymentMethods,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<GroomingServiceFormData>({
    defaultValues: {
      patientId: patientId || "",
      date: new Date().toISOString().split('T')[0], // Fecha actual por defecto
      service: undefined,
      specifications: "",
      observations: "",
      cost: undefined,
      paymentMethod: "",
      paymentReference: "",
      status: "Programado",
      paymentStatus: "Pendiente",
      amountPaid: 0,
    },
  });

  // Observar el método de pago seleccionado
  const selectedPaymentMethod = watch("paymentMethod");
  const selectedPaymentMethodData = paymentMethods.find(
    (method: any) => method._id === selectedPaymentMethod
  );

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
        amountPaid: Number(data.amountPaid) || 0,
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
    if (!data.paymentMethod) {
      toast.error("El método de pago es obligatorio");
      return;
    }

    // Validar referencia si el método de pago lo requiere
    if (selectedPaymentMethodData?.requiresReference && !data.paymentReference) {
      toast.error("Este método de pago requiere número de referencia");
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
                  <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-vet-text truncate">
                      Nuevo Servicio de Peluquería
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <PawPrint className="w-4 h-4 text-vet-muted flex-shrink-0" />
                      <span className="text-vet-primary font-semibold text-sm truncate">
                        {isLoadingPatient ? (
                          "Cargando mascota..."
                        ) : patient ? (
                          `Para: ${patient.name}`
                        ) : (
                          "Mascota no encontrada"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-vet-muted text-sm">
                  Registra un nuevo servicio de estética para el paciente
                </p>
              </div>
            </div>

            {/* Foto de la mascota en lugar del botón Guardar */}
            <div className="hidden sm:block flex-shrink-0">
              {isLoadingPatient ? (
                <div className="w-16 h-16 rounded-xl bg-gray-200 animate-pulse"></div>
              ) : patient?.photo ? (
                <img
                  src={patient.photo}
                  alt={patient.name}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-vet-primary/20 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-vet-primary/10 flex items-center justify-center border-2 border-vet-primary/20">
                  <PawPrint className="w-8 h-8 text-vet-primary" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Espaciador para el header fijo */}
      <div className="h-40 lg:h-40"></div>

      {/* Formulario */}
      <div className={`${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <form id="grooming-form" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Componente de Formulario Actualizado */}
              <GroomingServiceForm 
                register={register} 
                errors={errors} 
                paymentMethods={paymentMethods}
                selectedPaymentMethod={selectedPaymentMethodData}
              />

              {/* Botones - Ahora ambos en el formulario */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate(`/patients/${patientId}`)}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold transition-all duration-200 disabled:opacity-50"
                >
                  {isPending ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isPending ? "Guardando..." : "Guardar Servicio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}