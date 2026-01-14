import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { confirmAccount } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import type { confirmToken } from "../../types";
import { Mail, Shield, CheckCircle2 } from "lucide-react";

export default function ConfirmAccountView() {
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: confirmAccount,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      toast.success(data || "Cuenta confirmada");
      navigate("/auth/login");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<confirmToken>({
    defaultValues: {
      token: "",
    },
  });

  const onSubmit = (token: confirmToken) => {
    mutate(token);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Fondo principal - Imagen completa */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=1200')",
        }}
      />

      {/* Overlay - Más oscuro */}
      <div className="absolute inset-0 bg-slate-900/90"></div>

      {/* Iniciar Sesión - Esquina superior derecha */}
      <div className="absolute top-8 right-8 z-20">
        <Link
          to="/auth/login"
          className="text-white font-semibold px-6 py-2.5 rounded-lg bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all shadow-lg"
        >
          Iniciar Sesión
        </Link>
      </div>

      {/* Contenedor principal con dos columnas */}
      <div className="absolute inset-0 flex z-10">
        {/* Columna izquierda - Título grande */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="max-w-xl">
            <h1 className="text-7xl lg:text-8xl font-black text-white leading-tight mb-6 drop-shadow-2xl">
              BioVetTrack
            </h1>
            <p className="text-3xl lg:text-4xl font-bold text-vet-accent drop-shadow-lg mb-8">
              ¡Ya casi estás listo!
            </p>
            
            {/* Características */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-6 w-6 text-vet-accent flex-shrink-0" />
                <span className="text-base font-medium">
                  Acceso completo al sistema
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-6 w-6 text-vet-accent flex-shrink-0" />
                <span className="text-base font-medium">
                  Gestiona pacientes y citas
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-6 w-6 text-vet-accent flex-shrink-0" />
                <span className="text-base font-medium">
                  Soporte técnico incluido
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Formulario */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img
                src="/logo_main.svg"
                alt="BioVetTrack Logo"
                className="h-48 w-auto drop-shadow-2xl"
              />
            </div>

            {/* Título */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Confirmar Cuenta</h2>
              <p className="text-white/90 text-sm font-medium leading-relaxed">
                Ingresa el código de 6 dígitos enviado a tu email
              </p>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <Shield className="w-5 h-5 text-vet-accent" />
              <span className="text-sm text-white font-medium">Verificación segura</span>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className={`w-full px-6 py-4 bg-transparent border-2 rounded-xl text-white text-center text-3xl font-bold tracking-[0.5em] placeholder-white/30 focus:outline-none transition-all
                    autofill:bg-transparent autofill:text-white
                    autofill:shadow-[0_0_0_1000px_transparent_inset]
                    autofill:[-webkit-text-fill-color:white]
                    ${
                    errors.token 
                      ? 'border-red-400 focus:ring-0' 
                      : 'border-white/50 focus:border-vet-primary'
                  }`}
                  style={{
                    WebkitBoxShadow: "0 0 0 1000px transparent inset",
                    WebkitTextFillColor: "white",
                  }}
                  {...register("token", {
                    required: "El código es obligatorio",
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: "Debe ser un código de 6 dígitos",
                    },
                  })}
                />
                {errors.token && (
                  <p className="text-red-300 text-xs mt-2 px-3 py-1.5 rounded-lg font-semibold bg-black/20 backdrop-blur-sm text-center">
                    {errors.token.message as string}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-vet-primary text-white font-bold py-3.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-[8px_8px_16px_rgba(8,95,122,0.4),-8px_-8px_16px_rgba(54,188,212,0.2)] hover:shadow-[12px_12px_24px_rgba(8,95,122,0.5),-12px_-12px_24px_rgba(54,188,212,0.3)] border-2 border-vet-accent/30"
                >
                  {isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Confirmando...</span>
                    </div>
                  ) : (
                    "Confirmar Cuenta"
                  )}
                </button>
              </div>
            </form>

            {/* Links adicionales */}
            <div className="mt-6 pt-5 border-t border-white/20 text-center space-y-3">
              <p className="text-white/80 text-sm">
                ¿No recibiste el código?
              </p>
              <Link
                to="/auth/request-new-token"
                className="inline-flex items-center justify-center gap-2 text-vet-accent hover:text-white font-medium transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                Solicitar nuevo código
              </Link>
            </div>

            {/* Help Text */}
            <div className="mt-4 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <p className="text-white/70 text-xs text-center">
                💡 Revisa tu bandeja de spam si no encuentras el correo
              </p>
            </div>

            {/* Copyright */}
            <p className="text-center text-xs text-white/70 font-medium mt-6 drop-shadow-md">
              © 2024 BioVetTrack. Sistema profesional de gestión veterinaria.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}