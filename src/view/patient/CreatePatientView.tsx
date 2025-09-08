import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, PawPrint, Sparkles, Heart } from "lucide-react";
import BackButton from "../../components/BackButton";
import FloatingParticles from "../../components/FloatingParticles";
import PatientForm from "../../components/patients/PatientForm";
import type { PatientFormData } from "../../types";
import { toast } from "../../components/Toast";
import { createPatient } from "../../api/patientAPI";
import { defaultPhotoFile } from "../../utils/defaultPhoto";

export default function CreatePatientView() {
  const { ownerId } = useParams<{ ownerId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormData>({
    defaultValues: {
      name: "",
      birthDate: "",
      species: "",
      breed: "",
      sex: undefined,
      weight: 0,
      photo: undefined,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: PatientFormData) => {
      // Si no hay ownerId, lanzamos un error de inmediato
      if (!ownerId) {
        throw new Error("ID del dueño no encontrado en la URL");
      }

      // Preparamos el FormData para la petición
      const form = new FormData();
      form.append("name", data.name);
      form.append("birthDate", data.birthDate);
      form.append("species", data.species);
      form.append("sex", data.sex);
      if (data.breed) form.append("breed", data.breed);
      if (data.weight) form.append("weight", String(data.weight));
      
      // Manejo de la foto: si hay una, la usamos; si no, cargamos la por defecto
      if (data.photo && data.photo.length > 0) {
        form.append("photo", data.photo[0]);
      } else {
        const defaultPng = await defaultPhotoFile();
        form.append("photo", defaultPng);
      }

      // Llamamos a la API con los dos argumentos
      return await createPatient(form, ownerId);
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al registrar mascota");
    },
    onSuccess: () => {
      toast.success("Mascota registrada con éxito");
      // Invalidamos la caché para que la lista de mascotas del dueño se actualice
      queryClient.invalidateQueries({ queryKey: ["patients", { ownerId }] });
      navigate(`/owners/${ownerId}`);
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = (data: PatientFormData) => mutate(data);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-space-navy via-space-navy/95 to-space-navy/90 overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Coral orbs for pet theme */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-coral-pulse/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-coral-pulse/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-coral-pulse/15 rounded-full blur-3xl animate-pulse-soft" 
             style={{ animationDelay: '1s' }} />
        
        {/* Supporting colors */}
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
            linear-gradient(45deg, rgba(255, 94, 91, 0.1) 1px, transparent 1px),
            linear-gradient(-45deg, rgba(57, 255, 20, 0.1) 1px, transparent 1px)
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

      {/* Header Section */}
      <div className="relative pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div
            className={`text-center transform transition-all duration-1200 ease-out ${
              mounted 
                ? "translate-y-0 opacity-100 scale-100" 
                : "translate-y-16 opacity-0 scale-95"
            }`}
          >
            {/* Main Header Card */}
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-coral-pulse/20 via-coral-pulse/30 to-coral-pulse/20 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative bg-space-navy/80 backdrop-blur-xl border-2 border-coral-pulse/30 rounded-3xl p-8 sm:p-10 shadow-2xl">
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-coral-pulse/5 via-transparent to-lavender-fog/5 rounded-3xl" />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon Container */}
                  <div className="relative mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-coral-pulse/20 to-coral-pulse/10 rounded-2xl border-2 border-coral-pulse/30 shadow-lg">
                      <PawPrint className="w-10 h-10 text-coral-pulse animate-pulse-soft" />
                    </div>
                    
                    {/* Floating decorative elements */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-coral-pulse/20 rounded-full animate-float" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-electric-mint/30 rounded-full animate-pulse-soft" 
                         style={{ animationDelay: '1s' }} />
                  </div>

                  {/* Title */}
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-coral-pulse via-misty-lilac to-coral-pulse bg-clip-text text-transparent">
                    Nueva Mascota
                  </h1>

                  {/* Subtitle */}
                  <p className="text-lg sm:text-xl text-lavender-fog/90 mb-6 max-w-2xl mx-auto leading-relaxed">
                    Registra a tu compañero peludo con amor y cuidado
                  </p>

                  {/* Decorative Hearts */}
                  <div className="flex justify-center items-center gap-4 text-coral-pulse/40">
                    <Heart className="w-4 h-4 animate-pulse-soft" />
                    <Sparkles className="w-5 h-5 animate-float" />
                    <Heart className="w-4 h-4 animate-pulse-soft" style={{ animationDelay: '0.5s' }} />
                  </div>
                </div>

                {/* Border Glow */}
                <div className="absolute inset-0 rounded-3xl border border-coral-pulse/20 shadow-[inset_0_1px_0_rgba(255,94,91,0.1)]" />
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
            {/* Form Container */}
            <div className="relative group">
              {/* Outer Glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-coral-pulse/10 via-coral-pulse/20 to-coral-pulse/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="relative bg-space-navy/90 backdrop-blur-xl border-2 border-coral-pulse/20 rounded-3xl p-8 sm:p-10 lg:p-12 shadow-2xl"
              >
                {/* Form Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-coral-pulse/[0.02] via-transparent to-lavender-fog/[0.02] rounded-3xl" />
                
                {/* Form Content */}
                <div className="relative z-10">
                  <PatientForm register={register} errors={errors} />

                  {/* Submit Button */}
                  <div className="mt-12 text-center">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="group relative inline-flex items-center justify-center px-8 py-4 sm:px-12 sm:py-6 bg-gradient-to-r from-coral-pulse/20 via-coral-pulse/30 to-coral-pulse/20 border-2 border-coral-pulse/40 rounded-2xl text-misty-lilac font-bold text-lg sm:text-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-coral-pulse/60 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                    >
                      {/* Button Background Animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-coral-pulse/10 to-transparent animate-shimmer" />
                      
                      <div className="relative z-10 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-coral-pulse/20">
                          <Save className={`w-6 h-6 text-coral-pulse transition-transform duration-300 ${
                            isPending ? "animate-spin" : "group-hover:scale-110"
                          }`} />
                        </div>
                        
                        <div className="text-left">
                          <div className="text-misty-lilac font-bold">
                            {isPending ? "Guardando..." : "Guardar Mascota"}
                          </div>
                          <div className="text-lavender-fog text-sm">
                            {isPending ? "Procesando datos..." : "Crear nuevo registro"}
                          </div>
                        </div>
                      </div>

                      {/* Pulse Indicator */}
                      <div className="absolute top-3 right-3 w-3 h-3 bg-coral-pulse rounded-full animate-pulse opacity-60" />
                    </button>
                  </div>
                </div>

                {/* Form Border Effects */}
                <div className="absolute inset-0 rounded-3xl border border-coral-pulse/10 shadow-[inset_0_1px_0_rgba(255,94,91,0.1)]" />
              </form>
            </div>
          </div>
        </div>
      </div>

     
    </div>
  );
}