import { useState, useEffect } from "react";
import { Save, UserPlus } from "lucide-react";
import OwnerForm from "./OwnerForm";
import { useForm } from "react-hook-form";
import type { Owner, OwnerFormData } from "../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOwners } from "../../api/OwnerAPI";
import { toast } from "../Toast";
import { useNavigate } from "react-router-dom";
import BackButton from "../BackButton";

// Componente: Partículas flotantes
const FloatingParticles: React.FC = () => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 4,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute bg-primary/20 rounded-full animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
            boxShadow: "0 0 10px rgba(57, 255, 20, 0.3)",
          }}
        />
      ))}
    </div>
  );
};

type EditOwnerformProps = {
  data: OwnerFormData;
  ownerId: Owner["_id"];
};

export default function EditOwnerform({ data, ownerId }: EditOwnerformProps) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      name: data.name,
      contact: data.contact,
      email: data.email,
      address: data.address,
    },
  });

  const queryClient = useQueryClient();

  // update owner
  const { mutate } = useMutation({
    mutationFn: updateOwners,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      queryClient.refetchQueries({ queryKey: ["editOwners", ownerId] });
      toast.success(data.msg);
      navigate(-1); // ← vuelve a la página anterior
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleForm = (formData: OwnerFormData) => {
    const data = {
      formData,
      ownerId,
    };
    mutate(data);
    navigate("/owners");
  };

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

      {/* Botón fijo de regreso */}
      <div className="fixed top-20 z-150">
        <BackButton/>
      </div>

      {/* Header Section */}
      <div className="relative z-10 pt-20 px-4 sm:px-6 mb-8">
        <div className="max-w-2xl mx-auto text-center">
          <div 
            className={`transform transition-all duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 logo-glow">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text title-shine mb-2">
              Actualizar Propietario
            </h1>
            <p className="text-muted text-sm sm:text-base">Actualiza la información del propietario</p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="relative z-10 px-4 sm:px-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <div 
            className={`transform transition-all duration-1000 delay-300 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="relative overflow-hidden rounded-2xl border-2 bg-gradient-radial-center backdrop-blur-sm bg-background/40 border-muted/20 shadow-premium">
              {/* Efecto shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
              
              <form
                className="relative z-10 p-6 sm:p-8"
                onSubmit={handleSubmit(handleForm)}
                noValidate
              >
                <OwnerForm 
                  register={register} 
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                />

                <div className="pt-6 mt-6 border-t border-muted/20">
                  <button
                    type="submit"
                    className="group w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-black px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold shadow-premium hover:shadow-premium-hover transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
                  >
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-sm sm:text-base">Actualizar Propietario</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </button>
                </div>
              </form>

              {/* Decoración de esquina */}
              <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full animate-neon-pulse opacity-60" />
              
              {/* Líneas decorativas */}
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60" />
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}