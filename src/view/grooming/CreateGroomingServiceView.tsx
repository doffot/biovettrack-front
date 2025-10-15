// src/views/grooming/CreateGroomingServiceView.tsx
import  { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Sparkles, Heart, Scissors } from "lucide-react";

// Importar el componente de formulario separado

// API

// Types
import type { GroomingServiceFormData } from "../../types";
import { createGroomingService } from "../../api/groomingAPI";
import { toast } from "../../components/Toast";
import FloatingParticles from "../../components/FloatingParticles";
import BackButton from "../../components/BackButton";
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
    <div className="relative min-h-screen bg-gradient-to-br from-space-navy via-space-navy/95 to-space-navy/90 overflow-hidden font-inter">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-coral-pulse/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-coral-pulse/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-coral-pulse/15 rounded-full blur-3xl animate-pulse-soft" 
             style={{ animationDelay: '1s' }} />
        
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-lavender-fog/10 rounded-full blur-3xl animate-float" 
             style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-10 w-56 h-56 bg-electric-mint/5 rounded-full blur-3xl animate-pulse-soft" 
             style={{ animationDelay: '3s' }} />
      </div>

      {/* Geometric Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, #ff5e5b 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, #39ff14 1px, transparent 1px),
            linear-gradient(45deg, rgba(255,94,91,0.1) 1px, transparent 1px),
            linear-gradient(-45deg, rgba(57,255,20,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px, 150px 150px, 75px 75px, 75px 75px",
          backgroundPosition: "0 0, 50px 50px, 0 0, 37px 37px"
        }}
      />

      <FloatingParticles />

      {/* Back Button */}
      <div className="fixed top-6 left-6 z-50">
        <BackButton />
      </div>

      {/* Minimalist Header Section */}
      <div className="relative pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div
            className={`text-center transform transition-all duration-1200 ease-out ${
              mounted 
                ? "translate-y-0 opacity-100 scale-100" 
                : "translate-y-16 opacity-0 scale-95"
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-4">
              {/* Icono pequeño y minimalista */}
              <div className="w-6 h-6 text-coral-pulse">
                <Scissors className="w-full h-full" />
              </div>
              {/* Título */}
              <h1 className="text-2xl sm:text-3xl font-bold text-misty-lilac">
                Nuevo Servicio de Peluquería
              </h1>
              {/* Subtítulo */}
              <p className="text-sm sm:text-base text-lavender-fog/80 max-w-md text-center leading-relaxed">
                Registra un nuevo servicio de estética canina para el paciente.
              </p>
              {/* Decoración mínima */}
              <div className="flex justify-center items-center gap-2 text-coral-pulse/40">
                <Heart className="w-3 h-3" />
                <Sparkles className="w-4 h-4" />
                <Heart className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="relative px-4 sm:px-6 lg:px-8 pb-20 mt-12">
        <div className="max-w-4xl mx-auto">
          <div
            className={`transform transition-all duration-1200 ease-out delay-300 ${
              mounted 
                ? "translate-y-0 opacity-100" 
                : "translate-y-16 opacity-0"
            }`}
          >
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-coral-pulse/10 via-coral-pulse/20 to-coral-pulse/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="relative bg-space-navy/90 backdrop-blur-xl border-2 border-coral-pulse/20 rounded-3xl p-8 sm:p-10 lg:p-12 shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-coral-pulse/[0.02] via-transparent to-lavender-fog/[0.02] rounded-3xl" />
                <div className="relative z-10">
                  {/* Componente de Formulario Separado */}
                  <GroomingServiceForm register={register} errors={errors} />

                  {/* Submit Button */}
                  <div className="mt-12 text-center">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="group relative inline-flex items-center justify-center px-8 py-4 sm:px-12 sm:py-6 bg-gradient-to-r from-coral-pulse/20 via-coral-pulse/30 to-coral-pulse/20 border-2 border-coral-pulse/40 rounded-2xl text-misty-lilac font-bold text-lg sm:text-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-coral-pulse/60 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-coral-pulse/10 to-transparent animate-shimmer" />
                      <div className="relative z-10 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-coral-pulse/20">
                          <Save className={`w-6 h-6 text-coral-pulse transition-transform duration-300 ${
                            isPending ? "animate-spin" : "group-hover:scale-110"
                          }`} />
                        </div>
                        <div className="text-left">
                          <div className="text-misty-lilac font-bold">
                            {isPending ? "Guardando..." : "Guardar Servicio"}
                          </div>
                          <div className="text-lavender-fog text-sm">
                            {isPending ? "Procesando datos..." : "Crear nuevo registro de estética"}
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 w-3 h-3 bg-coral-pulse rounded-full animate-pulse opacity-60" />
                    </button>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-3xl border border-coral-pulse/10 shadow-[inset_0_1px_0_rgba(255,94,91,0.1)]" />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}