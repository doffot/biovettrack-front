import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { updatePasswordWithToken } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import type { confirmToken, NewPasswordForm } from "../../types";
import { Lock, Shield, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type NewPasswordFormProps = {
  token: confirmToken["token"];
};

export default function NewPasswordFormComponent({ token }: NewPasswordFormProps) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initialValues: NewPasswordForm = {
    password: "",
    confirmPassword: "",
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: initialValues });

  const { mutate, isPending } = useMutation({
    mutationFn: updatePasswordWithToken,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      toast.success(data || "Contraseña actualizada");
      reset();
      navigate("/auth/login");
    },
  });

  const handleNewPassword = (formData: NewPasswordForm) => {
    const data = {
      formData,
      token,
    };
    mutate(data);
  };

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

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
        <button
          onClick={() => navigate("/auth/login")}
          className="text-white font-semibold px-6 py-2.5 rounded-lg bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all shadow-lg"
        >
          Iniciar Sesión
        </button>
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
              Seguridad Primero
            </p>
            
            {/* Características */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-6 w-6 text-vet-accent flex-shrink-0" />
                <span className="text-base font-medium">
                  Protege datos sensibles
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-6 w-6 text-vet-accent flex-shrink-0" />
                <span className="text-base font-medium">
                  Cumple con normativas de seguridad
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-6 w-6 text-vet-accent flex-shrink-0" />
                <span className="text-base font-medium">
                  Acceso seguro 24/7
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-vet-accent/20 backdrop-blur-sm rounded-full mb-4 border-2 border-vet-accent/50">
                <Lock className="w-8 h-8 text-vet-accent" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Nueva Contraseña</h2>
              <p className="text-white/90 text-sm font-medium leading-relaxed">
                Establece una contraseña segura para tu cuenta
              </p>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <Shield className="w-5 h-5 text-vet-accent" />
              <span className="text-sm text-white font-medium">Contraseña segura</span>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit(handleNewPassword)} className="space-y-4">
              
              {/* Password Field */}
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nueva contraseña (mínimo 8 caracteres)"
                    autoComplete="new-password"
                    className={`w-full px-4 pr-20 py-3 bg-transparent border rounded-xl text-white placeholder-white/50 font-medium focus:outline-none transition-all
                      autofill:bg-transparent autofill:text-white
                      autofill:shadow-[0_0_0_1000px_transparent_inset]
                      autofill:[-webkit-text-fill-color:white]
                      ${
                      errors.password
                        ? "border-red-400 focus:ring-0"
                        : "border-white/50 focus:border-vet-primary"
                    }`}
                    style={{
                      WebkitBoxShadow: "0 0 0 1000px transparent inset",
                      WebkitTextFillColor: "white",
                    }}
                    {...register("password", {
                      required: "La contraseña es obligatoria",
                      minLength: {
                        value: 8,
                        message: "Mínimo 8 caracteres",
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 right-3 text-white/70 hover:text-vet-accent transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-300 text-xs mt-2 px-3 py-1.5 rounded-lg font-semibold bg-black/20 backdrop-blur-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmar contraseña"
                    autoComplete="new-password"
                    className={`w-full px-4 pr-20 py-3 bg-transparent border rounded-xl text-white placeholder-white/50 font-medium focus:outline-none transition-all
                      autofill:bg-transparent autofill:text-white
                      autofill:shadow-[0_0_0_1000px_transparent_inset]
                      autofill:[-webkit-text-fill-color:white]
                      ${
                      errors.confirmPassword
                        ? "border-red-400 focus:ring-0"
                        : confirmPassword && password === confirmPassword
                        ? "border-green-400 focus:border-green-400"
                        : "border-white/50 focus:border-vet-primary"
                    }`}
                    style={{
                      WebkitBoxShadow: "0 0 0 1000px transparent inset",
                      WebkitTextFillColor: "white",
                    }}
                    {...register("confirmPassword", {
                      required: "Debes confirmar la contraseña",
                      validate: (value) =>
                        value === password || "Las contraseñas no coinciden",
                    })}
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-2">
                    {confirmPassword && password === confirmPassword && (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-white/70 hover:text-vet-accent transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-300 text-xs mt-2 px-3 py-1.5 rounded-lg font-semibold bg-black/20 backdrop-blur-sm">
                    {errors.confirmPassword.message}
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
                      <span>Actualizando...</span>
                    </div>
                  ) : (
                    "Establecer Contraseña"
                  )}
                </button>
              </div>
            </form>

            {/* Recomendaciones */}
            <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <p className="text-white/90 text-xs font-medium mb-2">Recomendaciones de seguridad:</p>
              <div className="space-y-1.5 text-white/70 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-vet-accent rounded-full"></div>
                  <span>Mínimo 8 caracteres</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-vet-accent rounded-full"></div>
                  <span>Incluye mayúsculas y minúsculas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-vet-accent rounded-full"></div>
                  <span>Agrega números y símbolos</span>
                </div>
              </div>
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