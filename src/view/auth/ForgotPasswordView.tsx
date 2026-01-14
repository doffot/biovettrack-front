import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import type { ForgotPasswordForm } from "../../types";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import { Mail, CheckCircle2, Shield } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordView() {
  const initialValues: ForgotPasswordForm = { email: '' };
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: initialValues });

  const { mutate, isPending } = useMutation({
    mutationFn: forgotPassword,
    onError: (error: any) => {
      toast.error(error.message || 'Error al enviar las instrucciones');
    },
    onSuccess: (data) => {  
      toast.success(data || "Instrucciones enviadas al email");
      setIsSubmitted(true);
    }
  });
  
  const handleForgotPassword = (formData: ForgotPasswordForm) => mutate(formData);

  // Vista de éxito después de enviar
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=1200')",
          }}
        />
        <div className="absolute inset-0 bg-slate-900/90"></div>

        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20">
          <Link
            to="/auth/login"
            className="text-white text-sm md:text-base font-semibold px-4 py-2 md:px-6 md:py-2.5 rounded-lg bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all shadow-lg"
          >
            Iniciar Sesión
          </Link>
        </div>

        <div className="absolute inset-0 flex items-center justify-center z-10 p-4 md:p-8">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-6 md:mb-8">
              <img
                src="/logo_main.svg"
                alt="BioVetTrack Logo"
                className="h-32 md:h-40 w-auto drop-shadow-2xl"
              />
            </div>

            <div className="text-center space-y-4 md:space-y-6">
              <div className="inline-flex items-center justify-center w-16 md:w-20 h-16 md:h-20 bg-green-500/20 backdrop-blur-sm rounded-full border-2 border-green-400/50">
                <CheckCircle2 className="w-8 md:w-10 h-8 md:h-10 text-green-400" />
              </div>
              
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-3 drop-shadow-lg">
                  ¡Correo enviado!
                </h1>
                
                <p className="text-white/90 text-sm md:text-base leading-relaxed max-w-sm mx-auto">
                  Hemos enviado las instrucciones para restablecer tu contraseña a tu correo electrónico.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-white/80 bg-white/10 backdrop-blur-sm rounded-lg px-3 md:px-4 py-2 md:py-3 border border-white/20">
                <Shield className="w-4 md:w-5 h-4 md:h-5 text-vet-accent" />
                <span>El enlace expira en 30 minutos</span>
              </div>

              <Link
                to="/auth/login"
                className="inline-flex items-center justify-center w-full bg-vet-primary text-white font-bold py-3 md:py-3.5 text-sm md:text-base rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-[8px_8px_16px_rgba(8,95,122,0.4),-8px_-8px_16px_rgba(54,188,212,0.2)] hover:shadow-[12px_12px_24px_rgba(8,95,122,0.5),-12px_-12px_24px_rgba(54,188,212,0.3)] border-2 border-vet-accent/30"
              >
                Volver al inicio de sesión
              </Link>

              <p className="text-white/70 text-xs md:text-sm mt-4 md:mt-6">
                ¿No recibes el email? Revisa tu carpeta de spam
              </p>
            </div>

            <p className="text-center text-[10px] md:text-xs text-white/70 font-medium mt-6 md:mt-8 drop-shadow-md">
              © 2024 BioVetTrack. Sistema profesional de gestión veterinaria.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=1200')",
        }}
      />
      <div className="absolute inset-0 bg-slate-900/90"></div>

      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20">
        <Link
          to="/auth/login"
          className="text-white text-sm md:text-base font-semibold px-4 py-2 md:px-6 md:py-2.5 rounded-lg bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all shadow-lg"
        >
          Iniciar Sesión
        </Link>
      </div>

      <div className="absolute inset-0 flex flex-col lg:flex-row z-10">
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
          <div className="max-w-xl">
            <h1 className="text-7xl lg:text-8xl font-black text-white leading-tight mb-6 drop-shadow-2xl">
              BioVetTrack
            </h1>
            <p className="text-3xl lg:text-4xl font-bold text-vet-accent drop-shadow-lg mb-8">
              Recupera tu acceso
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-6 w-6 text-vet-accent flex-shrink-0" />
                <span className="text-base font-medium">
                  Proceso seguro y rápido
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-6 w-6 text-vet-accent flex-shrink-0" />
                <span className="text-base font-medium">
                  Enlace temporal de 30 minutos
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-6 w-6 text-vet-accent flex-shrink-0" />
                <span className="text-base font-medium">
                  Protección de datos garantizada
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-6 md:mb-8">
              <img
                src="/logo_main.svg"
                alt="BioVetTrack Logo"
                className="h-32 md:h-48 w-auto drop-shadow-2xl"
              />
            </div>

            <div className="lg:hidden mb-4 md:mb-6 text-center">
              <h1 className="text-2xl md:text-3xl font-black text-white mb-1 md:mb-2 drop-shadow-lg">
                BioVetTrack
              </h1>
              <p className="text-base md:text-lg font-bold text-vet-accent drop-shadow-lg">
                Recupera tu acceso
              </p>
            </div>

            <div className="mb-4 md:mb-6 text-center">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">Recuperar contraseña</h2>
              <p className="text-white/90 text-xs md:text-sm font-medium leading-relaxed">
                Te enviaremos un enlace seguro para restablecer tu contraseña
              </p>
            </div>

            <form onSubmit={handleSubmit(handleForgotPassword)} className="space-y-4 md:space-y-5">
              <div>
                <div className="relative">
                  <div className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Mail className="h-4 md:h-5 w-4 md:w-5 text-white/70" />
                  </div>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                    className={`w-full pl-9 md:pl-11 pr-3 md:pr-4 py-3 md:py-3.5 text-sm md:text-base bg-transparent border rounded-xl text-white placeholder-white/50 font-medium focus:outline-none transition-all
                      autofill:bg-transparent autofill:text-white
                      autofill:shadow-[0_0_0_1000px_transparent_inset]
                      autofill:[-webkit-text-fill-color:white]
                      ${
                      errors.email
                        ? "border-red-400 focus:ring-0"
                        : "border-white/50 focus:border-vet-primary"
                    }`}
                    style={{
                      WebkitBoxShadow: "0 0 0 1000px transparent inset",
                      WebkitTextFillColor: "white",
                    }}
                    {...register("email", {
                      required: "El correo electrónico es obligatorio",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Correo electrónico no válido",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-300 text-[10px] md:text-xs mt-1.5 md:mt-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg font-semibold bg-black/20 backdrop-blur-sm">
                    {errors.email.message as string}
                  </p>
                )}
              </div>

              <div className="flex justify-center pt-1 md:pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-vet-primary text-white font-bold py-3 md:py-3.5 text-sm md:text-base rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-[8px_8px_16px_rgba(8,95,122,0.4),-8px_-8px_16px_rgba(54,188,212,0.2)] hover:shadow-[12px_12px_24px_rgba(8,95,122,0.5),-12px_-12px_24px_rgba(54,188,212,0.3)] border-2 border-vet-accent/30"
                >
                  {isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 md:w-5 h-4 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </div>
                  ) : (
                    "Enviar instrucciones"
                  )}
                </button>
              </div>
            </form>

            <p className="text-center text-[10px] md:text-xs text-white/70 font-medium mt-4 md:mt-6 drop-shadow-md">
              © 2024 BioVetTrack. Sistema profesional de gestión veterinaria.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}