import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import OwnerForm from "../../components/owners/OwnerForm";
import BackButton from "../../components/BackButton";
import type { OwnerFormData } from "../../types";
import { createOwner } from "../../api/OwnerAPI";
import { useNavigate } from "react-router-dom";
import { toast } from "../../components/Toast";
import { useMutation } from "@tanstack/react-query";
import { Save, UserPlus } from "lucide-react";
import FloatingParticles from "../../components/FloatingParticles";

// Componente: Partículas flotantes
<FloatingParticles/>

export default function CreateOwnerView() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  const initialValues: OwnerFormData = {
    name: "",
    contact: "",
    email: "",
    address: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
  });

  // crear dueño
  const { mutate, isPending } = useMutation({
    mutationFn: createOwner,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      toast.success(data.msg);
      navigate(`/owners/${data.owner._id}`);
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleForm = async (formData: OwnerFormData) => mutate(formData);

  return (
    <div className="relative min-h-screen bg-gradient-dark overflow-hidden">
      {/* Fondo decorativo */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(57, 255, 20, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(57, 255, 20, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />

      <FloatingParticles />
      
      <div className="fixed top-22 left-7  z-150 ">
        <BackButton />
      </div>

      {/* Header */}
      <div className="relative  pt-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div
            className={`text-center mt-8 transform transition-all duration-1000 delay-200 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="relative overflow-hidden rounded-2xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-primary/10 border-primary/30 p-6 mb-8 inline-block">
              {/* Efecto shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

              <div className="relative z-10">
                <div className="p-4 rounded-xl bg-black/20 text-primary mx-auto mb-4 w-fit">
                  <UserPlus className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold text-text title-shine mb-2">
                  Nuevo Propietario
                </h1>
                <p className="text-muted text-sm">
                  Registra la información del nuevo propietario
                </p>
              </div>

              {/* Decoración de esquina */}
              <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full animate-neon-pulse opacity-60" />

              {/* Líneas decorativas */}
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60" />
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="relative z-10 px-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <div
            className={`transform transition-all duration-1000 delay-500 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <form
              className="relative overflow-hidden rounded-2xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-background/40 border-muted/20 shadow-premium p-8"
              onSubmit={handleSubmit(handleForm)}
              noValidate
            >
              {/* Efecto shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <OwnerForm register={register} errors={errors} />

                <button
                  type="submit"
                  disabled={isPending}
                  className="group relative overflow-hidden rounded-2xl border-2 bg-gradient-radial-center backdrop-blur-sm hover:shadow-premium-hover hover:scale-105 transition-all duration-300 cursor-pointer bg-primary/20 border-primary/30 p-4 w-full flex items-center justify-center gap-3 mt-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {/* Efecto shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

                  <div className="relative z-10 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-black/20 text-primary">
                      <Save
                        className={`w-5 h-5 transition-transform duration-300 ${
                          isPending ? "animate-spin" : "group-hover:scale-110"
                        }`}
                      />
                    </div>
                    <div className="text-left">
                      <div className="text-text font-bold text-base">
                        {isPending ? "Guardando..." : "Guardar Propietario"}
                      </div>
                      <div className="text-muted text-xs">
                        {isPending
                          ? "Procesando datos..."
                          : "Crear nuevo registro"}
                      </div>
                    </div>
                  </div>

                  {/* Decoración de esquina */}
                  <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-neon-pulse opacity-60" />
                </button>
              </div>

              {/* Decoración de esquina del form */}
              <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full animate-neon-pulse opacity-60" />

              {/* Líneas decorativas */}
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60" />
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
